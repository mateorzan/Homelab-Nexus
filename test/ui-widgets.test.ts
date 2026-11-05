// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');

const ALERT = {
  id: 'gotify-11',
  level: 'critical',
  source: 'Gotify · Backup',
  message: 'Backup falló',
  time: Date.now() - 60_000,
  state: 'unread',
};

function svc(id: string, name: string, status: string) {
  return { id, name, icon: '', status, url: 'http://x', health: '', checkTime: Date.now() };
}

function summaryFixture(services: unknown[] = []) {
  return {
    generatedAt: Date.now(),
    overallStatus: 'ok',
    services,
    alerts: [{ ...ALERT }],
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
  return vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    let data: unknown = {};
    if (url.includes('/api/summary')) data = summaryFixture();
    else if (url.includes('/api/health')) data = { status: 'ok', version: 'dev' };
    else if (url.includes('/api/config')) data = { bgImage: null, bgBlur: 20, bgPresets: [], beszelUrl: null };
    else if (url.includes('/api/bookmarks')) data = { bookmarks: [] };
    else if (url.includes('/api/monitor-urls')) data = { urls: {} };
    void init;
    return Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
  });
}

const flush = () => new Promise((r) => setTimeout(r, 20));

describe('UI widgets (settings, banner de caídas, popup de detalle)', () => {
  beforeAll(async () => {
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
    vi.unstubAllGlobals();
  });

  it('el dropdown de Configuración no se cierra al hacer click dentro', () => {
    const btn = document.getElementById('settings-btn')!;
    const dropdown = document.getElementById('settings-dropdown')!;
    btn.click();
    expect(dropdown.hidden).toBe(false);

    (document.getElementById('bg-input') as HTMLInputElement).click();
    expect(dropdown.hidden).toBe(false);

    (document.getElementById('bg-blur') as HTMLInputElement).click();
    expect(dropdown.hidden).toBe(false);
  });

  it('el dropdown de Configuración se cierra al hacer click fuera', () => {
    document.body.click();
    expect(document.getElementById('settings-dropdown')!.hidden).toBe(true);
  });

  it('el banner de servicios caídos se puede cerrar y no reaparece en el siguiente render', async () => {
    FakeEventSource.last?.emit(summaryFixture([svc('beszel', 'Beszel', 'unknown')]));
    await flush();
    const banner = document.getElementById('svc-alert-banner')!;
    expect(banner.hidden).toBe(false);

    (document.getElementById('svc-alert-close') as HTMLButtonElement).click();
    expect(banner.hidden).toBe(true);

    FakeEventSource.last?.emit(summaryFixture([svc('beszel', 'Beszel', 'unknown')]));
    await flush();
    expect(banner.hidden).toBe(true);

    FakeEventSource.last?.emit(summaryFixture([svc('beszel', 'Beszel', 'down')]));
    await flush();
    expect(banner.hidden).toBe(true);
  });

  it('el banner vuelve a aparecer si el servicio se recupera y vuelve a caer', async () => {
    FakeEventSource.last?.emit(summaryFixture([svc('beszel', 'Beszel', 'up')]));
    await flush();
    expect(document.getElementById('svc-alert-banner')!.hidden).toBe(true);

    FakeEventSource.last?.emit(summaryFixture([svc('beszel', 'Beszel', 'unknown')]));
    await flush();
    expect(document.getElementById('svc-alert-banner')!.hidden).toBe(false);
  });

  it('el popup de detalle se cierra al hacer click fuera', async () => {
    document.getElementById('notif-btn')!.click();
    await flush();
    const item = document.querySelector('.notif-item') as HTMLElement;
    expect(item).toBeTruthy();

    item.click();
    await flush();
    const popup = document.getElementById('notif-detail-popup')!;
    expect(popup.hidden).toBe(false);

    document.body.click();
    await flush();
    expect(popup.hidden).toBe(true);
  });

  it('el popup de detalle se cierra con Escape', async () => {
    (document.querySelector('.notif-item') as HTMLElement).click();
    await flush();
    const popup = document.getElementById('notif-detail-popup')!;
    expect(popup.hidden).toBe(false);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await flush();
    expect(popup.hidden).toBe(true);
  });
});
