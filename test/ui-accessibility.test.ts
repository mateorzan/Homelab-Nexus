// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');

function summaryFixture() {
  return {
    generatedAt: Date.now(),
    overallStatus: 'ok',
    services: [
      {
        id: 'beszel',
        name: 'Beszel',
        icon: 'server',
        status: 'up',
        url: 'http://beszel.local',
        health: '1 nodos',
        checkTime: Date.now(),
        metrics: {
          kind: 'beszel',
          systems: [{ name: 'ServerAlpha', status: 'up', cpu: 5, mem: 10, disk: 20, temp: null, uptime: 100, load: [1, 1, 1] }],
          worstCpu: 5,
          worstMem: 10,
        },
      },
      {
        id: 'gotify',
        name: 'Gotify',
        icon: 'info',
        status: 'up',
        url: 'http://gotify.local',
        health: '1 mensajes',
        checkTime: Date.now(),
        metrics: {
          kind: 'gotify',
          totalMessages: 1,
          apps: [{ id: 1, name: 'Test', count: 1, critical: 0 }],
          messages: [{ id: 1, appId: 1, appName: 'Test', title: 'hola', message: 'mundo', priority: 1, date: Date.now() }],
          lastMessage: { id: 1, appId: 1, appName: 'Test', title: 'hola', message: 'mundo', priority: 1, date: Date.now() },
        },
      },
    ],
    alerts: [
      { id: 'gotify-1', level: 'critical', source: 'Gotify · Test', message: 'hola: mundo', time: Date.now(), state: 'unread' },
    ],
    resolvedAlerts: [],
  };
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
  return vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    let data: unknown = {};
    if (url.includes('/api/summary')) data = summaryFixture();
    else if (url.includes('/api/health')) data = { status: 'ok', version: 'dev' };
    else if (url.includes('/api/config')) data = { bgImage: null, bgBlur: 20, bgPresets: [], beszelUrl: 'http://beszel.local' };
    else if (url.includes('/api/bookmarks')) data = { bookmarks: [{ id: 'b1', title: 'NAS', url: 'http://nas.local' }] };
    else if (url.includes('/api/monitor-urls')) data = { urls: {} };
    return Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
  });
}

const flush = () => new Promise((r) => setTimeout(r, 20));

function pressEnter(node: Element): void {
  node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
}

function pressEscape(): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
}

describe('UI accesibilidad (teclado)', () => {
  let open: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    const html = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf-8');
    const body = html
      .slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'))
      .replace(/<script[\s\S]*?<\/script>/g, '');
    document.body.innerHTML = body;

    open = vi.fn();
    Object.defineProperty(window, 'open', { value: open, writable: true });

    vi.stubGlobal('fetch', makeFetchMock());
    vi.stubGlobal('EventSource', FakeEventSource);

    await import(/* @vite-ignore */ '../public/app.js');

    await flush();
    FakeEventSource.last?.emit(summaryFixture());
    await flush();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('los nodos de Beszel son operables con el teclado', () => {
    const node = document.querySelector('.node') as HTMLElement;
    expect(node).toBeTruthy();
    expect(node.getAttribute('role')).toBe('button');
    expect(node.tabIndex).toBe(0);

    pressEnter(node);
    expect(open).toHaveBeenCalledWith('http://beszel.local', '_blank', 'noopener');
  });

  it('los bookmarks son operables con el teclado', () => {
    const row = document.querySelector('.bookmark-item') as HTMLElement;
    expect(row).toBeTruthy();
    expect(row.getAttribute('role')).toBe('button');
    expect(row.tabIndex).toBe(0);

    pressEnter(row);
    expect(open).toHaveBeenCalledWith('http://nas.local', '_blank', 'noopener');
  });

  it('Escape cierra el dropdown de Configuración', () => {
    const btn = document.getElementById('settings-btn')!;
    const dd = document.getElementById('settings-dropdown')!;
    btn.click();
    expect(dd.hidden).toBe(false);

    pressEscape();
    expect(dd.hidden).toBe(true);
  });

  it('Escape cierra el panel de notificaciones', () => {
    const btn = document.getElementById('notif-btn')!;
    const dd = document.getElementById('notif-dropdown')!;
    btn.click();
    expect(dd.hidden).toBe(false);

    pressEscape();
    expect(dd.hidden).toBe(true);
  });

  it('los botones (estáticos y dinámicos) son type=button', () => {
    for (const id of ['notif-btn', 'settings-btn', 'notif-read-all', 'bookmark-add', 'svc-alert-close', 'bg-apply', 'bg-clear', 'bg-save-preset']) {
      const btn = document.getElementById(id) as HTMLButtonElement | null;
      expect(btn, id).toBeTruthy();
      expect(btn?.type, id).toBe('button');
    }

    const notifBtn = document.getElementById('notif-btn') as HTMLButtonElement;
    notifBtn.click();
    const action = document.querySelector('.notif-action') as HTMLButtonElement | null;
    expect(action).toBeTruthy();
    expect(action?.type).toBe('button');

    const chip = document.querySelector('#gotify-filter .chip-chip') as HTMLButtonElement | null;
    expect(chip).toBeTruthy();
    expect(chip?.type).toBe('button');
  });
});
