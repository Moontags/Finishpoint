import { test, expect } from '@playwright/test';

test.describe('Quote form', () => {
  test('quote form submit button is visible', async ({ page }) => {
    await page.goto('/#quote');
    await expect(page.locator('[data-testid="quote-submit"]')).toBeVisible();
  });

  test('Form accepts valid input', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="quote-name"]').fill('Jari Peltola');
    await page.locator('[data-testid="quote-phone"]').fill('0453207900');
    await page.locator('[data-testid="quote-email"]').fill('test@test.com');
    await page.locator('[data-testid="quote-submit"]').click();
    // Optionally check for success message if present
  });

  test('shows success message after submit', async ({ page }) => {
    await page.route('**/api/quote', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="quote-form"]').scrollIntoViewIfNeeded();
    await page.locator('[data-testid="quote-name"]').fill('Jari Peltola');
    await page.locator('[data-testid="quote-phone"]').fill('0453207900');
    await page.locator('[data-testid="quote-email"]').fill('test@test.com');
    await page.locator('#quote-pickup-address').fill('Testikatu 1, Helsinki');
    await page.locator('#quote-delivery-address').fill('Testikatu 2, Espoo');
    await page.locator('[data-testid="quote-submit"]').click();
    await expect(page.locator('[data-testid="quote-feedback"]')).toBeVisible({ timeout: 10000 });
  });
});