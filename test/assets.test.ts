import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const html = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf-8');

function localHref(attr: 'href' | 'src', tag: RegExp): string[] {
  return [...html.matchAll(tag)].map((m) => m[1]).filter((u) => u.startsWith('/')).map((u) => u.replace(/^\//, '').split('?')[0]);
}

describe('logo e iconos (N con cursor)', () => {
  it('los <link rel=icon> y apple-touch-icon apuntan a ficheros que existen', () => {
    const hrefs = localHref('href', /<link rel="(?:icon|apple-touch-icon)"[^>]*href="([^"]+)"/g);
    expect(hrefs.length).toBeGreaterThanOrEqual(3);
    for (const h of hrefs) expect(fs.existsSync(path.join(PUBLIC_DIR, h)), h).toBe(true);
  });

  it('la cabecera usa el logo SVG y existe /favicon.ico para los navegadores que lo piden', () => {
    expect(html).toMatch(/<img class="logo" src="\/logo\.svg"/);
    expect(fs.existsSync(path.join(PUBLIC_DIR, 'logo.svg'))).toBe(true);
    expect(fs.existsSync(path.join(PUBLIC_DIR, 'favicon.ico'))).toBe(true);
  });

  it('los SVG no llevan estilos ni scripts inline (CSP estricta)', () => {
    for (const f of ['logo.svg', 'favicon.svg']) {
      const svg = fs.readFileSync(path.join(PUBLIC_DIR, f), 'utf-8');
      expect(svg, f).not.toMatch(/<script|<style|\sstyle=/);
    }
  });
});
