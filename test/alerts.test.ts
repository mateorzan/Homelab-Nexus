import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/server.js';
import { Aggregator } from '../src/aggregator.js';
import { AlertsStore } from '../src/alerts-store.js';
import type { Alert, ServiceSummary, SummaryResponse } from '../src/types.js';

const SEED_ALERT: Alert = {
  id: 'gotify-101',
  level: 'critical',
  source: 'Gotify · Uptime',
  message: 'Servidor caído: backup falló',
  time: 1_700_000_000_000,
};

type AggregatorInternals = {
  lastSummaries: Map<string, ServiceSummary>;
  lastSummary: SummaryResponse | null;
  generatedAt: number;
};

function seedAggregator(agg: Aggregator, alerts: Alert[]): void {
  const internal = agg as unknown as AggregatorInternals;
  const svc: ServiceSummary = {
    id: 'gotify',
    name: 'Gotify',
    icon: 'bell',
    status: 'down',
    url: 'http://gotify',
    health: '1 criticos',
    checkTime: Date.now(),
    alerts,
  };
  internal.generatedAt = Date.now();
  internal.lastSummaries = new Map([[svc.id, svc]]);
  internal.lastSummary = {
    generatedAt: internal.generatedAt,
    overallStatus: 'ok',
    services: [svc],
    alerts,
    resolvedAlerts: [],
  };
  agg.refresh();
}

describe('Alerts state', () => {
  let tmpDir: string;
  let statePath: string;
  let store: AlertsStore;
  let aggregator: Aggregator;
  let app: FastifyInstance;

  beforeEach(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'alerts-test-'));
    statePath = path.join(tmpDir, 'alerts-state.json');
    store = new AlertsStore(statePath);
    aggregator = new Aggregator([], {}, 5000);
    seedAggregator(aggregator, [{ ...SEED_ALERT }]);
    app = await buildApp({
      aggregator,
      raw: { port: 0, host: '127.0.0.1', pollIntervalMs: 5000 },
      services: [],
      alertsStore: store,
    });
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('las alertas nuevas salen como unread en el summary', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/summary' });
    const body = res.json();
    expect(body.alerts).toHaveLength(1);
    expect(body.alerts[0].state).toBe('unread');
    expect(body.resolvedAlerts).toEqual([]);
  });

  it('marcar como leída cambia el estado y persiste en disco', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/alerts/gotify-101/state',
      headers: { 'Content-Type': 'application/json' },
      payload: { state: 'read' },
    });
    expect(res.statusCode).toBe(200);

    const summary = await app.inject({ method: 'GET', url: '/api/summary' });
    expect(summary.json().alerts[0].state).toBe('read');

    const reloaded = new AlertsStore(statePath);
    expect(reloaded.get('gotify-101')).toBe('read');
  });

  it('resolver mueve la alerta de alerts a resolvedAlerts', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/alerts/gotify-101/state',
      headers: { 'Content-Type': 'application/json' },
      payload: { state: 'resolved' },
    });

    const summary = await app.inject({ method: 'GET', url: '/api/summary' });
    const body = summary.json();
    expect(body.alerts).toEqual([]);
    expect(body.resolvedAlerts).toHaveLength(1);
    expect(body.resolvedAlerts[0].id).toBe('gotify-101');
    expect(body.resolvedAlerts[0].state).toBe('resolved');
    expect(body.resolvedAlerts[0].message).toBe(SEED_ALERT.message);
  });

  it('restaurar una alerta resuelta la vuelve a activa como read', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/alerts/gotify-101/state',
      headers: { 'Content-Type': 'application/json' },
      payload: { state: 'resolved' },
    });
    await app.inject({
      method: 'POST',
      url: '/api/alerts/gotify-101/state',
      headers: { 'Content-Type': 'application/json' },
      payload: { state: 'read' },
    });

    const summary = await app.inject({ method: 'GET', url: '/api/summary' });
    const body = summary.json();
    expect(body.alerts).toHaveLength(1);
    expect(body.alerts[0].state).toBe('read');
    expect(body.resolvedAlerts).toEqual([]);
  });

  it('read-all marca todas las activas como leídas', async () => {
    const second: Alert = { ...SEED_ALERT, id: 'gotify-102', time: SEED_ALERT.time + 1 };
    seedAggregator(aggregator, [{ ...SEED_ALERT }, second]);

    const res = await app.inject({ method: 'POST', url: '/api/alerts/read-all' });
    expect(res.statusCode).toBe(200);
    expect(res.json().count).toBe(2);

    const summary = await app.inject({ method: 'GET', url: '/api/summary' });
    const body = summary.json();
    expect(body.alerts).toHaveLength(2);
    expect(body.alerts.every((a: Alert) => a.state === 'read')).toBe(true);
  });

  it('cambiar estado emite un update por SSE inmediatamente', async () => {
    let emitted = 0;
    aggregator.on('update', () => { emitted += 1; });

    await app.inject({
      method: 'POST',
      url: '/api/alerts/gotify-101/state',
      headers: { 'Content-Type': 'application/json' },
      payload: { state: 'read' },
    });

    expect(emitted).toBe(1);
  });

  it('devuelve 404 para una alerta desconocida', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/alerts/desconocida/state',
      headers: { 'Content-Type': 'application/json' },
      payload: { state: 'read' },
    });
    expect(res.statusCode).toBe(404);
  });

  it('valida el cuerpo: state inválido devuelve 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/alerts/gotify-101/state',
      headers: { 'Content-Type': 'application/json' },
      payload: { state: 'otra-cosa' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('marcar como leída guarda el snapshot: resolverla luego no la hace desaparecer', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/alerts/gotify-101/state',
      headers: { 'Content-Type': 'application/json' },
      payload: { state: 'read' },
    });

    // La alerta sale de la ventana del provider: ya no aparece en el summary.
    seedAggregator(aggregator, []);

    const res = await app.inject({
      method: 'POST',
      url: '/api/alerts/gotify-101/state',
      headers: { 'Content-Type': 'application/json' },
      payload: { state: 'resolved' },
    });
    expect(res.statusCode).toBe(200);
    expect(store.getRecord(SEED_ALERT.id)).toBeTruthy();
    expect(store.resolvedRecords().some((r) => r.id === SEED_ALERT.id)).toBe(true);
  });
});

describe('AlertsStore', () => {
  let tmpDir: string;
  let statePath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'alerts-store-'));
    statePath = path.join(tmpDir, 'alerts-state.json');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('unread borra la entrada (estado por defecto)', () => {
    const store = new AlertsStore(statePath);
    store.set('a1', 'read');
    expect(store.get('a1')).toBe('read');
    store.set('a1', 'unread');
    expect(store.get('a1')).toBeUndefined();
    expect(new AlertsStore(statePath).get('a1')).toBeUndefined();
  });

  it('conserva el snapshot de la alerta resuelta', () => {
    const store = new AlertsStore(statePath);
    const record = {
      id: 'gotify-7',
      level: 'critical' as const,
      source: 'Gotify',
      message: 'algo falló',
      time: 123,
    };
    store.set('gotify-7', 'resolved', record);
    expect(store.resolvedRecords()).toEqual([record]);
    expect(new AlertsStore(statePath).resolvedRecords()).toEqual([record]);
  });

  it('arranca vacío si el archivo está corrupto', () => {
    fs.writeFileSync(statePath, 'esto no es json');
    const store = new AlertsStore(statePath);
    expect(store.get('x')).toBeUndefined();
    expect(store.resolvedRecords()).toEqual([]);
  });
});
