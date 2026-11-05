import { describe, it, expect, afterEach, vi } from 'vitest';
import { Aggregator, overallFrom } from '../src/aggregator.js';
import type { ServiceConfig, ServiceSummary } from '../src/types.js';

function svc(status: ServiceSummary['status']): ServiceSummary {
  return {
    id: 'x',
    name: 'X',
    icon: '',
    status,
    url: 'http://x',
    health: '',
    checkTime: 0,
  };
}

describe('overallFrom', () => {
  it('devuelve ok cuando todos los servicios estan arriba', () => {
    expect(overallFrom([svc('up'), svc('up')])).toBe('ok');
  });

  it('devuelve warning cuando alguno esta degradado', () => {
    expect(overallFrom([svc('up'), svc('degraded')])).toBe('warning');
  });

  it('devuelve warning cuando alguno esta caido (ambar, nunca rojo)', () => {
    expect(overallFrom([svc('up'), svc('down')])).toBe('warning');
  });

  it('prioriza warning sobre down', () => {
    expect(overallFrom([svc('degraded'), svc('down')])).toBe('warning');
  });
});

const GOTIFY_SVC: ServiceConfig = { id: 'gotify', name: 'Gotify', icon: '', url: 'http://gotify.test' };

function delayedGlobalFetch(counter: { n: number }, delayMs: number) {
  return vi.fn(async () => {
    counter.n += 1;
    await new Promise((r) => setTimeout(r, delayMs));
    return { ok: true, json: async () => [] };
  });
}

describe('Aggregator: los polls no se solapan', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('varias llamadas concurrentes a pollAll comparten un único poll en vuelo', async () => {
    const counter = { n: 0 };
    vi.stubGlobal('fetch', delayedGlobalFetch(counter, 60));
    const aggregator = new Aggregator([GOTIFY_SVC], { gotifyToken: 't' }, 60_000);

    const summaries = await Promise.all([
      aggregator.pollAll(),
      aggregator.pollAll(),
      aggregator.pollAll(),
      aggregator.pollAll(),
      aggregator.pollAll(),
    ]);

    // Cada poll hace 2 peticiones (application + message). Sin la guarda serían 10.
    expect(counter.n).toBe(2);
    expect(new Set(summaries).size).toBe(1);
  });

  it('getSummary sin snapshot no dispara un poll por cada request', async () => {
    const counter = { n: 0 };
    vi.stubGlobal('fetch', delayedGlobalFetch(counter, 80));
    const aggregator = new Aggregator([GOTIFY_SVC], { gotifyToken: 't' }, 60_000);

    aggregator.getSummary();
    aggregator.getSummary();
    aggregator.getSummary();
    await new Promise((r) => setTimeout(r, 10));

    // Un solo poll en vuelo (2 peticiones); sin la guarda serían 6.
    expect(counter.n).toBe(2);
  });

  it('conserva las ultimas metricas marcadas como caducas si el servicio deja de responder', async () => {
    let calls = 0;
    vi.stubGlobal('fetch', vi.fn(async () => {
      calls += 1;
      if (calls <= 2) return { ok: true, json: async () => [] };
      throw new Error('ECONNREFUSED');
    }));
    const aggregator = new Aggregator([GOTIFY_SVC], { gotifyToken: 't' }, 60_000);

    const first = await aggregator.pollAll();
    expect(first.services[0].metrics).toBeTruthy();
    expect(first.services[0].metricsStaleSince).toBeUndefined();

    await new Promise((r) => setTimeout(r, 5));
    const second = await aggregator.pollAll();
    expect(second.services[0].status).toBe('down');
    expect(second.services[0].metrics).toBeTruthy();
    expect(second.services[0].metricsStaleSince).toBeGreaterThan(0);
  });
});
