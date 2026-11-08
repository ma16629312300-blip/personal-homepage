import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 960 },
  deviceScaleFactor: 1,
});

await page.goto('http://127.0.0.1:5173/#intro', { waitUntil: 'networkidle' });
await page.screenshot({
  path: 'C:/Users/20581/Documents/my web/artifacts/moon-artifact-desktop-intro.png',
  fullPage: true,
});

await page.getByRole('button', { name: /有趣功能 PLAYGROUND/i }).click();
await page.waitForTimeout(900);
const hashAfterClick = await page.evaluate(() => location.hash);
await page.screenshot({
  path: 'C:/Users/20581/Documents/my web/artifacts/moon-artifact-desktop-playground.png',
  fullPage: true,
});

await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://127.0.0.1:5173/#palm-universe', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.screenshot({
  path: 'C:/Users/20581/Documents/my web/artifacts/moon-artifact-mobile-palm.png',
  fullPage: true,
});

await browser.close();

console.log(JSON.stringify({ hashAfterClick }, null, 2));
