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
        id: 'uptimekuma', name: 'Uptime Kuma', icon: '', status: 'up', url: 'http://kuma.local', health: '', checkTime: Date.now(),
        metrics: {
          kind: 'uptimekuma',
          monitors: [
            { name: 'Uno', status: 'up', url: 'http://uno.local' },
            { name: 'Malo', status: 'up', url: 'javascript:alert(1)' },
            { name: 'Varios', status: 'down' },
          ],
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
  constructor() { FakeEventSource.last = this; }
  close(): void { /* noop */ }
  emit(payload: unknown): void { this.onmessage?.({ data: JSON.stringify(payload) }); }
}

function makeFetchMock() {
  return vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    let data: unknown = {};
    if (url.includes('/api/health')) data = { status: 'ok', version: 'dev' };
    else if (url.includes('/api/config')) data = { bgImage: null, bgBlur: 20, bgPresets: [], beszelUrl: null };
    else if (url.includes('/api/bookmarks')) data = { bookmarks: [{ title: 'Malo', url: 'javascript:alert(1)' }] };
    else if (url.includes('/api/monitor-urls')) {
      data = { urls: { Varios: [{ label: 'Panel', url: 'http://a.local' }, { label: 'API', url: 'https://b.local' }] } };
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
  });
}

const flush = () => new Promise((r) => setTimeout(r, 20));

describe('UI monitores (enlaces accesibles y URLs seguras)', () => {
  beforeAll(async () => {
    Object.defineProperty(navigator, 'language', { configurable: true, value: 'es-ES' });
    const html = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf-8');
    document.body.innerHTML = html
      .slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'))
      .replace(/<script[\s\S]*?<\/script>/g, '');
    vi.stubGlobal('fetch', makeFetchMock());
    vi.stubGlobal('EventSource', FakeEventSource);
    await import(/* @vite-ignore */ '../public/app.js');
    await flush();
    FakeEventSource.last?.emit(summaryFixture());
    await flush();
  });

  afterAll(() => { vi.unstubAllGlobals(); });

  const row = (name: string) => [...document.querySelectorAll('#kuma .monitor')]
    .find((r) => r.querySelector('.monitor-name')?.textContent === name) as HTMLElement;

  it('un monitor con una URL es un enlace real', () => {
    const link = row('Uno').querySelector('a.monitor-link') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('http://uno.local');
    expect(link.rel).toContain('noopener');
  });

  it('una URL javascript: nunca se convierte en enlace', () => {
    expect(row('Malo').querySelector('.monitor-link')).toBeNull();
  });

  it('varias URLs abren un menu con elementos enlace, accesible con teclado', () => {
    const btn = row('Varios').querySelector('button.monitor-link') as HTMLButtonElement;
    expect(btn.getAttribute('aria-haspopup')).toBe('menu');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    btn.click();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    const items = [...row('Varios').querySelectorAll('.monitor-menu a[role="menuitem"]')] as HTMLAnchorElement[];
    expect(items.map((a) => a.getAttribute('href'))).toEqual(['http://a.local', 'https://b.local']);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('el boton de ajustes es hermano del enlace (no hay controles anidados)', () => {
    const r = row('Uno');
    const cfg = r.querySelector('.monitor-cfg') as HTMLButtonElement;
    expect(cfg.getAttribute('aria-label')).toBe('Configurar enlaces de Uno');
    expect(r.querySelector('a.monitor-link button')).toBeNull();
  });

  it('un bookmark con esquema javascript: no genera enlace', () => {
    expect(document.querySelector('a.bookmark-link')).toBeNull();
    expect(document.querySelector('.bookmark-item div.bookmark-link')).toBeTruthy();
  });

  it('los monitores se reutilizan entre ticks (el foco no se pierde)', async () => {
    const link = row('Uno').querySelector('a.monitor-link') as HTMLElement;
    link.focus();
    FakeEventSource.last?.emit(summaryFixture());
    await flush();
    expect(row('Uno').querySelector('a.monitor-link')).toBe(link);
    expect(document.activeElement).toBe(link);
  });
});
