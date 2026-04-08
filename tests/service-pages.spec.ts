import { test, expect } from '@playwright/test';

test.describe('Service pages', () => {
  test('Motorcycle transport page loads', async ({ page }) => {
    await page.goto('/pyorakuljetus');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2, h3', { hasText: 'Moottoripyöräkuljetus' })).toBeVisible();
  });
  test('ATV transport page loads', async ({ page }) => {
    await page.goto('/monkijakuljetus');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2, h3', { hasText: 'Mönkijäkuljetus' })).toBeVisible();
  });
  test('Washing machine page loads', async ({ page }) => {
    await page.goto('/pesukone-kuljetus');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2, h3', { hasText: 'Pesukoneen kuljetus' })).toBeVisible();
  });
  test('Moving page loads', async ({ page }) => {
    await page.goto('/muutot');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });
  test('Service page title translates to English', async ({ page }) => {
    await page.goto('/pyorakuljetus');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('language-toggle').click();
    await expect(page.locator('h1, h2, h3', { hasText: 'Motorcycle transport' })).toBeVisible();
  });
});