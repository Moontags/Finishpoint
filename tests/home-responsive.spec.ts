import { test, expect } from '@playwright/test';

for (const width of [375, 390, 430, 768, 1024, 1440]) {
  test(`homepage layout and calculator at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    // Exercise the existing calculator with a deterministic route response.
    await page.route('**/api/distance', route => route.fulfill({
      json: { ok: true, distanceKm: 5.2, durationMinutes: 12 },
    }));
    await page.goto('/');
    await expect(page.locator('.home-service-card')).toHaveCount(6);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const layout = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      overflow: [...document.querySelectorAll('main *')].filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
      }).length,
      columns: getComputedStyle(document.querySelector('.home-service-grid')!).gridTemplateColumns.split(' ').length,
    }));
    expect(layout.width).toBe(width);
    expect(layout.overflow).toBe(0);
    expect(layout.columns).toBe(width < 640 ? 1 : width < 1024 ? 2 : 3);
    if (width < 1024) {
      await page.getByRole('button', { name: 'Avaa valikko', exact: true }).click();
      await expect(page.locator('#mobile-navigation')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('#mobile-navigation')).toHaveCount(0);
    }
    await page.getByTestId('pickup-address-input').fill('Petsamonkatu 27, Riihimäki');
    await page.getByTestId('delivery-address-input').fill('Hämeenkatu 1, Riihimäki');
    await page.keyboard.press('Escape');
    await page.getByTestId('calculate-button').click();
    await expect(page.getByTestId('price-result')).toContainText('5 km');
    await page.locator('#quote-name').fill('Testi Käyttäjä');
    await expect(page.locator('#quote-name')).toHaveValue('Testi Käyttäjä');
    expect(errors).toEqual([]);
  });
}
