import { test, expect } from '@playwright/test';

test.describe('Calculator', () => {
  test('Calculator loads with service type selector', async ({ page }) => {
    await page.goto('/laskuri/kappaletavara');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="calculate-button"]')).toBeVisible();
  });

  test('Can enter pickup and delivery address', async ({ page }) => {
    await page.goto('/laskuri/kappaletavara');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="pickup-address-input"]').scrollIntoViewIfNeeded();
    await page.locator('[data-testid="pickup-address-input"]').fill('Petsamonkatu 27, Riihimäki');
    await page.locator('[data-testid="delivery-address-input"]').scrollIntoViewIfNeeded();
    await page.locator('[data-testid="delivery-address-input"]').fill('Hämeenkatu 1, Riihimäki');
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="pickup-address-input"]').inputValue()).resolves.toContain('Petsamonkatu');
    await expect(page.locator('[data-testid="delivery-address-input"]').inputValue()).resolves.toContain('Hämeenkatu');
  });

  test('calendar section is present on page', async ({ page }) => {
    await page.goto('/laskuri/kappaletavara');
    await page.waitForLoadState('networkidle');
    // Try testid first, fallback to heading
    const calendar = page.locator('[data-testid="calendar"]');
    if (await calendar.count() > 0) {
      await expect(calendar).toBeVisible({ timeout: 10000 });
    } else {
      await expect(page.locator('text=Varaa ajankohta')).toBeVisible({ timeout: 10000 });
    }
  });

  test('Price shows after calculate button clicked with addresses', async ({ page }) => {
    await page.route('**/api/distance', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, distanceKm: 5.2, durationMinutes: 12 }),
      });
    });

    await page.goto('/laskuri/kappaletavara');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="pickup-address-input"]').scrollIntoViewIfNeeded();
    await page.locator('[data-testid="pickup-address-input"]').fill('Petsamonkatu 27, Riihimäki');
    await page.locator('[data-testid="delivery-address-input"]').scrollIntoViewIfNeeded();
    await page.locator('[data-testid="delivery-address-input"]').fill('Hämeenkatu 1, Riihimäki');
    await page.keyboard.press('Escape');
    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('price-result')).toBeVisible({ timeout: 10000 });
  });
});