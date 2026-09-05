import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL = process.env.RC1_BASE_URL || 'http://127.0.0.1:4173/app.html';
const evidenceDir = process.env.RC1_EVIDENCE_DIR || 'artifacts/rc1-browser-smoke';
const READY_TIMEOUT = 45_000;
const ASSET_TIMEOUT = 45_000;
const EXPECTED_ASSET_COUNT = 5;

// Pixel targets are the projected centres of the six oversized Three.js hit boxes
// from the canonical 1440x900 overview camera. They intentionally test the real
// canvas raycaster path rather than calling internal move()/show() functions.
const hotspots = [
  { view: 'about', x: 660, y: 477, title: '黃連燈 Michael Huang' },
  { view: 'career', x: 616, y: 292, title: '從工程官到工程管理主管' },
  { view: 'projects', x: 886, y: 316, title: '代表工程 × 管理方法' },
  { view: 'gallery', x: 1174, y: 462, title: '工程作品與管理成果' },
  { view: 'ai', x: 1088, y: 515, title: 'AI Agent × KMS × 工程資料治理' },
  { view: 'education', x: 553, y: 421, title: '學歷與工程專業資格' },
];

await mkdir(evidenceDir, { recursive: true });
const steps = [];
function record(message) {
  const line = `${new Date().toISOString()} ${message}`;
  steps.push(line);
  console.log(line);
}

const browser = await chromium.launch({ headless: true });
let page;
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  page = await context.newPage();
  const fatal = [];
  page.on('pageerror', (error) => fatal.push(`pageerror: ${error.message}`));
  page.on('console', (msg) => { if (msg.type() === 'error') fatal.push(`console.error: ${msg.text()}`); });

  const response = await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  assert.ok(response?.ok(), 'hotspot smoke: app response not OK');
  await page.locator('canvas').first().waitFor({ state: 'visible', timeout: READY_TIMEOUT });
  await page.waitForFunction(
    (count) => document.querySelector('#status')?.textContent?.includes(`real assets ${count}/${count} loaded`),
    EXPECTED_ASSET_COUNT,
    { timeout: ASSET_TIMEOUT },
  );
  record('renderer ready and five real assets loaded');

  for (const hotspot of hotspots) {
    await page.locator('.nav button[data-v="overview"]').click({ noWaitAfter: true });
    await page.waitForTimeout(1250);
    assert.equal(await page.locator('#panel').evaluate((node) => node.classList.contains('open')), false, `${hotspot.view}: overview reset did not close panel`);

    record(`canvas hotspot ${hotspot.view} @ ${hotspot.x},${hotspot.y}`);
    await page.mouse.click(hotspot.x, hotspot.y);
    await page.waitForTimeout(1250);

    const active = page.locator(`.nav button[data-v="${hotspot.view}"]`);
    assert.equal((await active.getAttribute('class'))?.includes('active'), true, `${hotspot.view}: canvas click did not activate matching navigation state`);
    assert.equal(await page.locator('#panel').evaluate((node) => node.classList.contains('open')), true, `${hotspot.view}: canvas click did not open panel`);
    assert.equal((await page.locator('#title').textContent())?.trim(), hotspot.title, `${hotspot.view}: hotspot opened wrong content`);
    await page.screenshot({ path: `${evidenceDir}/hotspot-${hotspot.view}.png`, fullPage: true });
  }

  assert.deepEqual(fatal, [], `hotspot smoke introduced browser errors:\n${fatal.join('\n')}`);
  await writeFile(`${evidenceDir}/hotspot-result.json`, JSON.stringify({ status: 'PASS', hotspots, steps }, null, 2));
  console.log('RC1 hotspot smoke PASS');
  await context.close();
} catch (error) {
  if (page && !page.isClosed()) await page.screenshot({ path: `${evidenceDir}/hotspot-failure.png`, fullPage: true }).catch(() => {});
  await writeFile(`${evidenceDir}/hotspot-failure.json`, JSON.stringify({ status: 'FAIL', message: error?.message || String(error), steps }, null, 2));
  console.error('RC1 hotspot smoke FAIL');
  throw error;
} finally {
  await browser.close();
}
