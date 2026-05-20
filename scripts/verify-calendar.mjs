import { chromium } from 'playwright';

const url = 'http://localhost:3000';
const out = '/tmp/finishpoint-verify';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
const page = await ctx.newPage();

page.on('console', (msg) => {
  if (msg.type() === 'log' && (msg.text().includes('suljetutPaivat') || msg.text().includes('varausAjat'))) {
    console.log('PAGE LOG:', msg.text());
  }
});

await page.goto(url, { waitUntil: 'networkidle' });

// Wait for calendar to render
await page.waitForSelector('text=Valitse kuljetusaika', { timeout: 10000 }).catch(() => {});
await page.waitForLoadState('networkidle');

// Initial week (should include May 21)
await page.screenshot({ path: `${out}-week1.png`, fullPage: true });

// Try to crop to calendar area: find KalenteriVaraus block
const calendar = page.locator('button[aria-label="Edellinen jakso"]').first();
const calendarBlock = page.locator('div').filter({ has: page.locator('button[aria-label="Edellinen jakso"]') }).first();
await calendarBlock.screenshot({ path: `${out}-cal-week1.png` }).catch(async (e) => {
  console.log('calendar crop failed:', e.message);
});

// Count Varattu badges visible in week 1
const varattuBadges1 = await page.locator('text=Varattu').count();
console.log('Week 1 Varattu count:', varattuBadges1);

// Get the date numbers shown for each day in calendar to confirm we see 21
const dayCells = await page.locator('button >> span.text-\\[17px\\]').allTextContents().catch(() => []);
console.log('Week 1 day numbers:', dayCells);

// Navigate forward 3 weeks to get to June 11 (May 20 + 21 days = June 10, plus another week)
const next = page.locator('button[aria-label="Seuraava jakso"]').first();
for (let i = 0; i < 3; i++) {
  await next.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

await page.screenshot({ path: `${out}-week-june.png`, fullPage: true });
await calendarBlock.screenshot({ path: `${out}-cal-week-june.png` }).catch(() => {});

const varattuBadges2 = await page.locator('text=Varattu').count();
console.log('After +3 weeks Varattu count:', varattuBadges2);
const dayCells2 = await page.locator('button >> span.text-\\[17px\\]').allTextContents().catch(() => []);
console.log('June week day numbers:', dayCells2);

await browser.close();
