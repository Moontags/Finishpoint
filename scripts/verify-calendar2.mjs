import { chromium } from 'playwright';

const url = 'http://localhost:3000';
const out = '/tmp/finishpoint';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500);

const calendarRow = page.locator('div').filter({ has: page.locator('button[aria-label="Edellinen jakso"]') }).first();
await calendarRow.screenshot({ path: `${out}-cal-may.png` });
console.log('Saved', `${out}-cal-may.png`);

// Navigate forward 3 weeks
const next = page.locator('button[aria-label="Seuraava jakso"]').first();
for (let i = 0; i < 3; i++) {
  await next.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(400);
}
await calendarRow.screenshot({ path: `${out}-cal-june.png` });
console.log('Saved', `${out}-cal-june.png`);

// Click June 11 to confirm "Varattu" is shown in the slot area too
const day11 = page.locator('button').filter({ hasText: /^to\s*11/i }).first();
if (await day11.count()) {
  await day11.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}-day11-selected.png`, fullPage: false, clip: { x: 0, y: 0, width: 1400, height: 700 } });
  console.log('Saved', `${out}-day11-selected.png`);
}

await browser.close();
