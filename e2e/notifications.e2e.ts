import { test, expect } from '@playwright/test';

test('carga el dashboard: badge de versión y alertas críticas', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#app-version')).toHaveText(/^(dev|v\d+\.\d+\.\d+)/);
  await expect(page.locator('#notif-badge')).toHaveText('2', { timeout: 15_000 });
  await expect(page.locator('.notif-item.critical')).toHaveCount(2);
});

test('marcar todas como leídas oculta el badge sin perder las alertas', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#notif-badge')).toHaveText('2', { timeout: 15_000 });

  await page.click('#notif-btn');
  await expect(page.locator('#notif-dropdown')).toBeVisible();

  await page.click('#notif-read-all');
  await expect(page.locator('#notif-badge')).toBeHidden();
  await expect(page.locator('.notif-item.is-read')).toHaveCount(2);
  await expect(page.locator('#notif-dropdown')).toBeVisible();
});

test('Resueltas abre, aguanta los re-renders SSE y restaura', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.notif-item.critical')).toHaveCount(2, { timeout: 15_000 });

  await page.click('#notif-btn');
  await expect(page.locator('#notif-dropdown')).toBeVisible();

  await page
    .locator('.notif-item:not(.is-resolved)')
    .first()
    .locator('.notif-action[aria-label="Marcar como resuelta"]')
    .click();

  const head = page.locator('.notif-resolved-head');
  await expect(head).toHaveText('Resueltas (1)');
  await expect(page.locator('.notif-item.is-resolved')).toHaveCount(1);

  await head.click();
  await expect(page.locator('.notif-resolved')).toHaveClass(/open/);
  await expect(page.locator('#notif-dropdown')).toBeVisible();

  // regresión: el panel se reconstruye con cada poll SSE (1s); no debe perderse el abierto
  await page.waitForTimeout(2500);
  await expect(page.locator('.notif-resolved')).toHaveClass(/open/);
  await expect(page.locator('#notif-dropdown')).toBeVisible();

  await page.locator('.notif-item.is-resolved .notif-action[aria-label="Restaurar (vuelve a la lista)"]').click();
  await expect(page.locator('.notif-resolved-head')).toHaveCount(0);
  await expect(page.locator('.notif-item.is-resolved')).toHaveCount(0);
  await expect(page.locator('.notif-item')).toHaveCount(2);

  await page.locator('#app-version').click({ force: true });
  await expect(page.locator('#notif-dropdown')).toBeHidden();
});

test('sin violaciones de CSP ni errores de consola al cargar', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error' || /Content Security Policy/i.test(m.text())) problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(String(e)));
  await page.goto('/');
  await page.click('#notif-btn');
  await expect(page.locator('.notif-item')).toHaveCount(2, { timeout: 15_000 });
  await page.waitForTimeout(1500);
  expect(problems.filter((p) => !/favicon|ERR_|Failed to load resource/i.test(p))).toEqual([]);
});

test('el foco del teclado aguanta los re-renders SSE', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.notif-item')).toHaveCount(2, { timeout: 15_000 });
  await page.click('#notif-btn');
  const action = page.locator('.notif-item').first().locator('.notif-action').first();
  await action.focus();
  await page.waitForTimeout(2500);
  await expect(action).toBeFocused();
});

test('el detalle de una notificacion es un dialog modal que se cierra con Escape y devuelve el foco', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.notif-item')).toHaveCount(2, { timeout: 15_000 });
  await page.click('#notif-btn');
  await page.locator('.notif-item-main').first().click();

  const dialog = page.locator('#notif-detail-popup');
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((d: HTMLDialogElement) => d.matches(':modal'))).toBe(true);
  await expect(page.locator('#notif-detail-title')).not.toBeEmpty();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.locator('#notif-btn')).toBeFocused();
});

test('cabeceras de seguridad en la pagina', async ({ page }) => {
  const res = await page.goto('/');
  const h = res!.headers();
  expect(h['content-security-policy']).toContain("script-src 'self'");
  expect(h['x-content-type-options']).toBe('nosniff');
});
