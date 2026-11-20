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

const fetchMock = makeFetchMock();

describe('UI monitores (enlaces accesibles y URLs seguras)', () => {
  beforeAll(async () => {
    Object.defineProperty(navigator, 'language', { configurable: true, value: 'es-ES' });
    const html = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf-8');
    document.body.innerHTML = html
      .slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'))
      .replace(/<script[\s\S]*?<\/script>/g, '');
    vi.stubGlobal('fetch', fetchMock);
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

describe('UI monitores: destello al cambiar de estado', () => {
  it('un monitor que cambia de estado recibe status-flash una sola vez y no en el refresco siguiente', async () => {
    const down = summaryFixture();
    (down.services[0].metrics as { monitors: Array<{ name: string; status: string }> }).monitors[0].status = 'down';
    FakeEventSource.last?.emit(down);
    await flush();
    const row = [...document.querySelectorAll('#kuma .monitor')].find((r) => r.querySelector('.monitor-name')?.textContent === 'Uno') as HTMLElement;
    expect(row.classList.contains('status-flash')).toBe(true);

    row.dispatchEvent(new Event('animationend'));
    expect(row.classList.contains('status-flash')).toBe(false);

    FakeEventSource.last?.emit(down);
    await flush();
    expect(row.classList.contains('status-flash')).toBe(false);
  });

  it('la primera pintura no destella (no hay estado previo)', () => {
    const first = [...document.querySelectorAll('#kuma .monitor')].find((r) => r.querySelector('.monitor-name')?.textContent === 'Varios') as HTMLElement;
    expect(first.classList.contains('status-flash')).toBe(false);
  });
});

describe('UI popups: no se cierran al pulsar sus propios botones (regresion)', () => {
  it('"Ver más" de los iconos del nuevo enlace no cierra el popup', async () => {
    (document.getElementById('bookmark-add') as HTMLButtonElement).click();
    await flush();
    const popup = document.querySelector('.bookmark-popup') as HTMLElement;
    expect(popup).toBeTruthy();
    const more = popup.querySelector('.show-more-btn') as HTMLButtonElement;
    expect(more).toBeTruthy();

    more.click();
    await flush();
    expect(document.querySelector('.bookmark-popup')).toBe(popup);
    expect(popup.querySelectorAll('.svc-icon-btn').length).toBeGreaterThan(24);

    document.body.click();
    await flush();
    expect(document.querySelector('.bookmark-popup')).toBeNull();
  });

  it('quitar una fila del popup de enlaces del monitor no lo cierra', async () => {
    const row = [...document.querySelectorAll('#kuma .monitor')].find((r) => r.querySelector('.monitor-name')?.textContent === 'Varios') as HTMLElement;
    (row.querySelector('.monitor-cfg') as HTMLButtonElement).click();
    const popup = document.querySelector('.monitor-cfg-popup') as HTMLElement;
    expect(popup.hidden).toBe(false);
    const before = popup.querySelectorAll('.cfg-entry').length;

    (popup.querySelector('.cfg-rm') as HTMLButtonElement).click();
    await flush();
    expect(popup.hidden).toBe(false);
    expect(popup.querySelectorAll('.cfg-entry').length).toBe(before - 1);
  });
});

describe('UI enlaces: editar un enlace ya creado', () => {
  beforeAll(() => { vi.stubGlobal('fetch', fetchMock); });
  afterAll(() => { vi.unstubAllGlobals(); });

  it('el boton de editar abre el popup relleno y guarda titulo, URL e icono sin duplicar', async () => {
    const edit = document.querySelector('.bookmark-edit') as HTMLButtonElement;
    expect(edit).toBeTruthy();
    expect(edit.getAttribute('aria-label')).toBe('Editar Malo');
    const countBefore = document.querySelectorAll('.bookmark-item').length;

    edit.click();
    await flush();
    const popup = document.querySelector('.bookmark-popup') as HTMLElement;
    expect(popup.getAttribute('aria-label')).toBe('Editar enlace');
    const [titleInput, urlInput] = [...popup.querySelectorAll('.popup-field input')] as HTMLInputElement[];
    expect(titleInput.value).toBe('Malo');
    expect(urlInput.value).toBe('javascript:alert(1)');

    urlInput.value = 'javascript:otra()';
    popup.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(urlInput.getAttribute('aria-invalid')).toBe('true');
    expect(document.querySelector('.bookmark-popup')).toBe(popup);

    titleInput.value = 'Editado';
    urlInput.value = 'https://ok.local';
    (popup.querySelector('.svc-icon-btn') as HTMLButtonElement).click();
    popup.dispatchEvent(new Event('submit', { cancelable: true }));
    await flush();

    expect(document.querySelector('.bookmark-popup')).toBeNull();
    expect(document.querySelectorAll('.bookmark-item').length).toBe(countBefore);
    const link = document.querySelector('a.bookmark-link') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('https://ok.local');
    expect(link.querySelector('.bookmark-title')?.textContent).toBe('Editado');
    expect(link.querySelector('.bookmark-ico img')).toBeTruthy();

    const calls = fetchMock.mock.calls.filter(([u, init]) => String(u).includes('/api/bookmarks') && init?.method === 'POST');
    const sent = JSON.parse(String(calls[calls.length - 1][1]?.body)) as { bookmarks: Array<{ title: string; url: string; icon?: string }> };
    expect(sent.bookmarks[0]).toMatchObject({ title: 'Editado', url: 'https://ok.local' });
    expect(sent.bookmarks[0].icon).toContain('/png/');
  });

  it('se puede quitar el icono de un enlace editado', async () => {
    (document.querySelector('.bookmark-edit') as HTMLButtonElement).click();
    await flush();
    const popup = document.querySelector('.bookmark-popup') as HTMLElement;
    expect(popup.querySelector('.icon-preview img')).toBeTruthy();

    const clear = [...popup.querySelectorAll('button')].find((b) => b.textContent === 'Quitar icono') as HTMLButtonElement;
    clear.click();
    popup.dispatchEvent(new Event('submit', { cancelable: true }));
    await flush();

    expect(document.querySelector('.bookmark-ico img')).toBeNull();
    expect(document.querySelector('.bookmark-ico')?.textContent).toBe('ED');
  });
});
