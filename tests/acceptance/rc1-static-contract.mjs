import fs from 'node:fs';
import assert from 'node:assert/strict';

const app = fs.readFileSync(new URL('../../app.html', import.meta.url), 'utf8');
const assets = fs.readFileSync(new URL('../../src/real-assets.js', import.meta.url), 'utf8');

const checks = [];
function check(id, description, fn) {
  try {
    fn();
    checks.push({ id, description, status: 'PASS' });
  } catch (error) {
    checks.push({ id, description, status: 'FAIL', error: error.message });
  }
}

check('AT-12', '六個內容區與 Overview 導覽契約存在', () => {
  for (const view of ['overview', 'about', 'career', 'projects', 'gallery', 'ai', 'education']) {
    assert.match(app, new RegExp(`data-v=["']${view}["']`), `missing nav view: ${view}`);
  }
});

check('AT-14', '日夜切換控制與狀態函式存在', () => {
  assert.match(app, /id=["']themeToggle["']/);
  assert.match(app, /setTheme\(/);
});

check('AT-17', '390px 級手機版有 responsive CSS 契約', () => {
  assert.match(app, /@media\(max-width:760px\)/);
  assert.match(app, /max-width:calc\(100vw - 20px\)/);
});

check('AT-18', 'Pointer drag/click 分流與 pointer capture 契約存在', () => {
  assert.match(app, /pointerdown/);
  assert.match(app, /pointermove/);
  assert.match(app, /pointerup/);
  assert.match(app, /setPointerCapture/);
});

check('AT-19', '高解析度裝置 DPR 有上限', () => {
  assert.match(app, /Math\.min\(devicePixelRatio,innerWidth<760\?1\.2:1\.55\)/);
});

check('AT-20', '公開版個資提示存在，且不得硬編碼台灣手機號碼', () => {
  assert.match(app, /公開版不顯示手機、完整住址與推薦人聯絡資料/);
  assert.doesNotMatch(app, /09\d{2}[\s-]?\d{3}[\s-]?\d{3}/);
});

check('RC-01', '核心家具全部由 real asset registry 管理', () => {
  for (const asset of ['executiveChair', 'executiveDesk', 'deskLamp', 'lowCabinet', 'pottedPlant']) {
    assert.match(assets, new RegExp(`${asset}:\\s*\\{`), `missing real asset: ${asset}`);
  }
});

check('RC-05', 'Release 不得殘留 FBX 核心資產', () => {
  assert.doesNotMatch(assets, /format:\s*['"]fbx['"]/i, 'FBX core asset remains; convert/localize before release');
});

check('RC-05', '核心資產不得以遠端 raw GitHub URL 作正式 Release 來源', () => {
  assert.doesNotMatch(assets, /url:\s*['"]https?:\/\//i, 'remote runtime asset dependency remains; vendor optimized GLB locally before release');
});

for (const row of checks) {
  const suffix = row.error ? ` — ${row.error}` : '';
  console.log(`${row.status.padEnd(4)} ${row.id.padEnd(5)} ${row.description}${suffix}`);
}

const failed = checks.filter((row) => row.status === 'FAIL');
console.log(`\nRC1 static contract: ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exitCode = 1;
