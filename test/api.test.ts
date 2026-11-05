import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/server.js';
import { Aggregator } from '../src/aggregator.js';
import type { ServiceConfig } from '../src/types.js';

const EMPTY_SERVICES: ServiceConfig[] = [];
const EMPTY_CREDS: Record<string, string | undefined> = {};

function createTestAggregator(): Aggregator {
  return new Aggregator(EMPTY_SERVICES, EMPTY_CREDS, 5000);
}

describe('API routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    const aggregator = createTestAggregator();
    app = await buildApp({
      aggregator,
      raw: { port: 0, host: '127.0.0.1', pollIntervalMs: 5000 },
      services: EMPTY_SERVICES,
    });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health returns status ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('ok');
    expect(body).toHaveProperty('uptime');
    expect(body).toHaveProperty('memoryMb');
    expect(body.version).toBe(process.env.APP_VERSION || 'dev');
  });

  it('GET /api/summary returns summary response', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/summary' });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body).toHaveProperty('generatedAt');
    expect(body).toHaveProperty('overallStatus');
    expect(body).toHaveProperty('services');
    expect(body).toHaveProperty('alerts');
    expect(Array.isArray(body.services)).toBe(true);
    expect(Array.isArray(body.alerts)).toBe(true);
  });

  it('GET /api/services/:id returns 404 for unknown service', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/services/nonexistent' });
    expect(res.statusCode).toBe(404);
    const body = res.json();
    expect(body).toHaveProperty('error');
  });

  it('GET /unknown-api returns 404 json', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/unknown' });
    expect(res.statusCode).toBe(404);
    const body = res.json();
    expect(body).toHaveProperty('error');
  });

  it('GET /api/monitor-urls usa las URLs por defecto de las credenciales', async () => {
    const localAgg = createTestAggregator();
    const localApp = await buildApp({
      aggregator: localAgg,
      raw: { port: 0, host: '127.0.0.1', pollIntervalMs: 5000 },
      services: EMPTY_SERVICES,
      credentials: { uptimekumaMonitorUrls: '{"ping":"http://kuma.local/ping"}' },
    });
    await localApp.ready();

    const res = await localApp.inject({ method: 'GET', url: '/api/monitor-urls' });
    expect(res.statusCode).toBe(200);
    expect(res.json().urls.ping).toBe('http://kuma.local/ping');
    await localApp.close();
  });

  it('POST /api/config/bg rechaza valores invalidos', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/config/bg',
      headers: { 'Content-Type': 'application/json' },
      payload: { bgBlur: 'no-es-un-numero' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('acepta imagenes de fondo grandes (bodyLimit por encima de 1MB)', () => {
    expect((app.initialConfig as { bodyLimit?: number }).bodyLimit).toBe(8 * 1024 * 1024);
  });
});
