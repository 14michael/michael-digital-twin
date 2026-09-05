import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets', 'rc1');

const SOURCES = [
  {
    id: 'executive-chair',
    role: 'Executive chair',
    license: 'CC0 source asset',
    source: 'Poly Haven modern_arm_chair_01 via Teetertater/Floorplan2Walkthru mirror',
    type: 'gltf',
    url: 'https://raw.githubusercontent.com/Teetertater/Floorplan2Walkthru/main/public/assets/furniture/modern_arm_chair_01_1k.gltf/modern_arm_chair_01_1k.gltf',
  },
  {
    id: 'executive-desk',
    role: 'Executive desk',
    license: 'CC0 source asset',
    source: 'Poly Haven metal_office_desk via Teetertater/Floorplan2Walkthru mirror',
    type: 'gltf',
    url: 'https://raw.githubusercontent.com/Teetertater/Floorplan2Walkthru/main/public/assets/furniture/metal_office_desk_1k.gltf/metal_office_desk_1k.gltf',
  },
  {
    id: 'desk-lamp',
    role: 'Desk lamp',
    license: 'CC-BY-4.0 — attribution required',
    attribution: 'Desk lamp by KaramellGlass, CC-BY-4.0',
    source: 'KaramellGlass desk lamp via Teetertater/Floorplan2Walkthru mirror',
    type: 'glb',
    url: 'https://raw.githubusercontent.com/Teetertater/Floorplan2Walkthru/main/public/assets/furniture/desk_lamp/desk_lamp.glb',
    licenseUrl: 'https://raw.githubusercontent.com/Teetertater/Floorplan2Walkthru/main/public/assets/furniture/desk_lamp/license.txt',
  },
  {
    id: 'low-cabinet',
    role: 'Low cabinet',
    license: 'CC0 source asset',
    source: 'Poly Haven modern_wooden_cabinet via Teetertater/Floorplan2Walkthru mirror',
    type: 'gltf',
    url: 'https://raw.githubusercontent.com/Teetertater/Floorplan2Walkthru/main/public/assets/furniture/modern_wooden_cabinet_1k.gltf/modern_wooden_cabinet_1k.gltf',
  },
  {
    id: 'potted-plant',
    role: 'Interior plant',
    license: 'CC0 source asset',
    source: 'Poly Haven potted_plant_04 direct 2K glTF',
    type: 'gltf',
    url: 'https://dl.polyhaven.org/file/ph-assets/Models/gltf/2k/potted_plant_04/potted_plant_04_2k.gltf',
  },
];

function pad4(buffer, fill = 0) {
  const padding = (4 - (buffer.length % 4)) % 4;
  if (!padding) return buffer;
  return Buffer.concat([buffer, Buffer.alloc(padding, fill)]);
}

function stripTextureDependencies(gltf) {
  const source = structuredClone(gltf);
  source.images = [];
  source.textures = [];
  source.samplers = [];
  for (const material of source.materials || []) {
    if (material.pbrMetallicRoughness) {
      delete material.pbrMetallicRoughness.baseColorTexture;
      delete material.pbrMetallicRoughness.metallicRoughnessTexture;
    }
    delete material.normalTexture;
    delete material.occlusionTexture;
    delete material.emissiveTexture;
  }
  return source;
}

function toGlb(gltf, bin) {
  const source = stripTextureDependencies(gltf);
  if (!Array.isArray(source.buffers) || source.buffers.length !== 1) {
    throw new Error('RC1 vendoring currently requires exactly one glTF buffer');
  }
  delete source.buffers[0].uri;
  source.asset = { ...(source.asset || {}), generator: `${source.asset?.generator || 'unknown'}; RC1 vendor pipeline` };
  source.extras = { ...(source.extras || {}), rc1GeometryOnly: true, rc1TexturePolicy: 'runtime PBR remap; source images removed' };

  const json = pad4(Buffer.from(JSON.stringify(source)), 0x20);
  const body = pad4(bin, 0x00);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + json.length + 8 + body.length, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(json.length, 0);
  jsonHeader.writeUInt32LE(0x4e4f534a, 4);
  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(body.length, 0);
  binHeader.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([header, jsonHeader, json, binHeader, body]);
}

async function fetchBytes(url) {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function vendorGltf(spec) {
  const raw = await fetchBytes(spec.url);
  const gltf = JSON.parse(raw.toString('utf8'));
  const bufferUri = gltf.buffers?.[0]?.uri;
  if (!bufferUri) throw new Error(`${spec.id}: source glTF has no external buffer URI`);
  const binUrl = new URL(bufferUri, spec.url).href;
  const bin = await fetchBytes(binUrl);
  if (gltf.buffers[0].byteLength !== bin.length) {
    throw new Error(`${spec.id}: buffer length mismatch ${bin.length} != ${gltf.buffers[0].byteLength}`);
  }
  return toGlb(gltf, bin);
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const manifest = [];

  for (const spec of SOURCES) {
    const data = spec.type === 'gltf' ? await vendorGltf(spec) : await fetchBytes(spec.url);
    const file = `${spec.id}.glb`;
    await fs.writeFile(path.join(outDir, file), data);
    manifest.push({
      id: spec.id,
      role: spec.role,
      file,
      bytes: data.length,
      source: spec.source,
      sourceUrl: spec.url,
      license: spec.license,
      attribution: spec.attribution || null,
      processing: spec.type === 'gltf' ? 'Authored mesh/buffer preserved; source textures removed; packed as local GLB.' : 'Upstream authored GLB vendored without geometry modification.',
    });

    if (spec.licenseUrl) {
      const license = await fetchBytes(spec.licenseUrl);
      await fs.writeFile(path.join(outDir, `${spec.id}.LICENSE.txt`), license);
    }
    console.log(`VENDORED ${spec.id} ${data.length} bytes`);
  }

  await fs.writeFile(path.join(outDir, 'manifest.json'), `${JSON.stringify({ generatedBy: 'scripts/vendor-rc1-assets.mjs', assets: manifest }, null, 2)}\n`);
  await fs.writeFile(path.join(outDir, 'README.md'), `# RC1 vendored real assets\n\nGenerated by \`node scripts/vendor-rc1-assets.mjs\`. Do not hand-edit binary assets.\n\nThe application remaps all core furniture/plant materials at runtime, so source glTF textures are intentionally removed where possible. This reduces payload and eliminates remote texture dependencies while preserving authored mesh geometry, hierarchy, transforms, normals and UVs. The desk lamp remains the upstream authored GLB and carries its CC-BY-4.0 attribution/license file.\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
