// @vitest-environment node
import { describe, it, expect, afterEach, vi } from 'vitest';
import { check } from '../src/providers/beszel.js';
import type { ProviderCtx } from '../src/types.js';

const CTX: ProviderCtx = {
  service: { id: 'beszel', name: 'Beszel', icon: '', url: 'http://beszel.test' },
  credentials: { beszelUserEmail: 'a@b.c', beszelUserPassword: 'secret' },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Beszel: estado del hub', () => {
  it('si el hub no responde devuelve down (es una caida, no un unknown)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('ECONNREFUSED');
    }));
    const r = await check(CTX);
    expect(r.status).toBe('down');
    expect(r.health).toContain('ECONNREFUSED');
  });

  it('accesible pero sin sistemas sigue en unknown', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('auth-with-password')) return { ok: true, json: async () => ({ token: 'tok' }) };
      return { ok: true, json: async () => ({ items: [] }) };
    }));
    const r = await check(CTX);
    expect(r.status).toBe('unknown');
    expect(r.health).toContain('sin sistemas');
  });
});
