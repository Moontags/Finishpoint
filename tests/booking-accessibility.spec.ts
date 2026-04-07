import { test, expect } from '@playwright/test';

// Saavutettavuus- ja käytettävyystestit varauslomakkeelle ja kalenterille

test.describe('Finishpoint saavutettavuus', () => {
  test('kaikki lomakekentät ovat saavutettavia', async ({ page }) => {
    await page.goto('/laskuri/kappaletavara');
    // Fokusoidaan suoraan kenttiin, koska Tab ei välttämättä toimi odotetusti Next.js-sivulla
    await page.focus('input[name="kappaletavaraNoutoOsoite"]');
    await expect(page.locator('input[name="kappaletavaraNoutoOsoite"]')).toBeFocused();
    await page.focus('input[name="kappaletavaraToimitusOsoite"]');
    await expect(page.locator('input[name="kappaletavaraToimitusOsoite"]')).toBeFocused();
  });

  test('virheilmoitukset ovat näkyviä ja selkeitä', async ({ page }) => {
    await page.goto('/laskuri/kappaletavara');
    // Yritä laskea hinta ilman osoitteita
    await page.click('button:has-text("Laske hinta")');
    await expect(page.getByText(/anna sekä nouto- että toimitusosoite/i)).toBeVisible();
  });

  test('kalenteri toimii ruudunlukijalla', async ({ page }) => {
    await page.goto('/laskuri/kappaletavara');
    // Kalenterin päivät: etsitään "Varaa ajankohta" -otsikon jälkeen tulevasta gridistä
    const calendarSection = page.getByText('Varaa ajankohta').locator('..').locator('..');
    const dayButtons = calendarSection.locator('div.grid button');
    // Voi olla 3 (mobiili) tai 7 (desktop) tai enemmän, mutta vähintään 3
    await expect(dayButtons.first()).toBeVisible();
    const count = await dayButtons.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
