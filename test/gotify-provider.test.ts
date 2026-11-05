import { describe, it, expect, afterEach, vi } from 'vitest';
import { check } from '../src/providers/gotify.js';
import type { ProviderCtx } from '../src/types.js';

const CTX: ProviderCtx = {
  service: { id: 'gotify', name: 'Gotify', icon: '', url: 'http://gotify.test' },
  credentials: { gotifyToken: 'token' },
};

const APPS = [{ id: 1, name: 'Servicios', description: '' }];
const HOUR = 3_600_000;

function stub(messages: unknown[]): void {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    const data = url.includes('/application') ? APPS : { messages };
    return { ok: true, json: async () => data };
  }));
}

describe('Gotify: estado del servicio según recencia', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('un mensaje critico antiguo no deja el servicio caido', async () => {
    stub([
      { id: 1, appid: 1, title: 'Boom', message: 'algo falló', priority: 9, date: Date.now() - 90 * 24 * HOUR },
    ]);
    const res = await check(CTX);
    expect(res.status).toBe('up');
  });

  it('un mensaje critico reciente deja el servicio caido', async () => {
    stub([
      { id: 2, appid: 1, title: 'Boom', message: 'algo falló', priority: 9, date: Date.now() - HOUR },
    ]);
    const res = await check(CTX);
    expect(res.status).toBe('down');
  });

  it('un aviso reciente degrada el servicio', async () => {
    stub([
      { id: 3, appid: 1, title: 'Aviso', message: 'revisar', priority: 6, date: Date.now() - HOUR },
    ]);
    const res = await check(CTX);
    expect(res.status).toBe('degraded');
  });

  it('los avisos antiguos tampoco degradan', async () => {
    stub([
      { id: 4, appid: 1, title: 'Aviso', message: 'revisar', priority: 6, date: Date.now() - 5 * 24 * HOUR },
    ]);
    const res = await check(CTX);
    expect(res.status).toBe('up');
  });
});
