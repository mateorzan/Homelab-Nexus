import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(path.resolve(__dirname, '../public/style.css'), 'utf-8');

function rule(selector: string): string {
  const start = css.indexOf(selector + ' {');
  expect(start, selector).toBeGreaterThanOrEqual(0);
  return css.slice(start, css.indexOf('}', start));
}

describe('desplegable de Configuracion (regresion: campo URL gigante y sin scroll)', () => {
  it('el campo de URL no hereda el flex-basis de .search dentro de la columna', () => {
    const r = rule('.settings-body .search');
    expect(r).toMatch(/flex:\s*none/);
    expect(r).toMatch(/height:\s*24px/);
  });

  it('el cuerpo del desplegable hace scroll cuando no cabe', () => {
    expect(rule('.settings-body')).toMatch(/overflow-y:\s*auto/);
    expect(rule('.settings-body')).toMatch(/min-height:\s*0/);
  });
});

describe('tokens de superficie (regresion: --surface-popover se referenciaba a si mismo)', () => {
  it('--surface-popover tiene un valor propio y no una referencia circular', () => {
    const m = css.match(/--surface-popover:\s*([^;]+);/);
    expect(m).toBeTruthy();
    expect(m![1]).not.toContain('var(--surface-popover)');
  });
});

describe('selects nativos (regresion: opciones blancas sobre blanco)', () => {
  it('las opciones del select de prioridad tienen fondo y color propios', () => {
    const r = rule('.prio-select option, .settings-language option');
    expect(r).toMatch(/background-color:\s*var\(--surface-popover\)/);
    expect(r).toMatch(/color:\s*var\(--text\)/);
  });
});

describe('widget de Gotify fuera del efecto cristal (acordado: cuesta leerlo)', () => {
  it('.sidebar-inner usa la superficie casi opaca y sin desenfoque', () => {
    const block = css.slice(css.lastIndexOf('.sidebar-inner { background'));
    expect(block).toMatch(/background:\s*var\(--surface-solid\)/);
    expect(block).toMatch(/backdrop-filter:\s*none/);
  });

  it('--surface-solid es casi opaco (>= 0.9)', () => {
    const m = css.match(/--surface-solid:[^;]*\/\s*([0-9.]+)\)/);
    expect(m).toBeTruthy();
    expect(Number(m![1])).toBeGreaterThanOrEqual(0.9);
  });
});
