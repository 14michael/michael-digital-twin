import * as THREE from 'three';
import { applyRC1VisualFidelityLayer } from './visual-fidelity-rc1.js';

const walnut = new THREE.MeshPhysicalMaterial({ color: 0x3a2118, roughness: 0.48, clearcoat: 0.12 });
const walnutDark = new THREE.MeshPhysicalMaterial({ color: 0x24140f, roughness: 0.55, clearcoat: 0.08 });
const charcoal = new THREE.MeshStandardMaterial({ color: 0x151719, roughness: 0.52, metalness: 0.12 });
const brass = new THREE.MeshStandardMaterial({ color: 0xb98b4a, roughness: 0.28, metalness: 0.82 });
const burgundy = new THREE.MeshPhysicalMaterial({ color: 0x672b2a, roughness: 0.42, clearcoat: 0.22 });
const stone = new THREE.MeshStandardMaterial({ color: 0x777067, roughness: 0.9 });
const felt = new THREE.MeshStandardMaterial({ color: 0x262423, roughness: 0.95 });
const screenBlack = new THREE.MeshPhysicalMaterial({ color: 0x0c1013, roughness: 0.26, metalness: 0.28, clearcoat: 0.18 });

function box(scene, name, size, position, material, rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name; mesh.position.set(...position); mesh.rotation.set(...rotation);
  mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); return mesh;
}

function canvasPanel(scene, name, title, size, position, options = {}) {
  const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 900;
  const ctx = canvas.getContext('2d'); const bg = options.bg ?? '#151719'; const fg = '#efe2c8'; const accent = '#c89b5d';
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 1200, 900); ctx.strokeStyle = 'rgba(255,255,255,.13)'; ctx.lineWidth = 4; ctx.strokeRect(20, 20, 1160, 860);
  ctx.fillStyle = accent; ctx.font = '700 28px Microsoft JhengHei, sans-serif'; ctx.fillText(options.kicker ?? 'MICHAEL EXECUTIVE STUDIO', 58, 68);
  ctx.fillStyle = fg; ctx.font = `700 ${options.titleSize ?? 48}px Microsoft JhengHei, sans-serif`;
  title.split('\n').forEach((line, i) => ctx.fillText(line, 58, 145 + i * 58));
  (options.rows ?? []).forEach((row, i) => { const y = 360 + i * 112; ctx.fillStyle = accent; ctx.fillRect(58, y - 28, 9, 48); ctx.fillStyle = fg; ctx.font = '600 27px Microsoft JhengHei, sans-serif'; ctx.fillText(row[0], 90, y); ctx.fillStyle = '#b9b1a5'; ctx.font = '400 22px Microsoft JhengHei, sans-serif'; ctx.fillText(row[1], 90, y + 38); });
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(...size), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
  panel.name = name; panel.position.set(...position); panel.rotation.set(...(options.rotation ?? [0,0,0])); scene.add(panel); return panel;
}

function closeTo(v, t, tolerance = 0.04) { return Math.abs(v - t) <= tolerance; }
function removeLegacyPrototypeVisuals(scene) {
  const names = new Set(['about','career','projects']); const remove = [];
  scene.children.forEach((o) => {
    if (names.has(o.name)) return remove.push(o);
    if (!o.isMesh) return;
    const p = o.position;
    const legacyDesk = p.z > -0.8 && p.z < 1.3 && p.y > 0.45 && p.y < 2.7 && p.x > -2.5 && p.x < 2.8;
    const legacyBackBoard = p.z < -4.0 && p.y > 0.4 && p.y < 4.5 && (p.x > -6 && p.x < 5);
    const legacyPortfolio = p.x > 5.7 && p.y > 0.8 && p.y < 4.2;
    if (legacyDesk || legacyBackBoard || legacyPortfolio || (closeTo(p.y,0.025) && closeTo(p.z,1.4))) remove.push(o);
  });
  remove.forEach((o) => { scene.remove(o); o.geometry?.dispose?.(); });
  scene.userData.legacyPrototypeVisualsRemoved = remove.length;
}

function addArchitecturalEnvelope(scene) {
  box(scene,'VISUAL_BackWall_WalnutField',[12.18,4.92,.08],[0,2.55,-4.25],walnutDark);
  box(scene,'VISUAL_LeftWall_WalnutField',[.08,4.92,8.55],[-6.17,2.55,0],walnutDark);
  box(scene,'VISUAL_RightWall_WalnutField',[.08,4.92,8.55],[6.17,2.55,0],walnutDark);
  for(let x=-5.7;x<=5.7;x+=.42) box(scene,`VISUAL_BackSlat_${x.toFixed(2)}`,[.055,4.7,.035],[x,2.52,-4.19],walnut);
  box(scene,'VISUAL_BackPlinth',[12.1,.18,.18],[0,.18,-4.08],brass);
}

function addCareerWall(scene) {
  box(scene,'VISUAL_CareerWall_Frame',[3.7,4.05,.13],[-4.08,2.55,-4.03],walnutDark);
  canvasPanel(scene,'VISUAL_CareerWall_Content','CAREER\nJOURNEY',[3.18,3.52],[-4.08,2.62,-3.955],{kicker:'CAREER TIMELINE',rows:[['1985–1987','工程官｜工程管理基礎'],['現場階段','工程師 → 組長 → 工地主任'],['採發階段','採購發包｜成本與契約治理'],['2018–2026','業務處經理｜跨專案治理']]});
}

function addProjectWall(scene) {
  box(scene,'VISUAL_ProjectWall_Frame',[5.9,4.05,.13],[.78,2.55,-4.03],walnutDark);
  canvasPanel(scene,'VISUAL_ProjectWall_Content','PROJECTS × METHODS\nAI ENGINEERING GOVERNANCE',[5.38,3.52],[.78,2.62,-3.955],{bg:'#111517',kicker:'PROJECT / METHOD / AI',titleSize:39,rows:[['代表工程','公共工程｜商業建築｜特殊建築'],['管理閉環','偏差 → 原因 → 責任 → 改善 → 驗證'],['採購治理','風險分配｜界面定義｜成本鎖定'],['AI Lab','Agent｜KMS｜Dashboard｜Knowledge Loop']]});
  const glow=new THREE.PointLight(0x78c7cf,4.2,4.5,2.2); glow.name='VISUAL_AIAccentGlow'; glow.position.set(2.9,2.25,-2.85); scene.add(glow);
}

function addPortfolioWall(scene) {
  box(scene,'VISUAL_PortfolioWall_Frame',[.13,4.05,6.55],[6.03,2.55,0],walnutDark);
  ['PUBLIC WORKS','COST / PROCUREMENT','SOP / DASHBOARD','BOOK / COURSE','AI SYSTEM','EVIDENCE ONLY'].forEach((label,i)=>{ const row=i%3,col=Math.floor(i/3),y=1.55+row*1.12,z=-2.1+col*4.15; box(scene,`VISUAL_PortfolioFrame_${i}`,[.09,.9,1.78],[5.92,y,z],walnut,[0,Math.PI/2,0]); canvasPanel(scene,`VISUAL_PortfolioCard_${i}`,label,[1.5,.68],[5.865,y,z],{rotation:[0,-Math.PI/2,0],bg:i%2?'#25211d':'#171a1c',kicker:'PORTFOLIO EVIDENCE',titleSize:32}); });
}

function addExecutiveFocalZone(scene) {
  const rug=new THREE.Mesh(new THREE.CylinderGeometry(2.8,2.8,.045,96),stone); rug.name='VISUAL_ExecutiveRug'; rug.scale.z=.7; rug.position.set(.2,.018,1.35); rug.receiveShadow=true; scene.add(rug);
  box(scene,'VISUAL_DeskFrontAccent',[3.6,.66,.09],[.18,.52,1.12],walnutDark);
  box(scene,'VISUAL_DeskFrontLeatherInset',[2.42,.42,.045],[.18,.55,1.165],burgundy);
  const keyboard=box(scene,'VISUAL_Keyboard',[.95,.045,.34],[.18,1.24,.42],charcoal); keyboard.userData.decorativeOnly=true;
  for(let r=0;r<4;r++) for(let c=0;c<12;c++) box(scene,`VISUAL_Key_${r}_${c}`,[.055,.012,.052],[-.1+c*.066,1.27,.31+r*.066],screenBlack);
  box(scene,'VISUAL_Phone',[.34,.025,.68],[1.36,1.25,.3],screenBlack,[0,.18,0]); box(scene,'VISUAL_Notebook',[.78,.035,.58],[-1.05,1.24,.38],burgundy,[0,-.12,0]);
  const coaster=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.018,40),felt); coaster.position.set(1.72,1.24,.2); scene.add(coaster);
  const strip=new THREE.RectAreaLight(0xffc37a,5.4,10.2,.18); strip.name='VISUAL_CoveWarmLight'; strip.position.set(0,4.95,-3.86); strip.lookAt(0,2.4,-1.2); scene.add(strip);
}

function addEducationObject(scene){ for(let i=0;i<3;i++) box(scene,`VISUAL_EducationBook_${i}`,[.78,.08,.48],[-1.15,1.29+i*.085,.2-i*.03],i===1?burgundy:walnut,[0,.12-i*.08,0]); }

export function buildGoldenReferenceStudio(scene) {
  if(scene.userData.goldenReferenceBuilt) return; scene.userData.goldenReferenceBuilt=true;
  removeLegacyPrototypeVisuals(scene); addArchitecturalEnvelope(scene); addCareerWall(scene); addProjectWall(scene); addPortfolioWall(scene); addExecutiveFocalZone(scene); addEducationObject(scene); applyRC1VisualFidelityLayer(scene);
  scene.userData.visualTarget='Michael Executive Studio Golden Reference'; scene.userData.visualTargetStatus='candidate-pending-browser-uat';
}
