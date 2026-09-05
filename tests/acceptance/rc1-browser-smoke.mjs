import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL = process.env.RC1_BASE_URL || 'http://127.0.0.1:4173/app.html';
const evidenceDir = process.env.RC1_EVIDENCE_DIR || 'artifacts/rc1-browser-smoke';
const viewOrder = ['about', 'career', 'projects', 'gallery', 'ai', 'education'];
const fatalConsole = [];
const steps = [];

await mkdir(evidenceDir, { recursive: true });

function record(label, detail) {
  const item = `${new Date().toISOString()} ${label}: ${detail}`;
  steps.push(item);
  console.log(item);
}

async function capture(page, name) {
  const safe = name.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
  const path = `${evidenceDir}/${safe}.png`;
  await page.screenshot({ path, fullPage: true }).catch((error) => {
    record('screenshot', `${safe} failed: ${error.message}`);
  });
  return path;
}

async function waitForStudioReady(page, label) {
  const canvas = page.locator('canvas').first();
  await canvas.waitFor({ state: 'attached', timeout: 15_000 });
  await page.waitForFunction(() => {
    const node = document.querySelector('canvas');
    if (!node) return false;
    const rect = node.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && node.width > 0 && node.height > 0;
  }, { timeout: 15_000 });
  assert.equal(await canvas.isVisible(), true, `${label}: canvas not visible after renderer initialization`);

  const overview = page.locator('.nav button[data-v="overview"]');
  await overview.waitFor({ state: 'visible', timeout: 15_000 });
  record(label, 'renderer and navigation ready');
}

async function openAndExercise(page, label) {
  page.on('pageerror', (error) => {
    const item = `${label}: pageerror: ${error.message}`;
    fatalConsole.push(item);
    record('browser-error', item);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const item = `${label}: console.error: ${msg.text()}`;
      fatalConsole.push(item);
      record('console-error', item);
    }
  });

  record(label, `goto ${baseURL}`);
  const response = await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  assert.ok(response?.ok(), `${label}: app response not OK`);
  await waitForStudioReady(page, label);
  await capture(page, `${label}-00-loaded`);

  for (const view of viewOrder) {
    record(label, `open view ${view}`);
    const button = page.locator(`.nav button[data-v="${view}"]`);
    await button.click();
    await page.waitForTimeout(450);
    await page.waitForFunction(() => document.querySelector('#panel')?.classList.contains('open'));
    assert.equal(await button.getAttribute('class').then((value) => value?.includes('active')), true, `${label}: ${view} nav not active`);
    await capture(page, `${label}-${view}`);
  }

  record(label, 'overview reset');
  await page.locator('.nav button[data-v="overview"]').click();
  await page.waitForTimeout(450);
  assert.equal(await page.locator('#panel').evaluate((node) => node.classList.contains('open')), false, `${label}: overview did not close panel`);

  record(label, 'theme toggle round-trip');
  const theme = page.locator('#themeToggle');
  const before = await theme.getAttribute('aria-pressed');
  await theme.click();
  const after = await theme.getAttribute('aria-pressed');
  assert.notEqual(after, before, `${label}: theme toggle did not change state`);
  await theme.click();
  assert.equal(await theme.getAttribute('aria-pressed'), before, `${label}: theme toggle did not return to original state`);

  record(label, 'panel close');
  await page.locator('.nav button[data-v="about"]').click();
  await page.waitForTimeout(350);
  await page.locator('#close').click();
  await page.waitForTimeout(350);
  assert.equal(await page.locator('#panel').evaluate((node) => node.classList.contains('open')), false, `${label}: close button failed`);
  await capture(page, `${label}-99-complete`);

  return {
    canvas: await page.locator('canvas').first().isVisible(),
    navButtons: await page.locator('.nav button').count(),
    width: await page.evaluate(() => innerWidth),
    height: await page.evaluate(() => innerHeight),
  };
}

const browser = await chromium.launch({ headless: true });
let activePage = null;
try {
  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  activePage = await desktopContext.newPage();
  const desktop = await openAndExercise(activePage, 'desktop');
  await desktopContext.close();

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
  });
  activePage = await mobileContext.newPage();
  const mobile = await openAndExercise(activePage, 'mobile-390');
  const navBox = await activePage.locator('.nav').boundingBox();
  const panelBox = await activePage.locator('#panel').boundingBox();
  assert.ok(navBox && navBox.width <= 390, 'mobile-390: nav overflows viewport');
  assert.ok(panelBox && panelBox.width <= 390, 'mobile-390: panel overflows viewport');
  await mobileContext.close();

  if (fatalConsole.length) {
    throw new Error(`Browser console/page errors:\n${fatalConsole.join('\n')}`);
  }

  const result = { desktop, mobile, fatalConsole, steps };
  await writeFile(`${evidenceDir}/result.json`, JSON.stringify(result, null, 2));
  console.log('RC1 browser smoke PASS');
  console.log(JSON.stringify({ desktop, mobile }, null, 2));
} catch (error) {
  if (activePage && !activePage.isClosed()) {
    await capture(activePage, 'failure-state');
  }
  const report = {
    status: 'FAIL',
    message: error?.message || String(error),
    stack: error?.stack || null,
    fatalConsole,
    steps,
  };
  await writeFile(`${evidenceDir}/failure.json`, JSON.stringify(report, null, 2));
  console.error('RC1 browser smoke FAIL');
  console.error(JSON.stringify(report, null, 2));
  throw error;
} finally {
  await browser.close();
}
