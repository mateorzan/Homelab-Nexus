// @vitest-environment node
import { describe, it, expect, afterEach, vi } from 'vitest';
import { check } from '../src/providers/uptimekuma.js';
import type { ProviderCtx } from '../src/types.js';

interface MockResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
}

function jsonResponse(data: unknown, status = 200): MockResponse {
  return { ok: status < 400, status, json: async () => data, text: async () => JSON.stringify(data) };
}

function notFound(): MockResponse {
  return { ok: false, status: 404, json: async () => ({}), text: async () => 'not found' };
}

function makeCtx(uptimekumaStatusPage?: string): ProviderCtx {
  return {
    service: { id: 'uptimekuma', name: 'Uptime Kuma', icon: '📈', url: 'http://kuma:3001' },
    credentials: { uptimekumaStatusPage },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Uptime Kuma: slug de la status page', () => {
  it('usa el slug que funciono para el heartbeat (pagina en /dashboard)', async () => {
    const requested: string[] = [];
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      requested.push(url);
      // La status page vive en /dashboard: /status responde 404.
      if (url.endsWith('/api/status-page/status')) return Promise.resolve(notFound());
      if (url.endsWith('/api/status-page/dashboard')) {
        // La fork no expone el estado en la status page: solo ids y nombres.
        return Promise.resolve(jsonResponse({ services: [{ monitors: [{ id: 1, name: 'Web' }] }] }));
      }
      if (url.endsWith('/api/status-page/heartbeat/dashboard')) {
        return Promise.resolve(jsonResponse({
          heartbeatList: { 1: [{ status: 1, time: 't', msg: 'Up', ping: 42 }] },
          uptimeList: { '1_24': '0.999' },
        }));
      }
      return Promise.resolve(notFound());
    }));

    const result = await check(makeCtx());

    expect(requested.some((u) => u.includes('/heartbeat/status'))).toBe(false);
    expect(requested.some((u) => u.includes('/heartbeat/dashboard'))).toBe(true);
    expect(result.status).toBe('up');
    const metrics = result.metrics as { monitors: { name: string; status: string; latency: number | null }[] };
    expect(metrics.monitors[0]).toMatchObject({ name: 'Web', status: 'up', latency: 42 });
  });

  it('si hay slug configurado lo usa tambien para el heartbeat', async () => {
    const requested: string[] = [];
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      requested.push(url);
      if (url.endsWith('/api/status-page/estado')) {
        return Promise.resolve(jsonResponse({ services: [{ monitors: [{ id: 7, name: 'NAS', status: 'up' }] }] }));
      }
      if (url.endsWith('/api/status-page/heartbeat/estado')) {
        return Promise.resolve(jsonResponse({
          heartbeatList: { 7: [{ status: 1, time: 't', msg: 'Up', ping: 10 }] },
          uptimeList: {},
        }));
      }
      return Promise.resolve(notFound());
    }));

    const result = await check(makeCtx('estado'));

    expect(requested.some((u) => u.includes('/heartbeat/estado'))).toBe(true);
    expect(result.status).toBe('up');
  });

  it('acepta el slug en formato /status/mi-pagina', async () => {
    const requested: string[] = [];
    vi.stubGlobal('fetch', vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      requested.push(url);
      if (url.endsWith('/api/status-page/mi-pagina')) {
        return Promise.resolve(jsonResponse({ publicGroupList: [{ monitorList: [{ id: 2, name: 'DNS', status: 'up' }] }] }));
      }
      if (url.endsWith('/api/status-page/heartbeat/mi-pagina')) {
        return Promise.resolve(jsonResponse({ heartbeatList: {}, uptimeList: {} }));
      }
      return Promise.resolve(notFound());
    }));

    const result = await check(makeCtx('/status/mi-pagina'));

    expect(requested.some((u) => u.includes('/heartbeat/mi-pagina'))).toBe(true);
    expect(result.status).toBe('up');
  });
});
