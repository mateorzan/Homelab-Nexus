// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Aggregator } from '../src/aggregator.js';
import { AlertsStore } from '../src/alerts-store.js';
import type { BeszelSystemMetric, ProviderResult, ServiceConfig } from '../src/types.js';

const mocks = vi.hoisted(() => ({
  beszel: { check: vi.fn() },
  uptimekuma: { check: vi.fn() },
  gotify: { check: vi.fn() },
  opnsense: { check: vi.fn() },
}));

vi.mock('../src/providers/beszel.js', () => mocks.beszel);
vi.mock('../src/providers/uptimekuma.js', () => mocks.uptimekuma);
vi.mock('../src/providers/gotify.js', () => mocks.gotify);
vi.mock('../src/providers/opnsense.js', () => mocks.opnsense);

const BESZEL_SVC: ServiceConfig = { id: 'beszel', name: 'Beszel', icon: '', url: 'http://beszel.test' };
const GOTIFY_SVC: ServiceConfig = { id: 'gotify', name: 'Gotify', icon: '', url: 'http://gotify.test' };

function node(name: string, status: 'up' | 'down'): BeszelSystemMetric {
  return { name, status, cpu: 10, mem: 20, disk: 30, temp: null, uptime: 100, load: [1, 1, 1] };
}

function beszelUp(...systems: BeszelSystemMetric[]): ProviderResult {
  return {
    status: 'up',
    health: `${systems.length} nodos`,
    metrics: { kind: 'beszel', systems, worstCpu: 10, worstMem: 20 },
  };
}

const BESZEL_DOWN: ProviderResult = { status: 'down', health: 'timeout tras 6s' };
const GOTIFY_UP: ProviderResult = { status: 'up', health: 'ok' };
const GOTIFY_DOWN: ProviderResult = { status: 'down', health: 'ECONNREFUSED' };

let tmpDir: string;
let store: AlertsStore;
let aggregator: Aggregator;

beforeEach(() => {
  vi.clearAllMocks();
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-infra-'));
  store = new AlertsStore(path.join(tmpDir, 'state.json'));
  aggregator = new Aggregator([BESZEL_SVC, GOTIFY_SVC], {}, 60_000);
  aggregator.setAlertStateStore(store);
  mocks.beszel.check.mockResolvedValue(beszelUp(node('ServerAlpha', 'up')));
  mocks.gotify.check.mockResolvedValue(GOTIFY_UP);
});

afterEach(() => {
  aggregator.stop();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('alertas de infraestructura por transicion', () => {
  it('un servicio que cae genera UNA alerta critica (sin duplicar con el poll de 1s)', async () => {
    expect((await aggregator.pollAll()).alerts).toHaveLength(0);

    mocks.beszel.check.mockResolvedValue(BESZEL_DOWN);
    const down1 = await aggregator.pollAll();
    expect(down1.alerts).toHaveLength(1);
    expect(down1.alerts[0]).toMatchObject({
      id: 'svc-down-beszel',
      level: 'critical',
      state: 'unread',
      source: 'Infraestructura · Beszel',
    });
    expect(down1.alerts[0].message).toContain('Beszel');

    const down2 = await aggregator.pollAll();
    expect(down2.alerts).toHaveLength(1);
  });

  it('se resuelve sola al volver y conserva el snapshot', async () => {
    mocks.beszel.check.mockResolvedValue(BESZEL_DOWN);
    await aggregator.pollAll();

    mocks.beszel.check.mockResolvedValue(beszelUp(node('ServerAlpha', 'up')));
    const up = await aggregator.pollAll();
    expect(up.alerts).toHaveLength(0);
    expect(up.resolvedAlerts).toHaveLength(1);
    expect(up.resolvedAlerts[0]).toMatchObject({ id: 'svc-down-beszel', state: 'resolved' });
    expect(store.get('svc-down-beszel')).toBe('resolved');
  });

  it('si vuelve a caer reaparece como no leida', async () => {
    mocks.beszel.check.mockResolvedValue(BESZEL_DOWN);
    await aggregator.pollAll();
    mocks.beszel.check.mockResolvedValue(beszelUp(node('ServerAlpha', 'up')));
    await aggregator.pollAll();
    expect(store.get('svc-down-beszel')).toBe('resolved');

    mocks.beszel.check.mockResolvedValue(BESZEL_DOWN);
    const again = await aggregator.pollAll();
    expect(again.alerts).toHaveLength(1);
    expect(again.alerts[0].state).toBe('unread');
  });

  it('alerta por cada nodo de Beszel caido, con id estable', async () => {
    mocks.beszel.check.mockResolvedValue(beszelUp(node('ServerAlpha', 'up'), node('ServerBeta', 'up')));
    await aggregator.pollAll();

    mocks.beszel.check.mockResolvedValue(beszelUp(node('ServerAlpha', 'down'), node('ServerBeta', 'down')));
    const both = await aggregator.pollAll();
    expect(both.alerts.map((a) => a.id).sort()).toEqual(['beszel-down-serveralpha', 'beszel-down-serverbeta']);
    expect(both.alerts[0].message).toMatch(/nodo .+ ca[ií]do/);

    mocks.beszel.check.mockResolvedValue(beszelUp(node('ServerAlpha', 'up'), node('ServerBeta', 'down')));
    const one = await aggregator.pollAll();
    expect(one.alerts.map((a) => a.id)).toEqual(['beszel-down-serverbeta']);
    expect(one.resolvedAlerts.map((a) => a.id)).toEqual(['beszel-down-serveralpha']);
    expect(store.get('beszel-down-serveralpha')).toBe('resolved');
  });

  it('Gotify caido no genera alerta de infraestructura (sus mensajes ya son la senal)', async () => {
    mocks.gotify.check.mockResolvedValue(GOTIFY_DOWN);
    const s = await aggregator.pollAll();
    expect(s.alerts).toHaveLength(0);
    expect(s.resolvedAlerts).toHaveLength(0);
  });

  it('el estado general queda en ambar (Atencion), nunca en rojo', async () => {
    mocks.beszel.check.mockResolvedValue(BESZEL_DOWN);
    const s = await aggregator.pollAll();
    expect(s.overallStatus).toBe('warning');
  });
});
