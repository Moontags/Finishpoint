import { test, expect } from '@playwright/test';

test.describe('Chat widget', () => {
  test('Chat widget opens and closes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('chat-open').click();
    await expect(page.getByTestId('chat-close')).toBeVisible();
    await page.getByTestId('chat-close').click();
    await expect(page.getByTestId('chat-panel')).not.toBeVisible();
  });

  test('Quick reply buttons are visible on open', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('chat-open').click();
    await expect(page.locator('button', { hasText: 'Mitä maksaa kuljetus?' })).toBeVisible();
  });

  test('chat opens in correct language', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('chat-open').click();
    await expect(page.getByTestId('chat-panel')).toBeVisible();
  });
});