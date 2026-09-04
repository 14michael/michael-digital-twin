import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

export const REAL_ASSET_REGISTRY = {
  executiveChair: {
    id: 'modern_arm_chair_01',
    source: 'Poly Haven / Igrium polyhaven-models',
    license: 'CC0 source asset',
    url: 'https://raw.githubusercontent.com/Igrium/polyhaven-models/master/Assets/models/furniture/modern_arm_chair_01.fbx',
    expectedRole: 'primary executive chair',
  },
  pottedPlant: {
    id: 'potted_plant_04',
    source: 'Poly Haven / Igrium polyhaven-models',
    license: 'CC0 source asset',
    url: 'https://raw.githubusercontent.com/Igrium/polyhaven-models/master/Assets/models/props_garden/potted_plant_04.fbx',
    expectedRole: 'right-side interior plant',
  },
};

const loader = new FBXLoader();

function prepareMesh(root, materialResolver) {
  root.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;
    if (materialResolver) node.material = materialResolver(node);
  });
  return root;
}

function loadFBX(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

export async function loadExecutiveChair(scene, options = {}) {
  const chair = await loadFBX(REAL_ASSET_REGISTRY.executiveChair.url);
  prepareMesh(chair, (node) => {
    const name = (node.name || '').toLowerCase();
    const isCushion = /pillow|seat|cush|leather/.test(name);
    return new THREE.MeshPhysicalMaterial({
      color: isCushion ? 0x681a24 : 0x5b3825,
      roughness: isCushion ? 0.34 : 0.44,
      clearcoat: isCushion ? 0.34 : 0.12,
      clearcoatRoughness: 0.45,
    });
  });
  chair.scale.setScalar(options.scale ?? 0.018);
  chair.position.fromArray(options.position ?? [0.2, 0.05, 2.25]);
  chair.rotation.y = options.rotationY ?? Math.PI;
  chair.name = options.name ?? 'INTERACT_Chair';
  scene.add(chair);
  return chair;
}

export async function loadPottedPlant(scene, options = {}) {
  const plant = await loadFBX(REAL_ASSET_REGISTRY.pottedPlant.url);
  prepareMesh(plant, (node) => {
    const name = (node.name || '').toLowerCase();
    const isLeaf = /plant|leaf|leave/.test(name);
    return new THREE.MeshStandardMaterial({
      color: isLeaf ? 0x355f3b : 0x5a4030,
      roughness: isLeaf ? 0.82 : 0.9,
    });
  });
  plant.scale.setScalar(options.scale ?? 0.018);
  plant.position.fromArray(options.position ?? [4.85, 0.02, -0.45]);
  plant.rotation.y = options.rotationY ?? -0.45;
  plant.name = options.name ?? 'INTERACT_Plant';
  scene.add(plant);
  return plant;
}

export async function loadRC1RealAssets(scene, onProgress = () => {}) {
  const result = { loaded: [], failed: [] };
  const jobs = [
    ['executiveChair', () => loadExecutiveChair(scene)],
    ['pottedPlant', () => loadPottedPlant(scene)],
  ];

  for (const [id, task] of jobs) {
    try {
      const object = await task();
      result.loaded.push(id);
      onProgress({ id, status: 'loaded', object, result });
    } catch (error) {
      result.failed.push({ id, message: String(error?.message || error) });
      onProgress({ id, status: 'failed', error, result });
    }
  }
  return result;
}
