import * as THREE from 'three';

const MAT = {
  walnut: new THREE.MeshPhysicalMaterial({ color: 0x321b13, roughness: 0.42, clearcoat: 0.16 }),
  walnut2: new THREE.MeshPhysicalMaterial({ color: 0x4a291c, roughness: 0.38, clearcoat: 0.2 }),
  brass: new THREE.MeshStandardMaterial({ color: 0xb68a4a, roughness: 0.24, metalness: 0.86 }),
  ceiling: new THREE.MeshStandardMaterial({ color: 0x302923, roughness: 0.82 }),
  leather: new THREE.MeshPhysicalMaterial({ color: 0x5b2424, roughness: 0.36, clearcoat: 0.25 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x111315, roughness: 0.5, metalness: 0.14 }),
};

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

function addCeilingAndLighting(scene) {
  // Golden-reference composition: a dark timber ceiling frame keeps the eye on the
  // illuminated evidence walls and executive desk instead of an open white void.
  box(scene, 'FIDELITY_CeilingField', [12.15, 0.12, 8.25], [0, 5.18, 0], MAT.ceiling);
  for (let x = -5.4; x <= 5.4; x += 1.8) {
    box(scene, `FIDELITY_CeilingBeam_${x.toFixed(1)}`, [0.10, 0.16, 8.0], [x, 5.08, 0], MAT.walnut2);
  }
  for (let z = -3.55; z <= 3.55; z += 1.78) {
    box(scene, `FIDELITY_CeilingCross_${z.toFixed(1)}`, [11.5, 0.10, 0.08], [0, 5.04, z], MAT.brass);
  }

  const spots = [
    [-4.2, 4.88, -2.7, -4.2, 2.4, -4.0],
    [-1.5, 4.88, -2.8, -1.5, 2.5, -4.0],
    [1.4, 4.88, -2.8, 1.4, 2.5, -4.0],
    [4.3, 4.88, -2.7, 4.3, 2.4, -4.0],
    [4.9, 4.88, 0.3, 5.8, 2.4, 0.2],
  ];
  spots.forEach(([x, y, z, tx, ty, tz], i) => {
    const light = new THREE.SpotLight(0xffc982, 23, 9, Math.PI / 7, 0.48, 1.35);
    light.name = `FIDELITY_WallWash_${i}`;
    light.position.set(x, y, z);
    light.target.position.set(tx, ty, tz);
    light.castShadow = i < 2;
    scene.add(light, light.target);
    const trim = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 24), MAT.dark);
    trim.name = `FIDELITY_DownlightTrim_${i}`;
    trim.position.set(x, 5.0, z);
    scene.add(trim);
  });
}

function addExecutiveDeskBackdrop(scene) {
  // A layered credenza/backdrop gives the desk the same visual hierarchy as the
  // reference render and avoids the previous flat-board appearance.
  box(scene, 'FIDELITY_CredenzaBody', [5.35, 0.72, 0.58], [0.7, 0.48, -3.58], MAT.walnut);
  box(scene, 'FIDELITY_CredenzaTop', [5.55, 0.09, 0.72], [0.7, 0.89, -3.56], MAT.walnut2);
  for (let x = -1.55; x <= 2.95; x += 1.5) {
    box(scene, `FIDELITY_CredenzaDoor_${x.toFixed(2)}`, [1.34, 0.48, 0.04], [x, 0.48, -3.255], MAT.walnut2);
    box(scene, `FIDELITY_CredenzaPull_${x.toFixed(2)}`, [0.22, 0.025, 0.035], [x, 0.55, -3.225], MAT.brass);
  }
  box(scene, 'FIDELITY_DeskLeatherPad', [1.85, 0.025, 0.72], [0.15, 1.235, 0.28], MAT.leather);
}

function addArchitecturalDepth(scene) {
  // Brass reveals and side-wall battens make the room read as a designed executive
  // studio rather than three flat planes.
  [-5.82, -3.88, -1.94, 0, 1.94, 3.88, 5.82].forEach((x, i) => {
    box(scene, `FIDELITY_BackReveal_${i}`, [0.028, 4.55, 0.025], [x, 2.55, -4.16], MAT.brass);
  });
  for (let z = -3.55; z <= 3.55; z += 0.62) {
    box(scene, `FIDELITY_RightBatten_${z.toFixed(2)}`, [0.035, 4.55, 0.08], [5.99, 2.55, z], MAT.walnut2);
  }
  box(scene, 'FIDELITY_LeftHeader', [0.12, 0.16, 8.0], [-5.98, 4.82, 0], MAT.brass);
  box(scene, 'FIDELITY_RightHeader', [0.12, 0.16, 8.0], [5.98, 4.82, 0], MAT.brass);
}

export function applyRC1VisualFidelityLayer(scene) {
  if (scene.userData.rc1VisualFidelityLayer) return;
  scene.userData.rc1VisualFidelityLayer = true;
  addCeilingAndLighting(scene);
  addArchitecturalDepth(scene);
  addExecutiveDeskBackdrop(scene);
  scene.userData.visualFidelityRevision = 'RC1-FIDELITY-02';
}
