import { test, expect } from '@playwright/test';

for (const width of [375, 390, 430]) {
  test(`mobile calendar selection and unavailable times at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.clock.setFixedTime(new Date('2026-09-23T08:00:00Z'));
    await page.route('**/api/varatut-paivat*', route => route.fulfill({ json: {
      ok: true, suljetutPaivat: [],
      varausAjat: { '2026-09-24': [{ alku: '12:00', loppu: '13:00' }] },
    } }));
    await page.goto('/');
    const days = page.locator('.booking-days button');
    await days.last().click();
    await expect(days.last()).toHaveAttribute('aria-pressed', 'true');
    const time = page.locator('.booking-time select');
    await expect(time.locator('option[value="12:00"]')).toBeDisabled();
    await time.selectOption('10:00');
    await expect(time).toHaveValue('10:00');
    await page.getByRole('button', { name: 'Seuraava jakso', exact: true }).click();
    await days.first().click();
    await expect(time).toHaveValue('');
    await time.selectOption('14:00');
    await expect(time).toHaveValue('14:00');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}
