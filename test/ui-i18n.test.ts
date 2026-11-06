// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');

const MESSAGE = {
  id: 1,
  appId: 1,
  appName: 'Operations',
  title: 'Sample notification',
  message: 'Sample message',
  priority: 1,
  date: Date.now(),
};

function summaryFixture() {
  return {
    generatedAt: Date.now(),
    overallStatus: 'warning',
    services: [
      {
        id: 'beszel', name: 'Beszel', icon: 'server', status: 'up', url: 'http://beszel.example.local',
        health: '1 sistema', checkTime: Date.now(),
        metrics: { kind: 'beszel', systems: [{ name: 'ServerAlpha', status: 'up', cpu: 10, mem: 20, disk: 30, temp: null, uptime: 60, load: [1, 1, 1] }], worstCpu: 10, worstMem: 20 },
      },
      {
        id: 'gotify', name: 'Gotify', icon: 'info', status: 'up', url: 'http://gotify.example.local',
        health: '1 mensaje', checkTime: Date.now(),
        metrics: { kind: 'gotify', totalMessages: 1, apps: [{ id: 1, name: 'Operations', count: 1, critical: 0 }], messages: [MESSAGE], lastMessage: MESSAGE },
      },
    ],
    alerts: [{ id: 'beszel-down-serverbeta', level: 'critical', source: 'Infraestructura · Beszel · ServerBeta', message: 'El nodo ServerBeta de Beszel esta caido', time: Date.now(), state: 'unread' }],
    resolvedAlerts: [],
  };
}

class FakeEventSource {
  static last: FakeEventSource | null = null;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  constructor() { FakeEventSource.last = this; }
  close(): void { /* noop */ }
  emit(payload: unknown): void { this.onmessage?.({ data: JSON.stringify(payload) }); }
}

function makeFetchMock() {
  return vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    let data: unknown = {};
    if (url.includes('/api/summary')) data = summaryFixture();
    else if (url.includes('/api/health')) data = { status: 'ok', version: 'dev' };
    else if (url.includes('/api/config')) data = { bgImage: null, bgBlur: 20, bgPresets: [], beszelUrl: 'http://beszel.example.local' };
    else if (url.includes('/api/bookmarks')) data = { bookmarks: [] };
    else if (url.includes('/api/monitor-urls')) data = { urls: {} };
    return Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
  });
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 25));

describe('UI localization (English and Spanish)', () => {
  beforeAll(async () => {
    localStorage.clear();
    Object.defineProperty(navigator, 'language', { configurable: true, value: 'en-US' });

    const html = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf-8');
    const body = html
      .slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'))
      .replace(/<script[\s\S]*?<\/script>/g, '');
    document.body.innerHTML = body;

    vi.stubGlobal('fetch', makeFetchMock());
    vi.stubGlobal('EventSource', FakeEventSource);

    await import(/* @vite-ignore */ '../public/app.js');
    await flush();
    FakeEventSource.last?.emit(summaryFixture());
    await flush();
  });

  afterAll(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('detects English from the browser locale and translates static and dynamic UI', () => {
    expect(document.documentElement.lang).toBe('en');
    expect(document.querySelector('.hero-status')?.textContent).toBe('Attention');
    expect(document.getElementById('settings-btn')?.getAttribute('aria-label')).toBe('Settings');
    expect([...document.querySelectorAll('.hstat-l')].map((el) => el.textContent)).toContain('Systems');
    expect(document.querySelector('#gotify-filter .chip-chip')?.textContent).toBe('All apps');

    document.getElementById('notif-btn')?.click();
    expect(document.querySelector('.notif-action[aria-label="Mark as read"]')).toBeTruthy();
    expect(document.querySelector('.notif-item-src')?.textContent).toContain('Infrastructure');
  });

  it('allows switching to Spanish and remembers the choice for this browser', async () => {
    document.getElementById('settings-btn')?.click();
    const select = document.getElementById('language-select') as HTMLSelectElement | null;
    expect(select).toBeTruthy();
    if (!select) return;

    select.value = 'es';
    select.dispatchEvent(new Event('change'));
    await flush();

    expect(document.documentElement.lang).toBe('es');
    expect(document.querySelector('.hero-status')?.textContent).toBe('Atención');
    expect(document.getElementById('settings-btn')?.getAttribute('aria-label')).toBe('Configuración');
    expect(document.querySelector('#gotify-filter .chip-chip')?.textContent).toBe('Todas las apps');
    expect(document.querySelector('.notif-action[aria-label="Marcar como leída"]')).toBeTruthy();
    expect(localStorage.getItem('homelab-nexus-language')).toBe('es');
  });
});
