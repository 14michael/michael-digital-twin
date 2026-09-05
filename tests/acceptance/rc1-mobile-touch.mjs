import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const baseURL = process.env.RC1_BASE_URL || 'http://127.0.0.1:4173/app.html';
const fatal = [];

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();

  page.on('pageerror', (error) => fatal.push(`pageerror: ${error.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') fatal.push(`console.error: ${msg.text()}`);
  });

  const response = await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  assert.ok(response?.ok(), 'mobile-touch: app response not OK');

  const canvas = page.locator('canvas').first();
  await canvas.waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForFunction(
    () => document.querySelector('#status')?.textContent?.includes('real assets 2/2 loaded'),
    { timeout: 20_000 },
  );

  const box = await canvas.boundingBox();
  assert.ok(box && box.width > 100 && box.height > 100, 'mobile-touch: canvas has no usable bounds');

  const start = { x: box.x + box.width * 0.55, y: box.y + box.height * 0.58 };
  const end = { x: start.x + Math.min(56, box.width * 0.14), y: start.y + 18 };
  const cdp = await context.newCDPSession(page);

  async function touchDrag(from, to) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: from.x, y: from.y, radiusX: 7, radiusY: 7, force: 1, id: 1 }],
    });
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: to.x, y: to.y, radiusX: 7, radiusY: 7, force: 1, id: 1 }],
    });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }

  async function touchTap(point) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: point.x, y: point.y, radiusX: 7, radiusY: 7, force: 1, id: 2 }],
    });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }

  await touchDrag(start, end);

  await page.waitForTimeout(250);
  assert.equal(await page.locator('#panel').evaluate((node) => node.classList.contains('open')), false,
    'mobile-touch: drag gesture unexpectedly opened the content panel');

  const about = page.locator('.nav button[data-v="about"]');
  await about.click({ noWaitAfter: true });
  await page.waitForFunction(() => document.querySelector('#panel')?.classList.contains('open'));
  assert.equal(await about.getAttribute('class').then((value) => value?.includes('active')), true,
    'mobile-touch: navigation failed after touch drag');

  await page.locator('#close').click({ noWaitAfter: true });
  await page.waitForFunction(() => !document.querySelector('#panel')?.classList.contains('open'));

  await touchTap(start);
  await page.waitForTimeout(250);

  assert.equal(await canvas.isVisible(), true, 'mobile-touch: renderer disappeared after touch gesture');
  assert.deepEqual(fatal, [], `mobile-touch browser errors:\n${fatal.join('\n')}`);

  console.log('RC1 mobile touch/panel interaction PASS');
  console.log(JSON.stringify({ viewport: '390x844', dragPixels: Math.round(end.x - start.x), input: 'CDP native touch stream', fatal }, null, 2));
  await context.close();
} finally {
  await browser.close();
}
