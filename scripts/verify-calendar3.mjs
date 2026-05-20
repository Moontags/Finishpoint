import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
await page.waitForLoadState('networkidle');
await page.waitForTimeout(800);

// Find the day button containing "21" and screenshot the row+nav tightly
const row = page.locator('div.grid.min-w-0').first();
const box = await row.boundingBox();
if (box) {
  await page.screenshot({
    path: '/tmp/finishpoint-row-may.png',
    clip: { x: box.x - 50, y: box.y - 10, width: box.width + 100, height: box.height + 20 },
  });
  console.log('row-may:', box);
}

// Click day "21" in calendar to expand its slot list
const btn21 = page.locator('button:has(span:text-is("21"))').first();
await btn21.click();
await page.waitForTimeout(500);

const expandedBox = await page.locator('div.grid.min-w-0').first().boundingBox();
if (expandedBox) {
  await page.screenshot({
    path: '/tmp/finishpoint-row-may-clicked.png',
    clip: { x: expandedBox.x - 50, y: expandedBox.y - 10, width: expandedBox.width + 100, height: 350 },
  });
}

// Now go to June week
const next = page.locator('button[aria-label="Seuraava jakso"]').first();
for (let i = 0; i < 3; i++) {
  await next.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(400);
}

const juneBox = await page.locator('div.grid.min-w-0').first().boundingBox();
if (juneBox) {
  await page.screenshot({
    path: '/tmp/finishpoint-row-june.png',
    clip: { x: juneBox.x - 50, y: juneBox.y - 10, width: juneBox.width + 100, height: juneBox.height + 20 },
  });
}

const btn11 = page.locator('button:has(span:text-is("11"))').first();
await btn11.click();
await page.waitForTimeout(500);

const expandedJuneBox = await page.locator('div.grid.min-w-0').first().boundingBox();
if (expandedJuneBox) {
  await page.screenshot({
    path: '/tmp/finishpoint-row-june-clicked.png',
    clip: { x: expandedJuneBox.x - 50, y: expandedJuneBox.y - 10, width: expandedJuneBox.width + 100, height: 350 },
  });
}

await browser.close();
console.log('done');
