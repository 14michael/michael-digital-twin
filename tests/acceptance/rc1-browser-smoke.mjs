import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const baseURL = process.env.RC1_BASE_URL || 'http://127.0.0.1:4173/app.html';
const viewOrder = ['about', 'career', 'projects', 'gallery', 'ai', 'education'];
const fatalConsole = [];

async function openAndExercise(page, label) {
  page.on('pageerror', (error) => fatalConsole.push(`${label}: pageerror: ${error.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') fatalConsole.push(`${label}: console.error: ${msg.text()}`);
  });

  const response = await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  assert.ok(response?.ok(), `${label}: app response not OK`);
  await page.waitForSelector('canvas', { state: 'visible', timeout: 15_000 });
  await page.waitForSelector('.nav button[data-v="overview"]', { state: 'visible' });

  for (const view of viewOrder) {
    const button = page.locator(`.nav button[data-v="${view}"]`);
    await button.click();
    await page.waitForTimeout(450);
    await page.waitForFunction(() => document.querySelector('#panel')?.classList.contains('open'));
    assert.equal(await button.getAttribute('class').then((value) => value?.includes('active')), true, `${label}: ${view} nav not active`);
  }

  await page.locator('.nav button[data-v="overview"]').click();
  await page.waitForTimeout(450);
  assert.equal(await page.locator('#panel').evaluate((node) => node.classList.contains('open')), false, `${label}: overview did not close panel`);

  const theme = page.locator('#themeToggle');
  const before = await theme.getAttribute('aria-pressed');
  await theme.click();
  const after = await theme.getAttribute('aria-pressed');
  assert.notEqual(after, before, `${label}: theme toggle did not change state`);
  await theme.click();
  assert.equal(await theme.getAttribute('aria-pressed'), before, `${label}: theme toggle did not return to original state`);

  await page.locator('.nav button[data-v="about"]').click();
  await page.waitForTimeout(350);
  await page.locator('#close').click();
  await page.waitForTimeout(350);
  assert.equal(await page.locator('#panel').evaluate((node) => node.classList.contains('open')), false, `${label}: close button failed`);

  return {
    canvas: await page.locator('canvas').isVisible(),
    navButtons: await page.locator('.nav button').count(),
    width: await page.evaluate(() => innerWidth),
    height: await page.evaluate(() => innerHeight),
  };
}

const browser = await chromium.launch({ headless: true });
try {
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const desktop = await openAndExercise(await desktopContext.newPage(), 'desktop');
  await desktopContext.close();

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  const mobile = await openAndExercise(mobilePage, 'mobile-390');
  const navBox = await mobilePage.locator('.nav').boundingBox();
  const panelBox = await mobilePage.locator('#panel').boundingBox();
  assert.ok(navBox && navBox.width <= 390, 'mobile-390: nav overflows viewport');
  assert.ok(panelBox && panelBox.width <= 390, 'mobile-390: panel overflows viewport');
  await mobileContext.close();

  if (fatalConsole.length) {
    throw new Error(`Browser console/page errors:\n${fatalConsole.join('\n')}`);
  }

  console.log('RC1 browser smoke PASS');
  console.log(JSON.stringify({ desktop, mobile }, null, 2));
} finally {
  await browser.close();
}
