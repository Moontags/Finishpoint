import { test, expect } from '@playwright/test';

test.describe('Service pages', () => {
  test('Washing machine page loads', async ({ page }) => {
    await page.goto('/pesukone-kuljetus');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2, h3', { hasText: 'Pesukoneen kuljetus' })).toBeVisible();
  });
  test('Mobility aid page loads', async ({ page }) => {
    await page.goto('/apuvalinekuljetus');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2, h3', { hasText: 'Apuvälinekuljetus' })).toBeVisible();
  });
  test('Moving page loads', async ({ page }) => {
    await page.goto('/muutot');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });
  test('Service page title translates to English', async ({ page }) => {
    await page.goto('/pesukone-kuljetus');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('language-toggle').click();
    await expect(page.locator('h1, h2, h3', { hasText: 'Washing machine transport' })).toBeVisible();
  });
});

// Ajoneuvokuljetukset poistuivat tarjonnasta: moottoripyöräkuljetukset hoitaa
// MP-Logistiikka, mönkijä- ja venekuljetuksia ei enää tarjota. Vanhat osoitteet
// eivät saa palauttaa 404:ää, koska niihin on kertynyt hakukonearvoa.
test.describe('Retired service pages redirect', () => {
  test('/pyorakuljetus redirects to MP-Logistiikka', async ({ page }) => {
    const response = await page.goto('/pyorakuljetus', { waitUntil: 'commit' });
    expect(response?.status()).not.toBe(404);
    expect(page.url()).toContain('mp-logistiikka.fi');
  });

  for (const path of ['/monkijakuljetus', '/veneen-kuljetus']) {
    test(`${path} redirects to the front page`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).not.toBe(404);
      await expect(page).toHaveURL(/\/$/);
    });
  }
});
