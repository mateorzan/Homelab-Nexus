// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');

const APPS = [
  { id: 1, name: 'Notifications', count: 0, critical: 0 },
  { id: 2, name: 'Containers', count: 0, critical: 0 },
  { id: 3, name: 'Status_Monitor', count: 2, critical: 0 },
  { id: 4, name: 'Backups', count: 1, critical: 0 },
  { id: 5, name: 'Dns_Events', count: 1, critical: 1 },
];

const MESSAGES = [
  { id: 21, appId: 5, appName: 'Dns_Events', title: 'DNS record changed', message: 'A sample DNS change was applied', priority: 9, date: Date.now() - 60_000 },
  { id: 22, appId: 3, appName: 'Status_Monitor', title: 'Service status', message: 'service-01: up', priority: 7, date: Date.now() - 120_000 },
  { id: 23, appId: 3, appName: 'Status_Monitor', title: 'Service status', message: 'service-02: down', priority: 7, date: Date.now() - 180_000 },
  { id: 24, appId: 4, appName: 'Backups', title: 'Backup job status', message: 'sample backup successful', priority: 1, date: Date.now() - 240_000 },
];

function summaryFixture() {
  return {
    generatedAt: Date.now(),
    overallStatus: 'ok',
    services: [
      {
        id: 'gotify',
        name: 'Gotify',
        icon: 'info',
        status: 'up',
        url: 'http://gotify.local',
        health: '100 mensajes · 0 criticos',
        checkTime: Date.now(),
        metrics: {
          kind: 'gotify',
          totalMessages: MESSAGES.length,
          apps: APPS.map((a) => ({ ...a })),
          messages: MESSAGES.map((m) => ({ ...m })),
          lastMessage: { ...MESSAGES[0] },
        },
      },
    ],
    alerts: [],
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

function appChips(): HTMLButtonElement[] {
  return [...document.querySelectorAll<HTMLButtonElement>('#gotify-filter .chip-chip')];
}

function resetFilters(): void {
  appChips()[0]?.click();
  const sel = document.getElementById('gotify-priority-level') as HTMLSelectElement | null;
  if (sel) {
    sel.value = 'all';
    sel.dispatchEvent(new Event('change'));
  }
}

function renderedMsgApps(): string[] {
  return [...document.querySelectorAll('#gotify-msgs .msg .msg-app')].map((n) => n.textContent ?? '');
}

describe('UI Gotify (chips de apps)', () => {
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

  it('no pinta una fila de prioridad como tags', () => {
    expect(document.getElementById('gotify-priority')).toBeNull();
  });

  it('los chips de filtro son exactamente las apps creadas en Gotify', () => {
    resetFilters();
    const chips = appChips();
    expect(chips).toHaveLength(1 + APPS.length);
    expect(chips[0].textContent).toBe('Todas las apps');
    const labels = chips.slice(1).map((c) => c.textContent);
    for (const a of APPS) {
      const clean = a.name.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
      const expected = clean.charAt(0).toUpperCase() + clean.slice(1);
      expect(labels).toContain(`${expected} · ${a.count}`);
    }
  });

  it('el nombre de la app se formatea sin guiones bajos', () => {
    resetFilters();
    const labels = appChips().map((c) => c.textContent ?? '');
    expect(labels.some((t) => t.includes('Dns_Events'))).toBe(false);
    expect(labels.some((t) => t.includes('Dns Events'))).toBe(true);

    const rowApps = renderedMsgApps();
    expect(rowApps.some((t) => t.includes('Dns_Events'))).toBe(false);
    expect(rowApps.some((t) => t.includes('Dns Events'))).toBe(true);
  });

  it('las apps sin mensajes quedan visibles pero apagadas', () => {
    resetFilters();
    const empty = appChips().find((c) => (c.textContent ?? '').startsWith('Notifications'));
    expect(empty).toBeTruthy();
    expect(empty?.classList.contains('muted')).toBe(true);

    const withMsgs = appChips().find((c) => (c.textContent ?? '').startsWith('Status Monitor'));
    expect(withMsgs?.classList.contains('muted')).toBe(false);
  });

  it('click en un chip filtra los mensajes por app', async () => {
    resetFilters();
    await flush();
    expect(renderedMsgApps()).toHaveLength(4);

    const statusMonitor = appChips().find((c) => (c.textContent ?? '').startsWith('Status Monitor'));
    statusMonitor?.click();
    await flush();

    expect(renderedMsgApps()).toHaveLength(2);
    expect(renderedMsgApps().every((n) => n === 'Status Monitor')).toBe(true);
  });

  it('el selector de prioridad filtra los mensajes', async () => {
    resetFilters();
    await flush();

    const sel = document.getElementById('gotify-priority-level') as HTMLSelectElement | null;
    expect(sel).toBeTruthy();
    if (!sel) return;

    sel.value = 'critical';
    sel.dispatchEvent(new Event('change'));
    await flush();

    expect(renderedMsgApps()).toHaveLength(1);
    expect(document.querySelector('#gotify-msgs .msg .prio.critical')).toBeTruthy();

    sel.value = 'info';
    sel.dispatchEvent(new Event('change'));
    await flush();

    expect(renderedMsgApps()).toHaveLength(1);
    expect(document.querySelector('#gotify-msgs .msg .prio.info')).toBeTruthy();
  });

  it('si la app filtrada desaparece el filtro vuelve a "Todas las apps"', async () => {
    resetFilters();
    const statusMonitor = appChips().find((c) => (c.textContent ?? '').startsWith('Status Monitor'));
    statusMonitor?.click();
    await flush();
    expect(renderedMsgApps()).toHaveLength(2);
    expect(renderedMsgApps().every((n) => n === 'Status Monitor')).toBe(true);

    // El usuario elimina la app seleccionada en Gotify: deja de llegar.
    const base = summaryFixture().services[0];
    FakeEventSource.last?.emit({
      generatedAt: Date.now(),
      overallStatus: 'ok',
      services: [{ ...base, metrics: {
        kind: 'gotify',
        totalMessages: 2,
        apps: [
          { id: 5, name: 'Dns_Events', count: 1, critical: 1 },
          { id: 4, name: 'Backups', count: 1, critical: 0 },
        ],
        messages: [MESSAGES[0], MESSAGES[3]],
        lastMessage: MESSAGES[0],
      } }],
      alerts: [],
      resolvedAlerts: [],
    });
    await flush();

    const active = appChips().find((c) => c.classList.contains('active'));
    expect(active?.textContent).toBe('Todas las apps');
    expect(renderedMsgApps()).toHaveLength(2);
  });

  it('escribir en la búsqueda no reinicia el límite de mensajes', async () => {
    resetFilters();
    const bigMessages = Array.from({ length: 40 }, (_, i) => ({
      id: 100 + i,
      appId: 9,
      appName: 'Big',
      title: 'sample-' + i,
      message: 'sample up ' + i,
      priority: 1,
      date: Date.now() - i * 1000,
    }));
    const base = summaryFixture().services[0];
    FakeEventSource.last?.emit({
      generatedAt: Date.now(),
      overallStatus: 'ok',
      services: [{ ...base, metrics: {
        kind: 'gotify',
        totalMessages: bigMessages.length,
        apps: [{ id: 9, name: 'Big', count: bigMessages.length, critical: 0 }],
        messages: bigMessages,
        lastMessage: bigMessages[0],
      } }],
      alerts: [],
      resolvedAlerts: [],
    });
    await flush();

    const rows = () => document.querySelectorAll('#gotify-msgs .msg').length;
    expect(rows()).toBe(30);

    const more = [...document.querySelectorAll<HTMLButtonElement>('#gotify-msgs .msg-toggle')]
      .find((b) => (b.textContent ?? '').startsWith('Cargar más'));
    expect(more).toBeTruthy();
    more?.click();
    await flush();
    expect(rows()).toBe(40);

    // Antes: cada tecla reiniciaba msgLimit a 30 y "Cargar más" se perdia.
    const search = document.getElementById('gotify-search') as HTMLInputElement;
    search.value = 'sample';
    search.dispatchEvent(new Event('input'));
    await flush();
    expect(rows()).toBe(40);
  });
});
