import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

export const REAL_ASSET_REGISTRY = {
  executiveChair: {
    id: 'modern_arm_chair_01',
    source: 'Poly Haven / Igrium polyhaven-models',
    license: 'CC0 source asset',
    url: 'https://raw.githubusercontent.com/Igrium/polyhaven-models/master/Assets/models/furniture/modern_arm_chair_01.fbx',
    expectedRole: 'primary executive chair',
    targetHeight: 1.22,
  },
  pottedPlant: {
    id: 'potted_plant_04',
    source: 'Poly Haven / Igrium polyhaven-models',
    license: 'CC0 source asset',
    url: 'https://raw.githubusercontent.com/Igrium/polyhaven-models/master/Assets/models/props_garden/potted_plant_04.fbx',
    expectedRole: 'right-side interior plant',
    targetHeight: 1.55,
  },
};

const loader = new FBXLoader();

function loadFBX(url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`asset timeout: ${url}`)), timeoutMs);
    loader.load(
      url,
      (object) => {
        clearTimeout(timer);
        resolve(object);
      },
      undefined,
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
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

function normalizeToHeight(root, targetHeight, floorY = 0.02) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  if (!Number.isFinite(size.y) || size.y <= 0.0001) {
    throw new Error('asset has invalid bounding box');
  }

  const scale = targetHeight / size.y;
  root.scale.multiplyScalar(scale);
  root.updateMatrixWorld(true);

  const scaledBox = new THREE.Box3().setFromObject(root);
  const center = new THREE.Vector3();
  scaledBox.getCenter(center);

  // Rebase x/z around the model origin and place the lowest point on the floor.
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y += floorY - scaledBox.min.y;
  root.updateMatrixWorld(true);

  return { scale, bounds: new THREE.Box3().setFromObject(root) };
}

function chairMaterial(node) {
  const key = `${node.name || ''} ${node.material?.name || ''}`.toLowerCase();
  const isCushion = /pillow|seat|cush|leather|fabric|uphol/.test(key);
  if (isCushion) {
    return new THREE.MeshPhysicalMaterial({
      color: 0x5d1720,
      roughness: 0.36,
      clearcoat: 0.26,
      clearcoatRoughness: 0.48,
    });
  }
  return new THREE.MeshPhysicalMaterial({
    color: 0x54301f,
    roughness: 0.43,
    clearcoat: 0.14,
    clearcoatRoughness: 0.5,
  });
}

function plantMaterial(node) {
  const key = `${node.name || ''} ${node.material?.name || ''}`.toLowerCase();
  const isLeaf = /plant|leaf|leave|foliage/.test(key);
  const isSoil = /soil|dirt|ground/.test(key);
  if (isLeaf) {
    return new THREE.MeshPhysicalMaterial({
      color: 0x315b38,
      roughness: 0.78,
      sheen: 0.12,
      sheenRoughness: 0.8,
      side: THREE.DoubleSide,
    });
  }
  if (isSoil) {
    return new THREE.MeshStandardMaterial({ color: 0x2d2119, roughness: 1 });
  }
  return new THREE.MeshStandardMaterial({ color: 0x654938, roughness: 0.88 });
}

export async function loadExecutiveChair(scene, options = {}) {
  const spec = REAL_ASSET_REGISTRY.executiveChair;
  const chair = await loadFBX(spec.url, options.timeoutMs);
  prepareMesh(chair, chairMaterial);
  normalizeToHeight(chair, options.targetHeight ?? spec.targetHeight, 0.02);
  chair.position.add(new THREE.Vector3(...(options.position ?? [0.2, 0, 2.25])));
  chair.rotation.y = options.rotationY ?? Math.PI;
  chair.name = options.name ?? 'INTERACT_Chair';
  chair.userData.asset = { id: spec.id, source: spec.source, license: spec.license };
  scene.add(chair);
  return chair;
}

export async function loadPottedPlant(scene, options = {}) {
  const spec = REAL_ASSET_REGISTRY.pottedPlant;
  const plant = await loadFBX(spec.url, options.timeoutMs);
  prepareMesh(plant, plantMaterial);
  normalizeToHeight(plant, options.targetHeight ?? spec.targetHeight, 0.02);
  plant.position.add(new THREE.Vector3(...(options.position ?? [4.85, 0, -0.45])));
  plant.rotation.y = options.rotationY ?? -0.45;
  plant.name = options.name ?? 'INTERACT_Plant';
  plant.userData.asset = { id: spec.id, source: spec.source, license: spec.license };
  scene.add(plant);
  return plant;
}

export async function loadRC1RealAssets(scene, onProgress = () => {}) {
  const result = { loaded: [], failed: [] };
  const jobs = [
    ['executiveChair', () => loadExecutiveChair(scene)],
    ['pottedPlant', () => loadPottedPlant(scene)],
  ];

  await Promise.all(jobs.map(async ([id, task]) => {
    try {
      const object = await task();
      result.loaded.push(id);
      onProgress({ id, status: 'loaded', object, result });
    } catch (error) {
      result.failed.push({ id, message: String(error?.message || error) });
      onProgress({ id, status: 'failed', error, result });
    }
  }));

  return result;
}
