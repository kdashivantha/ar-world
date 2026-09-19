/**
 * Generates lightweight procedural landmark GLBs (Eiffel-like, Pisa-like, Statue-like)
 * for offline AR demos. Replace with Sketchfab downloads when ready.
 */
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { Blob } from 'node:buffer';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// GLTFExporter expects browser Blob/FileReader APIs.
globalThis.Blob = Blob;
globalThis.FileReader = class FileReader {
  result = null;
  onloadend = null;
  onerror = null;
  readAsArrayBuffer(blob) {
    Promise.resolve(blob.arrayBuffer())
      .then((buf) => {
        this.result = buf;
        this.onloadend?.({ target: this });
      })
      .catch((err) => this.onerror?.(err));
  }
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'models');
mkdirSync(outDir, { recursive: true });

function exportGlb(scene, filename) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (result) => {
        writeFileSync(join(outDir, filename), Buffer.from(result));
        console.log('Wrote', filename, Buffer.from(result).length, 'bytes');
        resolve();
      },
      (err) => reject(err),
      { binary: true }
    );
  });
}

function makeEiffel() {
  const root = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.6, roughness: 0.35 });

  const levels = [
    { y: 0.05, w: 0.55, h: 0.1 },
    { y: 0.35, w: 0.32, h: 0.5 },
    { y: 0.75, w: 0.18, h: 0.35 },
    { y: 1.05, w: 0.08, h: 0.25 },
  ];

  for (const level of levels) {
    const geo = new THREE.BoxGeometry(level.w, level.h, level.w);
    const mesh = new THREE.Mesh(geo, metal);
    mesh.position.y = level.y;
    root.add(mesh);
  }

  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.2, 8), metal);
  tip.position.y = 1.25;
  root.add(tip);

  // Cross braces (simple X on each face)
  const braceMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, metalness: 0.5, roughness: 0.4 });
  for (const angle of [0, Math.PI / 2]) {
    const brace = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.9, 0.02), braceMat);
    brace.position.set(0, 0.5, 0);
    brace.rotation.y = angle;
    brace.rotation.z = 0.25;
    root.add(brace);
    const brace2 = brace.clone();
    brace2.rotation.z = -0.25;
    root.add(brace2);
  }

  return root;
}

function makePisa() {
  const root = new THREE.Group();
  const stone = new THREE.MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.8 });
  const lean = 0.12;

  for (let i = 0; i < 8; i++) {
    const r = 0.18 - i * 0.008;
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.02, 0.14, 24, 1, true), stone);
    ring.position.y = 0.07 + i * 0.14;
    ring.position.x = i * lean * 0.08;
    root.add(ring);

    const floor = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.95, r * 0.95, 0.03, 24), stone);
    floor.position.y = ring.position.y - 0.06;
    floor.position.x = ring.position.x;
    root.add(floor);
  }

  root.rotation.z = -lean;
  return root;
}

function makeLiberty() {
  const root = new THREE.Group();
  const green = new THREE.MeshStandardMaterial({ color: 0x3d8b6e, metalness: 0.3, roughness: 0.5 });
  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.35), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
  pedestal.position.y = 0.125;
  root.add(pedestal);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.55, 12), green);
  body.position.y = 0.55;
  root.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), green);
  head.position.y = 0.9;
  root.add(head);

  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 8), green);
  arm.position.set(0.12, 0.85, 0);
  arm.rotation.z = -0.7;
  root.add(arm);

  const torch = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xaa8800 }));
  torch.position.set(0.22, 1.05, 0);
  root.add(torch);

  return root;
}

const scenes = [
  ['eiffel.glb', makeEiffel],
  ['pisa.glb', makePisa],
  ['liberty.glb', makeLiberty],
];

for (const [name, factory] of scenes) {
  const group = factory();
  const scene = new THREE.Scene();
  scene.add(group);
  await exportGlb(scene, name);
}

console.log('Landmark models generated in public/models');
