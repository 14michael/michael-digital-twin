import * as THREE from 'three';

const walnut = new THREE.MeshPhysicalMaterial({ color: 0x3a2118, roughness: 0.48, clearcoat: 0.12 });
const walnutDark = new THREE.MeshPhysicalMaterial({ color: 0x24140f, roughness: 0.55, clearcoat: 0.08 });
const charcoal = new THREE.MeshStandardMaterial({ color: 0x151719, roughness: 0.52, metalness: 0.12 });
const brass = new THREE.MeshStandardMaterial({ color: 0xb98b4a, roughness: 0.28, metalness: 0.82 });
const burgundy = new THREE.MeshPhysicalMaterial({ color: 0x672b2a, roughness: 0.42, clearcoat: 0.22 });
const stone = new THREE.MeshStandardMaterial({ color: 0x777067, roughness: 0.9 });

function box(scene, name, size, position, material, rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function canvasPanel(scene, name, text, size, position, options = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  const bg = options.bg ?? '#151719';
  const fg = options.fg ?? '#efe2c8';
  const accent = options.accent ?? '#c89b5d';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,.12)';
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, 988, 988);
  ctx.fillStyle = accent;
  ctx.font = '700 34px Microsoft JhengHei, sans-serif';
  ctx.fillText(options.kicker ?? 'MICHAEL EXECUTIVE STUDIO', 58, 82);
  ctx.fillStyle = fg;
  ctx.font = `700 ${options.titleSize ?? 52}px Microsoft JhengHei, sans-serif`;
  const lines = text.split('\n');
  lines.forEach((line, i) => ctx.fillText(line, 58, 170 + i * 68));
  if (options.rows) {
    ctx.font = '500 28px Microsoft JhengHei, sans-serif';
    options.rows.forEach((row, i) => {
      const y = 430 + i * 112;
      ctx.fillStyle = accent;
      ctx.fillRect(58, y - 27, 10, 44);
      ctx.fillStyle = fg;
      ctx.fillText(row[0], 92, y);
      ctx.fillStyle = '#b9b1a5';
      ctx.font = '400 23px Microsoft JhengHei, sans-serif';
      ctx.fillText(row[1], 92, y + 38);
      ctx.font = '500 28px Microsoft JhengHei, sans-serif';
    });
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(...size), material);
  panel.name = name;
  panel.position.set(...position);
  panel.rotation.set(...(options.rotation ?? [0, 0, 0]));
  scene.add(panel);
  return panel;
}

function addCareerWall(scene) {
  box(scene, 'VISUAL_CareerWall_Frame', [3.7, 4.05, 0.13], [-4.08, 2.55, -4.04], walnutDark);
  canvasPanel(scene, 'VISUAL_CareerWall_Content', 'CAREER\nJOURNEY', [3.18, 3.52], [-4.08, 2.62, -3.965], {
    bg: '#181819',
    kicker: 'CAREER TIMELINE',
    rows: [
      ['1985–2000', '工程官｜工程實務基礎'],
      ['2001–2008', '工程師 → 組長 → 工地主任'],
      ['2008–2016', '採發部經理｜採購與成本治理'],
      ['2018–2026', '業務處經理｜跨專案治理'],
    ],
  });
  for (let i = 0; i < 4; i += 1) {
    const y = 1.36 + i * 0.73;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 18, 12), brass);
    dot.position.set(-5.34, y, -3.88);
    scene.add(dot);
  }
}

function addProjectWall(scene) {
  box(scene, 'VISUAL_ProjectWall_Frame', [5.9, 4.05, 0.13], [0.78, 2.55, -4.04], walnutDark);
  canvasPanel(scene, 'VISUAL_ProjectWall_Content', 'PROJECTS × METHODS\nAI ENGINEERING GOVERNANCE', [5.38, 3.52], [0.78, 2.62, -3.965], {
    bg: '#111517',
    kicker: 'PROJECT / METHOD / AI',
    titleSize: 42,
    rows: [
      ['代表工程', '公共工程｜商業建築｜特殊建築'],
      ['管理閉環', '偏差 → 原因 → 責任 → 改善 → 驗證'],
      ['採購治理', '風險分配｜界面定義｜成本鎖定'],
      ['AI Lab', 'Agent｜KMS｜Dashboard｜Knowledge Loop'],
    ],
  });
  const glow = new THREE.PointLight(0x78c7cf, 5.5, 4.5, 2.2);
  glow.position.set(2.9, 2.25, -2.85);
  scene.add(glow);
}

function addPortfolioWall(scene) {
  box(scene, 'VISUAL_PortfolioWall_Frame', [0.13, 4.05, 6.55], [6.03, 2.55, 0], walnutDark);
  const labels = ['PUBLIC WORKS', 'COST / PROCUREMENT', 'SOP / DASHBOARD', 'BOOK / COURSE', 'AI SYSTEM', 'EVIDENCE ONLY'];
  labels.forEach((label, i) => {
    const row = i % 3;
    const col = Math.floor(i / 3);
    const y = 1.55 + row * 1.12;
    const z = -2.1 + col * 4.15;
    const frame = box(scene, `VISUAL_PortfolioFrame_${i}`, [0.09, 0.9, 1.78], [5.92, y, z], walnut, [0, Math.PI / 2, 0]);
    frame.userData.portfolioPlaceholder = true;
    const card = canvasPanel(scene, `VISUAL_PortfolioCard_${i}`, label, [1.5, 0.68], [5.865, y, z], {
      rotation: [0, -Math.PI / 2, 0],
      bg: i % 2 ? '#25211d' : '#171a1c',
      kicker: 'PORTFOLIO EVIDENCE',
      titleSize: 34,
    });
    card.userData.portfolioPlaceholder = true;
  });
}

function addExecutiveFocalZone(scene) {
  const rug = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.045, 96), stone);
  rug.name = 'VISUAL_ExecutiveRug';
  rug.scale.z = 0.7;
  rug.position.set(0.2, 0.018, 1.35);
  rug.receiveShadow = true;
  scene.add(rug);

  const front = box(scene, 'VISUAL_DeskFrontAccent', [3.6, 0.66, 0.09], [0.18, 0.52, 1.12], walnutDark);
  front.userData.decorativeOnly = true;
  const inset = box(scene, 'VISUAL_DeskFrontLeatherInset', [2.42, 0.42, 0.045], [0.18, 0.55, 1.165], burgundy);
  inset.userData.decorativeOnly = true;

  const shelf = box(scene, 'VISUAL_CredenzaShelf', [5.5, 0.09, 0.72], [0.72, 1.0, -3.48], walnut);
  shelf.receiveShadow = true;

  const cove = box(scene, 'VISUAL_CoveLightHousing', [12.0, 0.1, 0.18], [0, 5.05, -4.04], charcoal);
  cove.receiveShadow = false;
  const strip = new THREE.RectAreaLight(0xffc37a, 5.4, 10.2, 0.18);
  strip.position.set(0, 4.95, -3.86);
  strip.lookAt(0, 2.4, -1.2);
  scene.add(strip);
}

function addEducationObject(scene) {
  const bookMat = new THREE.MeshPhysicalMaterial({ color: 0x4d2b22, roughness: 0.55, clearcoat: 0.1 });
  for (let i = 0; i < 3; i += 1) {
    box(scene, `VISUAL_EducationBook_${i}`, [0.78, 0.08, 0.48], [-1.15, 1.29 + i * 0.085, 0.2 - i * 0.03], i === 1 ? burgundy : bookMat, [0, 0.12 - i * 0.08, 0]);
  }
}

export function buildGoldenReferenceStudio(scene) {
  if (scene.userData.goldenReferenceBuilt) return;
  scene.userData.goldenReferenceBuilt = true;
  addCareerWall(scene);
  addProjectWall(scene);
  addPortfolioWall(scene);
  addExecutiveFocalZone(scene);
  addEducationObject(scene);
  scene.userData.visualTarget = 'Michael Executive Studio Golden Reference';
  scene.userData.visualTargetStatus = 'candidate-pending-browser-uat';
}
