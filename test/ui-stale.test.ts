// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');

const SYSTEMS_METRICS = {
  kind: 'beszel',
  systems: [
    { name: 'ServerAlpha', status: 'up', cpu: 12.3, mem: 45, disk: 50, temp: 41, uptime: 1000, load: [1, 1, 1] },
  ],
  worstCpu: 12.3,
  worstMem: 45,
};

function beszelUp() {
  return {
    id: 'beszel',
    name: 'Beszel',
    icon: 'server',
    status: 'up',
    url: 'http://beszel',
    health: '1 nodos',
    checkTime: Date.now(),
    metrics: SYSTEMS_METRICS,
  };
}

function beszelStale() {
  return { ...beszelUp(), status: 'unknown', health: 'timeout tras 6s', metricsStaleSince: Date.now() - 15 * 60_000 };
}

function summaryFixture(services: unknown[]) {
  return { generatedAt: Date.now(), overallStatus: 'ok', services, alerts: [], resolvedAlerts: [] };
}

class FakeEventSource {
  static last: FakeEventSource | null = null;
  onopen: (() => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  constructor() {
    FakeEventSource.last = this;
  }
  close(): void { /* noop */ }
  emit(payload: unknown): void {
    this.onmessage?.({ data: JSON.stringify(payload) });
  }
}

function makeFetchMock() {
  return vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    let data: unknown = {};
    if (url.includes('/api/summary')) data = summaryFixture([]);
    else if (url.includes('/api/health')) data = { status: 'ok', version: 'dev' };
    else if (url.includes('/api/config')) data = { bgImage: null, bgBlur: 20, bgPresets: [], beszelUrl: null };
    else if (url.includes('/api/bookmarks')) data = { bookmarks: [] };
    else if (url.includes('/api/monitor-urls')) data = { urls: {} };
    void init;
    return Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
  });
}

const flush = () => new Promise((r) => setTimeout(r, 20));

describe('UI honestidad: métricas caducadas y "en vivo"', () => {
  beforeAll(async () => {
    Object.defineProperty(navigator, 'language', { configurable: true, value: 'es-ES' });
    const html = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf-8');
    const body = html
      .slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'))
      .replace(/<script[\s\S]*?<\/script>/g, '');
    document.body.innerHTML = body;

    vi.stubGlobal('fetch', makeFetchMock());
    vi.stubGlobal('EventSource', FakeEventSource);

    await import(/* @vite-ignore */ '../public/app.js');

    await flush();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('Beszel se marca como caducado cuando deja de responder (conservando el último dato)', async () => {
    FakeEventSource.last?.emit(summaryFixture([beszelUp()]));
    await flush();
    const wrap = document.getElementById('beszel-wrap')!;
    expect(wrap.hidden).toBe(false);
    expect(wrap.classList.contains('stale')).toBe(false);

    FakeEventSource.last?.emit(summaryFixture([beszelStale()]));
    await flush();

    expect(wrap.classList.contains('stale')).toBe(true);
    const note = wrap.querySelector('.stale-note') as HTMLElement;
    expect(note).toBeTruthy();
    expect(note.hidden).toBe(false);
    expect(note.textContent).toContain('15m');
    // El último dato sigue visible (apagado), no desaparece.
    expect(document.querySelector('#beszel .node-name')?.textContent).toBe('ServerAlpha');
  });

  it('el aviso de caducidad desaparece cuando el servicio se recupera', async () => {
    FakeEventSource.last?.emit(summaryFixture([beszelUp()]));
    await flush();
    const wrap = document.getElementById('beszel-wrap')!;
    expect(wrap.classList.contains('stale')).toBe(false);
    expect((wrap.querySelector('.stale-note') as HTMLElement).hidden).toBe(true);
  });

  it('el indicador "en vivo" refleja la desconexión del SSE', async () => {
    FakeEventSource.last?.emit(summaryFixture([beszelUp()]));
    await flush();

    FakeEventSource.last?.onerror?.();

    const indicator = document.getElementById('live-indicator')!;
    expect(indicator.classList.contains('reconnecting') || indicator.classList.contains('offline')).toBe(true);
    expect(indicator.textContent).toContain('reconectando');
  });

  it('actualizaciones antiguas se marcan como "sin conexión"', async () => {
    FakeEventSource.last?.emit({ ...summaryFixture([beszelUp()]), generatedAt: Date.now() - 120_000 });
    await flush();

    const lastUpdate = document.getElementById('last-update')!;
    expect(lastUpdate.classList.contains('stale')).toBe(true);
    expect(lastUpdate.textContent).toContain('sin conexión');
  });
});
