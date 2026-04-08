import { test, expect } from '@playwright/test';

test.describe('Main page', () => {
  test('Page loads in Finnish by default', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Valitse palvelutyyppi')).toBeVisible();
  });

  test('FI/EN toggle switches language', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('language-toggle').click();
    await expect(page.locator('text=Select service type')).toBeVisible();
  });

  test('Chat button visible in bottom right', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('chat-open')).toBeVisible();
  });

  test('Chat opens when clicked and shows close button', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('chat-open').click();
    await expect(page.getByTestId('chat-close')).toBeVisible();
  });

  test('Footer shows contact info', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=050 354 7763')).toBeVisible();
  });
});