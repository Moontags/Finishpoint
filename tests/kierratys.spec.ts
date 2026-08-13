import { test, expect } from '@playwright/test';

test.describe('Kierrätys page', () => {
  test('page loads with hero, steps, pricing and FAQ', async ({ page }) => {
    await page.goto('/kierratys');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Kierrätys ja jätteiden poisto');
    await expect(page.locator('h2', { hasText: 'Miten palvelu toimii' })).toBeVisible();
    await expect(page.locator('h3', { hasText: '5. Lasku vain työstä' })).toBeVisible();
    await expect(
      page.locator('h3', { hasText: '6. Jätemaksun maksaminen kierrätysasemalla' }),
    ).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Mitä otamme mukaan' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Usein kysyttyä' })).toBeVisible();
  });

  test('shows the starting price and the filled-in example figures', async ({ page }) => {
    await page.goto('/kierratys');

    await expect(page.getByText('Kuljetus ja lajittelu alkaen 79 €')).toBeVisible();
    await expect(page.getByText('148,50')).toBeVisible();
    await expect(page.getByText('kuljetus ja lajittelu meiltä')).toBeVisible();
    // Kaikki hintaplaceholderit on nyt täytetty.
    await expect(page.getByText('[TÄYTÄ', { exact: false })).toHaveCount(0);
  });

  test('Kiertokapula shop link opens in a new tab without leaving the site', async ({ page }) => {
    await page.goto('/kierratys');

    const link = page.locator('[data-testid="kiertokapula-shop-link"]');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', 'https://shop.pinja.cloud/kiertokapula/start');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute('rel', /noreferrer/);

    await expect(
      page.getByText('Lähetämme sinulle myös tarkat ohjeet ja rekisterinumeron'),
    ).toBeVisible();

    // Estetään ulkoinen lataus, jotta testi ei riipu Kiertokapulan palvelusta.
    await page.context().route('https://shop.pinja.cloud/**', (route) => route.abort());

    const popupPromise = page
      .context()
      .waitForEvent('page', { timeout: 5000 })
      .catch(() => null);
    await link.click();
    const popup = await popupPromise;

    // Linkki avautuu uuteen välilehteen eikä vie alkuperäistä sivua pois.
    expect(popup).not.toBeNull();
    expect(new URL(page.url()).pathname).toBe('/kierratys');
    await popup?.close();
  });

  test('is reachable as its own choice in the front page service selector', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const tab = page.locator('[data-testid="service-tab-kierratys"]').first();
    await expect(tab).toHaveAttribute('href', '/kierratys');
  });

  test('recycling is no longer a sub-option of the moving calculator', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="service-tab-projekti"]').click();

    await expect(page.locator('#projekti-tyyppi')).toHaveCount(0);
    await expect(page.getByText('Kierrätys, 1 kuorma')).toHaveCount(0);
  });

  test('form blocks an invalid email address', async ({ page }) => {
    await page.goto('/kierratys');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="kierratys-email"]').fill('rikki@osoite');
    await page.locator('[data-testid="kierratys-name"]').click();

    await expect(page.locator('[data-testid="kierratys-email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="kierratys-submit"]')).toBeDisabled();
  });

  test('form submits recycling details to the quote endpoint', async ({ page }) => {
    let payload: Record<string, string> | null = null;

    await page.route('**/api/quote', async (route) => {
      payload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto('/kierratys');
    await page.waitForLoadState('networkidle');

    await page.locator('[data-testid="kierratys-name"]').fill('Testi Asiakas');
    await page.locator('[data-testid="kierratys-phone"]').fill('0453207900');
    await page.locator('[data-testid="kierratys-email"]').fill('testi@example.com');
    await page.locator('#kierratys-pickup-address').fill('Testikatu 1, Riihimäki');
    await page
      .locator('[data-testid="kierratys-waste-description"]')
      .fill('Vintin tyhjennys, vanhoja huonekaluja');
    await page.getByText('Useampi kuorma').click();
    await page.locator('[data-testid="kierratys-preferred-time"]').fill('Ensi viikon alussa');

    await page.locator('[data-testid="kierratys-submit"]').click();

    await expect(page.locator('[data-testid="kierratys-feedback"]')).toBeVisible({ timeout: 10000 });
    expect(payload).not.toBeNull();
    expect(payload!.serviceType).toBe('Kierrätys');
    expect(payload!.addresses).toContain('Nouto: Testikatu 1, Riihimäki');
    expect(payload!.message).toContain('Arvioitu määrä: Useampi kuorma');
    expect(payload!.message).toContain('Toivottu ajankohta: Ensi viikon alussa');
  });

  test('page and form render on a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/kierratys');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="kierratys-submit"]')).toBeVisible();

    // Sivu ei saa vuotaa vaakasuunnassa mobiilissa.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
