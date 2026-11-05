// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');

interface AlertFixture {
  id: string;
  level: string;
  source: string;
  message: string;
  time: number;
  state: string;
}

const UNREAD: AlertFixture = {
  id: 'gotify-11',
  level: 'critical',
  source: 'Gotify · Backup',
  message: 'Backup falló',
  time: Date.now() - 60_000,
  state: 'unread',
};

const RESOLVED: AlertFixture = {
  id: 'gotify-12',
  level: 'critical',
  source: 'Gotify · Backup',
  message: 'Servidor caído',
  time: Date.now() - 300_000,
  state: 'resolved',
};

function summaryFixture() {
  return {
    generatedAt: Date.now(),
    overallStatus: 'warning',
    services: [],
    alerts: [{ ...UNREAD }],
    resolvedAlerts: [{ ...RESOLVED }],
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

type FetchArgs = [input: RequestInfo | URL, init?: RequestInit];

function makeFetchMock() {
  return vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    let data: unknown = {};
    if (url.includes('/api/summary')) data = summaryFixture();
    else if (url.includes('/api/health')) data = { status: 'ok', version: 'dev' };
    else if (url.includes('/api/config')) data = { bgImage: null, bgBlur: 20, bgPresets: [] };
    else if (url.includes('/api/bookmarks')) data = { bookmarks: [] };
    else if (url.includes('/api/monitor-urls')) data = { urls: {} };
    else data = {};
    void init;
    return Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
  });
}

const flush = () => new Promise((r) => setTimeout(r, 20));

describe('UI notificaciones (dropdown de alertas)', () => {
  let fetchMock: ReturnType<typeof makeFetchMock>;

  beforeAll(async () => {
    const html = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf-8');
    const body = html
      .slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'))
      .replace(/<script[\s\S]*?<\/script>/g, '');
    document.body.innerHTML = body;

    fetchMock = makeFetchMock();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('EventSource', FakeEventSource);

    const appPath: string = '../public/app.js';
    await import(/* @vite-ignore */ appPath);

    await flush();
    FakeEventSource.last?.emit(summaryFixture());
    await flush();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('pinta la versión (dev) en la esquina inferior derecha', () => {
    expect(document.getElementById('app-version')?.textContent).toBe('dev');
  });

  it('abre Resueltas sin que el click cierre el dropdown', () => {
    const dropdown = document.getElementById('notif-dropdown')!;
    const btn = document.getElementById('notif-btn')!;
    btn.click();
    expect(dropdown.hidden).toBe(false);

    const head = document.querySelector('.notif-resolved-head') as HTMLButtonElement;
    expect(head).toBeTruthy();
    expect(head.textContent).toContain('Resueltas (1)');

    head.click();
    expect(document.querySelector('.notif-resolved')?.classList.contains('open')).toBe(true);
    expect(dropdown.hidden).toBe(false);
  });

  it('mantiene Resueltas abiertas tras un update de SSE', () => {
    FakeEventSource.last?.emit(summaryFixture());
    expect(document.querySelector('.notif-resolved')?.classList.contains('open')).toBe(true);
    expect(document.getElementById('notif-dropdown')?.hidden).toBe(false);
  });

  it('marcar como leída hace el POST y actualiza el badge de forma optimista', async () => {
    const unreadItem = document.querySelector('.notif-item.critical:not(.is-read):not(.is-resolved)') as HTMLElement;
    expect(unreadItem).toBeTruthy();
    const action = unreadItem.querySelector('.notif-action') as HTMLButtonElement;
    expect(action).toBeTruthy();

    action.click();
    await flush();

    const post = (fetchMock.mock.calls as FetchArgs[]).find(
      ([u, init]) =>
        String(u).includes('/api/alerts/gotify-11/state') &&
        init?.method === 'POST',
    );
    expect(post).toBeTruthy();
    expect(document.getElementById('notif-badge')?.hidden).toBe(true);
    expect(document.querySelector('.notif-item.critical.is-read')).toBeTruthy();
  });

  it('el botón "Marcar todas como leídas" hace POST a read-all', async () => {
    FakeEventSource.last?.emit(summaryFixture());
    await flush();
    const btn = document.getElementById('notif-read-all') as HTMLButtonElement;
    expect(btn.hidden).toBe(false);

    btn.click();
    await flush();

    const post = (fetchMock.mock.calls as FetchArgs[]).find(
      ([u, init]) => String(u).includes('/api/alerts/read-all') && init?.method === 'POST',
    );
    expect(post).toBeTruthy();
    expect(document.getElementById('notif-badge')?.hidden).toBe(true);
  });

  it('click en notificación abre popup de detalle', async () => {
    FakeEventSource.last?.emit(summaryFixture());
    await flush();

    const item = document.querySelector('.notif-item.critical') as HTMLElement;
    expect(item).toBeTruthy();

    item.click();
    await flush();

    const popup = document.querySelector('.notif-detail-popup') as HTMLElement;
    expect(popup).toBeTruthy();
    expect(popup.hidden).toBe(false);
    expect(popup.textContent).toContain('Gotify · Backup');
    expect(popup.textContent).toContain('Backup falló');
  });

  it('click fuera del popup lo cierra', async () => {
    const popup = document.querySelector('.notif-detail-popup') as HTMLElement;
    expect(popup).toBeTruthy();

    const closeBtn = popup.querySelector('.notif-detail-close') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    closeBtn.click();
    await flush();

    expect(popup.hidden).toBe(true);
  });

  it('pinta las alertas de infraestructura y el estado queda en ambar, no en rojo', async () => {
    FakeEventSource.last?.emit({
      generatedAt: Date.now(),
      overallStatus: 'warning',
      services: [{ id: 'beszel', name: 'Beszel', icon: '', status: 'down', url: 'http://beszel', health: 'timeout', checkTime: Date.now() }],
      alerts: [{
        id: 'beszel-down-backup',
        level: 'critical',
        source: 'Infraestructura · Beszel · ServerAlpha',
        message: 'El nodo ServerAlpha de Beszel esta caido',
        time: Date.now(),
        state: 'unread',
      }],
      resolvedAlerts: [],
    });
    await flush();

    const items = [...document.querySelectorAll('.notif-item:not(.is-resolved)')];
    const infra = items.find((i) => i.textContent?.includes('Infraestructura'));
    expect(infra).toBeTruthy();
    expect(infra?.textContent).toContain('ServerAlpha');

    // Decision de producto: ante una caida el dashboard va a "Atencion"
    // (ambar), nunca a "Critico" (rojo).
    const pill = document.getElementById('status')!;
    expect(pill.classList.contains('warning')).toBe(true);
    expect(pill.classList.contains('critical')).toBe(false);
  });
});
