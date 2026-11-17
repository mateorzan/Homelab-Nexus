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

function pressEscape(): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
}

describe('UI accesibilidad (teclado)', () => {
  let open: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    Object.defineProperty(navigator, 'language', { configurable: true, value: 'es-ES' });
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

  it('los nodos de Beszel son enlaces reales (teclado, clic central, copiar enlace)', () => {
    const node = document.querySelector('a.node') as HTMLAnchorElement;
    expect(node).toBeTruthy();
    expect(node.getAttribute('href')).toBe('http://beszel.local');
    expect(node.target).toBe('_blank');
    expect(node.rel).toContain('noopener');
    expect(node.getAttribute('role')).toBeNull();
  });

  it('los bookmarks son enlaces reales y el boton de quitar es hermano, no hijo', () => {
    const link = document.querySelector('a.bookmark-link') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('http://nas.local');
    expect(link.querySelector('button')).toBeNull();
    const rm = document.querySelector('.bookmark-rm') as HTMLButtonElement;
    expect(rm.getAttribute('aria-label')).toBe('Quitar NAS');
    expect(open).not.toHaveBeenCalled();
  });

  it('los botones de los dropdowns exponen aria-expanded y el badge entra en el nombre accesible', () => {
    const btn = document.getElementById('notif-btn')!;
    const dd = document.getElementById('notif-dropdown')!;
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(btn.getAttribute('aria-label')).toBe('Notificaciones, 1 sin leer');
    btn.click();
    expect(dd.hidden).toBe(false);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    pressEscape();
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('el foco del teclado sobrevive a los re-renders de SSE (regresion: se reconstruia el DOM cada segundo)', async () => {
    const btn = document.getElementById('notif-btn')!;
    btn.click();
    const action = document.querySelector('.notif-action') as HTMLButtonElement;
    action.focus();
    expect(document.activeElement).toBe(action);

    FakeEventSource.last?.emit(summaryFixture());
    await flush();
    FakeEventSource.last?.emit(summaryFixture());
    await flush();

    expect(document.activeElement).toBe(action);
    expect(document.querySelector('.notif-action')).toBe(action);
    const node = document.querySelector('a.node');
    FakeEventSource.last?.emit(summaryFixture());
    await flush();
    expect(document.querySelector('a.node')).toBe(node);
    document.getElementById('notif-btn')!.click();
  });

  it('los ajustes no aceptan una URL de fondo con esquema javascript:', () => {
    const input = document.getElementById('bg-input') as HTMLInputElement;
    input.value = 'javascript:alert(1)';
    (document.getElementById('bg-apply') as HTMLButtonElement).click();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(document.documentElement.style.getPropertyValue('--bg-image')).not.toContain('javascript');
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
