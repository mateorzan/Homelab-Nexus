// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/server.js';
import { Aggregator } from '../src/aggregator.js';
import type { ServiceConfig } from '../src/types.js';

const EMPTY_SERVICES: ServiceConfig[] = [];

describe('CORS: solo el propio host (CSRF)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({
      aggregator: new Aggregator(EMPTY_SERVICES, {}, 5000),
      raw: { port: 0, host: '127.0.0.1', pollIntervalMs: 5000 },
      services: EMPTY_SERVICES,
    });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('no refleja orígenes ajenos', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/health',
      headers: { origin: 'http://evil.example', host: 'dashboard.local:3000' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('permite el mismo host por hostname', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/summary',
      headers: { origin: 'http://dashboard.local:3000', host: 'dashboard.local:3000' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://dashboard.local:3000');
  });

  it('permite el mismo host por IP', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/summary',
      headers: { origin: 'http://192.0.2.10:3000', host: '192.0.2.10:3000' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://192.0.2.10:3000');
  });

  it('el preflight de un origen ajeno no recibe permiso', async () => {
    const res = await app.inject({
      method: 'OPTIONS',
      url: '/api/summary',
      headers: { origin: 'http://evil.example', host: 'dashboard.local:3000' },
    });
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('el preflight del mismo host recibe los headers', async () => {
    const res = await app.inject({
      method: 'OPTIONS',
      url: '/api/summary',
      headers: { origin: 'http://dashboard.local:3000', host: 'dashboard.local:3000' },
    });
    expect(res.statusCode).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://dashboard.local:3000');
    expect(res.headers['access-control-allow-methods']).toContain('POST');
  });

  it('las peticiones sin Origin (curl) siguen funcionando', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('ok');
  });
});
