import { test, expect } from '@playwright/test';

test.describe('English browser', () => {
  test.use({ locale: 'en-US' });

  test('shows English, lets the user switch to Spanish and remembers it', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.locator('#settings-btn').click();
    await page.locator('#language-select').selectOption('es');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });
});
