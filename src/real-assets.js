import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { buildGoldenReferenceStudio } from './spatial-studio.js';

const RC1_ASSET_BASE = new URL('../assets/rc1/', import.meta.url);

export const REAL_ASSET_REGISTRY = {
  executiveChair: {
    id: 'modern_arm_chair_01',
    source: 'Poly Haven CC0 / Teetertater Floorplan2Walkthru mirror; vendored by scripts/vendor-rc1-assets.mjs',
    license: 'CC0 source asset',
    url: new URL('executive-chair.glb', RC1_ASSET_BASE).href,
    format: 'local-glb-geometry-only',
    expectedRole: 'primary executive chair',
    targetHeight: 1.22,
  },
  executiveDesk: {
    id: 'metal_office_desk',
    source: 'Poly Haven CC0 / Teetertater Floorplan2Walkthru mirror; vendored by scripts/vendor-rc1-assets.mjs',
    license: 'CC0 source asset',
    url: new URL('executive-desk.glb', RC1_ASSET_BASE).href,
    format: 'local-glb-geometry-only',
    expectedRole: 'primary executive desk',
    targetWidth: 2.8,
  },
  deskLamp: {
    id: 'desk_lamp_karamellglass',
    source: 'KaramellGlass / Sketchfab mirror in Teetertater Floorplan2Walkthru; vendored upstream GLB',
    license: 'CC-BY-4.0 — attribution required',
    attribution: 'Desk lamp by KaramellGlass, CC-BY-4.0',
    url: new URL('desk-lamp.glb', RC1_ASSET_BASE).href,
    format: 'local-glb',
    expectedRole: 'brass desk lamp',
    targetHeight: 0.86,
  },
  lowCabinet: {
    id: 'modern_wooden_cabinet',
    source: 'Poly Haven CC0 / Teetertater Floorplan2Walkthru mirror; vendored by scripts/vendor-rc1-assets.mjs',
    license: 'CC0 source asset',
    url: new URL('low-cabinet.glb', RC1_ASSET_BASE).href,
    format: 'local-glb-geometry-only',
    expectedRole: 'warm low cabinet pair',
    targetWidth: 2.45,
  },
  pottedPlant: {
    id: 'potted_plant_04',
    source: 'Poly Haven direct 2K glTF; vendored by scripts/vendor-rc1-assets.mjs',
    license: 'CC0 source asset',
    url: new URL('potted-plant.glb', RC1_ASSET_BASE).href,
    format: 'local-glb-geometry-only',
    expectedRole: 'right-side interior plant',
    targetHeight: 1.55,
  },
};

const gltfLoader = new GLTFLoader();

function withTimeout(load, url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error(`asset timeout: ${url}`));
    }, timeoutMs);
    load(
      (object) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(object);
      },
      (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function loadGLTF(url, timeoutMs = 15000) {
  return withTimeout(
    (resolve, reject) => gltfLoader.load(url, (gltf) => resolve(gltf.scene), undefined, reject),
    url,
    timeoutMs,
  );
}

function prepareMesh(root, materialResolver) {
  root.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;
    const material = materialResolver?.(node);
    if (material) node.material = material;
  });
  return root;
}

function normalizeByAxis(root, axis, targetSize, floorY = 0.02) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  const current = size[axis];
  if (!Number.isFinite(current) || current <= 0.0001) throw new Error(`asset has invalid ${axis}-axis bounding box`);
  const scale = targetSize / current;
  root.scale.multiplyScalar(scale);
  root.updateMatrixWorld(true);
  const scaledBox = new THREE.Box3().setFromObject(root);
  const center = new THREE.Vector3();
  scaledBox.getCenter(center);
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y += floorY - scaledBox.min.y;
  root.updateMatrixWorld(true);
  return { scale, bounds: new THREE.Box3().setFromObject(root) };
}

function chairMaterial(node) {
  const key = `${node.name || ''} ${node.material?.name || ''}`.toLowerCase();
  if (/pillow|seat|cush|leather|fabric|uphol/.test(key)) {
    return new THREE.MeshPhysicalMaterial({ color: 0x6b2426, roughness: 0.34, clearcoat: 0.3, clearcoatRoughness: 0.44 });
  }
  return new THREE.MeshPhysicalMaterial({ color: 0x3b2419, roughness: 0.4, clearcoat: 0.12, clearcoatRoughness: 0.5 });
}

function warmWalnutMaterial(node) {
  const key = `${node.name || ''} ${node.material?.name || ''}`.toLowerCase();
  if (/handle|metal|tray/.test(key)) return new THREE.MeshStandardMaterial({ color: 0x3b332c, roughness: 0.3, metalness: 0.82 });
  return new THREE.MeshPhysicalMaterial({ color: 0x4e2b1d, roughness: 0.34, clearcoat: 0.2, clearcoatRoughness: 0.46 });
}

function lampMaterial() {
  return new THREE.MeshPhysicalMaterial({ color: 0xb7833f, roughness: 0.23, metalness: 0.84, clearcoat: 0.2, clearcoatRoughness: 0.35 });
}

function plantMaterial(node) {
  const key = `${node.name || ''} ${node.material?.name || ''}`.toLowerCase();
  if (/plant|leaf|leave|foliage/.test(key)) return new THREE.MeshPhysicalMaterial({ color: 0x315b38, roughness: 0.78, sheen: 0.12, sheenRoughness: 0.8, side: THREE.DoubleSide });
  if (/soil|dirt|ground/.test(key)) return new THREE.MeshStandardMaterial({ color: 0x2d2119, roughness: 1 });
  return new THREE.MeshStandardMaterial({ color: 0x654938, roughness: 0.88 });
}

function attachMetadata(object, spec) {
  object.userData.asset = { id: spec.id, source: spec.source, license: spec.license, format: spec.format, attribution: spec.attribution || null };
  return object;
}

export async function loadExecutiveChair(scene, options = {}) {
  const spec = REAL_ASSET_REGISTRY.executiveChair;
  const chair = await loadGLTF(spec.url, options.timeoutMs);
  prepareMesh(chair, chairMaterial);
  normalizeByAxis(chair, 'y', options.targetHeight ?? spec.targetHeight, 0.02);
  chair.position.add(new THREE.Vector3(...(options.position ?? [0.15, 0, 2.18])));
  chair.rotation.y = options.rotationY ?? Math.PI;
  chair.name = options.name ?? 'INTERACT_Chair';
  attachMetadata(chair, spec);
  scene.add(chair);
  return chair;
}

export async function loadExecutiveDesk(scene, options = {}) {
  const spec = REAL_ASSET_REGISTRY.executiveDesk;
  const desk = await loadGLTF(spec.url, options.timeoutMs);
  prepareMesh(desk, warmWalnutMaterial);
  normalizeByAxis(desk, 'x', options.targetWidth ?? spec.targetWidth, 0.02);
  desk.position.add(new THREE.Vector3(...(options.position ?? [0.15, 0, 0.35])));
  desk.rotation.y = options.rotationY ?? 0;
  desk.name = options.name ?? 'INTERACT_Desk';
  attachMetadata(desk, spec);
  scene.add(desk);
  return desk;
}

export async function loadDeskLamp(scene, options = {}) {
  const spec = REAL_ASSET_REGISTRY.deskLamp;
  const lamp = await loadGLTF(spec.url, options.timeoutMs);
  prepareMesh(lamp, () => lampMaterial());
  normalizeByAxis(lamp, 'y', options.targetHeight ?? spec.targetHeight, 0.82);
  lamp.position.add(new THREE.Vector3(...(options.position ?? [0.98, 0, -0.08])));
  lamp.rotation.y = options.rotationY ?? -0.55;
  lamp.name = options.name ?? 'INTERACT_Lamp';
  attachMetadata(lamp, spec);
  scene.add(lamp);
  return lamp;
}

export async function loadLowCabinetPair(scene, options = {}) {
  const spec = REAL_ASSET_REGISTRY.lowCabinet;
  const cabinet = await loadGLTF(spec.url, options.timeoutMs);
  prepareMesh(cabinet, warmWalnutMaterial);
  normalizeByAxis(cabinet, 'x', options.targetWidth ?? spec.targetWidth, 0.02);
  cabinet.name = 'VISUAL_LowCabinet_Left';
  cabinet.position.add(new THREE.Vector3(...(options.leftPosition ?? [-3.55, 0, -3.6])));
  cabinet.rotation.y = options.rotationY ?? 0;
  attachMetadata(cabinet, spec);
  scene.add(cabinet);
  const right = cabinet.clone(true);
  right.name = 'VISUAL_LowCabinet_Right';
  right.position.set(...(options.rightPosition ?? [3.75, 0, -3.6]));
  attachMetadata(right, spec);
  scene.add(right);
  return [cabinet, right];
}

export async function loadPottedPlant(scene, options = {}) {
  const spec = REAL_ASSET_REGISTRY.pottedPlant;
  const plant = await loadGLTF(spec.url, options.timeoutMs);
  prepareMesh(plant, plantMaterial);
  normalizeByAxis(plant, 'y', options.targetHeight ?? spec.targetHeight, 0.02);
  plant.position.add(new THREE.Vector3(...(options.position ?? [4.85, 0, -0.45])));
  plant.rotation.y = options.rotationY ?? -0.45;
  plant.name = options.name ?? 'INTERACT_Plant';
  attachMetadata(plant, spec);
  scene.add(plant);
  return plant;
}

export async function loadRC1RealAssets(scene, onProgress = () => {}) {
  buildGoldenReferenceStudio(scene);
  const result = { loaded: [], failed: [], assetsLoaded: [], assetsFailed: [] };
  const jobs = [
    ['executiveChair', () => loadExecutiveChair(scene)],
    ['executiveDesk', () => loadExecutiveDesk(scene)],
    ['deskLamp', () => loadDeskLamp(scene)],
    ['lowCabinet', () => loadLowCabinetPair(scene)],
    ['pottedPlant', () => loadPottedPlant(scene)],
  ];
  await Promise.all(jobs.map(async ([id, task]) => {
    try {
      const object = await task();
      result.assetsLoaded.push(id);
      onProgress({ id, status: 'loaded', object, result });
    } catch (error) {
      const failure = { id, message: String(error?.message || error) };
      result.assetsFailed.push(failure);
      onProgress({ id, status: 'failed', error, result });
    }
  }));
  const executiveSuiteIds = ['executiveChair', 'executiveDesk', 'deskLamp', 'lowCabinet'];
  if (executiveSuiteIds.every((id) => result.assetsLoaded.includes(id))) result.loaded.push('executiveSuite');
  else result.failed.push({ id: 'executiveSuite', message: 'one or more executive suite assets failed' });
  if (result.assetsLoaded.includes('pottedPlant')) result.loaded.push('pottedPlant');
  else result.failed.push({ id: 'pottedPlant', message: 'potted plant failed' });
  return result;
}
