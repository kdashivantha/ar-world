import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Landmark } from '../geography/landmark.model';

@Injectable({ providedIn: 'root' })
export class ModelLoaderService {
  private readonly loader = new GLTFLoader();

  async loadLandmark(landmark: Landmark): Promise<THREE.Object3D> {
    try {
      const gltf = await this.loader.loadAsync(landmark.modelUrl);
      const root = gltf.scene;
      this.normalizeHeight(root, landmark.maxHeight);
      root.name = landmark.id;
      root.userData['landmarkId'] = landmark.id;
      return root;
    } catch (err) {
      console.warn(`GLB load failed for ${landmark.id}, using procedural fallback`, err);
      const fallback = this.createProcedural(landmark.id);
      this.normalizeHeight(fallback, landmark.maxHeight);
      fallback.name = landmark.id;
      fallback.userData['landmarkId'] = landmark.id;
      return fallback;
    }
  }

  normalizeHeight(object: THREE.Object3D, maxHeight: number): void {
    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    box.getSize(size);
    if (size.y <= 0.0001) {
      return;
    }
    const scale = maxHeight / size.y;
    object.scale.multiplyScalar(scale);
    const scaledBox = new THREE.Box3().setFromObject(object);
    object.position.y -= scaledBox.min.y;
  }

  private createProcedural(id: string): THREE.Object3D {
    switch (id) {
      case 'pisa':
        return this.leaningTower();
      case 'liberty':
      case 'redeemer':
        return this.statue(id === 'redeemer' ? 0xf5f0e6 : 0x3d8b6e);
      case 'bigben':
        return this.clockTower();
      case 'colosseum':
        return this.colosseum();
      case 'brandenburg':
        return this.gate();
      case 'parthenon':
        return this.temple();
      case 'basil':
        return this.onionDomes();
      case 'tajmahal':
        return this.domeBuilding(0xf8f4ec);
      case 'greatwall':
        return this.wallSegment();
      case 'burj':
        return this.skyscraper();
      case 'pyramids':
        return this.pyramids();
      case 'sydney':
        return this.operaShells();
      case 'eiffel':
      default:
        return this.eiffel();
    }
  }

  private eiffel(): THREE.Object3D {
    const group = new THREE.Group();
    const metal = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.5, roughness: 0.4 });
    for (const [w, h, y] of [
      [0.5, 0.12, 0.06],
      [0.3, 0.4, 0.35],
      [0.15, 0.35, 0.75],
      [0.06, 0.3, 1.1],
    ] as const) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), metal);
      m.position.y = y;
      group.add(m);
    }
    return group;
  }

  private leaningTower(): THREE.Object3D {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xf5f0e6 });
    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2 - i * 0.01, 0.21 - i * 0.01, 0.15, 16),
        mat
      );
      mesh.position.set(i * 0.02, 0.075 + i * 0.15, 0);
      group.add(mesh);
    }
    group.rotation.z = -0.12;
    return group;
  }

  private statue(color: number): THREE.Object3D {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.55 });
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.35), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
    pedestal.position.y = 0.1;
    group.add(pedestal);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.55, 12), mat);
    body.position.y = 0.5;
    group.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), mat);
    head.position.y = 0.85;
    group.add(head);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 8), mat);
    arm.position.set(0.12, 0.8, 0);
    arm.rotation.z = -0.7;
    group.add(arm);
    return group;
  }

  private clockTower(): THREE.Object3D {
    const group = new THREE.Group();
    const stone = new THREE.MeshStandardMaterial({ color: 0xd4c4a8 });
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.9, 0.28), stone);
    shaft.position.y = 0.45;
    group.add(shaft);
    const clock = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.34), stone);
    clock.position.y = 1.0;
    group.add(clock);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 4), new THREE.MeshStandardMaterial({ color: 0x4b5563 }));
    spire.position.y = 1.28;
    group.add(spire);
    return group;
  }

  private colosseum(): THREE.Object3D {
    const group = new THREE.Group();
    const stone = new THREE.MeshStandardMaterial({ color: 0xc4a574 });
    const outer = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.48, 0.35, 32, 1, true), stone);
    outer.position.y = 0.18;
    group.add(outer);
    const inner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.3, 0.32, 24, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xa8895a, side: THREE.BackSide })
    );
    inner.position.y = 0.16;
    group.add(inner);
    return group;
  }

  private gate(): THREE.Object3D {
    const group = new THREE.Group();
    const stone = new THREE.MeshStandardMaterial({ color: 0xe7e2d6 });
    for (const x of [-0.28, 0.28]) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.55, 0.1), stone);
      col.position.set(x, 0.28, 0);
      group.add(col);
    }
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.12, 0.14), stone);
    lintel.position.y = 0.6;
    group.add(lintel);
    const attic = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.16), stone);
    attic.position.y = 0.72;
    group.add(attic);
    return group;
  }

  private temple(): THREE.Object3D {
    const group = new THREE.Group();
    const marble = new THREE.MeshStandardMaterial({ color: 0xf0ebe0 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.45), marble);
    base.position.y = 0.04;
    group.add(base);
    for (let i = 0; i < 6; i++) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.4, 10), marble);
      col.position.set(-0.25 + i * 0.1, 0.28, 0.15);
      group.add(col);
      const col2 = col.clone();
      col2.position.z = -0.15;
      group.add(col2);
    }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.18, 4), marble);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 0.58;
    group.add(roof);
    return group;
  }

  private onionDomes(): THREE.Object3D {
    const group = new THREE.Group();
    const colors = [0xdc2626, 0x2563eb, 0xf59e0b, 0x16a34a, 0x7c3aed];
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.25, 0.55), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    base.position.y = 0.12;
    group.add(base);
    colors.forEach((color, i) => {
      const angle = (i / colors.length) * Math.PI * 2;
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 0.25, 8),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      stem.position.set(Math.cos(angle) * 0.16, 0.35, Math.sin(angle) * 0.16);
      group.add(stem);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshStandardMaterial({ color }));
      dome.position.copy(stem.position);
      dome.position.y += 0.18;
      dome.scale.y = 1.4;
      group.add(dome);
    });
    return group;
  }

  private domeBuilding(color: number): THREE.Object3D {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color });
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.25, 0.55), mat);
    base.position.y = 0.12;
    group.add(base);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), mat);
    dome.position.y = 0.42;
    group.add(dome);
    const minaret = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.55, 8), mat);
    minaret.position.set(0.28, 0.28, 0.28);
    group.add(minaret);
    return group;
  }

  private wallSegment(): THREE.Object3D {
    const group = new THREE.Group();
    const stone = new THREE.MeshStandardMaterial({ color: 0x9a8b74 });
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.12), stone);
    wall.position.y = 0.11;
    group.add(wall);
    for (const x of [-0.35, 0, 0.35]) {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.35, 0.14), stone);
      tower.position.set(x, 0.18, 0);
      group.add(tower);
    }
    return group;
  }

  private skyscraper(): THREE.Object3D {
    const group = new THREE.Group();
    const glass = new THREE.MeshStandardMaterial({ color: 0x93c5fd, metalness: 0.6, roughness: 0.25 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.16, 1.2, 6), glass);
    shaft.position.y = 0.6;
    group.add(shaft);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.25, 6), glass);
    tip.position.y = 1.32;
    group.add(tip);
    return group;
  }

  private pyramids(): THREE.Object3D {
    const group = new THREE.Group();
    const sand = new THREE.MeshStandardMaterial({ color: 0xd2b48c });
    const sizes = [
      [0.45, 0.4, 0, 0],
      [0.28, 0.26, 0.32, 0.05],
      [0.2, 0.18, -0.28, 0.08],
    ] as const;
    for (const [w, h, x, z] of sizes) {
      const p = new THREE.Mesh(new THREE.ConeGeometry(w / 2, h, 4), sand);
      p.rotation.y = Math.PI / 4;
      p.position.set(x, h / 2, z);
      group.add(p);
    }
    return group;
  }

  private operaShells(): THREE.Object3D {
    const group = new THREE.Group();
    const white = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
    for (let i = 0; i < 4; i++) {
      const shell = new THREE.Mesh(new THREE.SphereGeometry(0.18 - i * 0.015, 12, 8, 0, Math.PI), white);
      shell.rotation.x = -Math.PI / 2;
      shell.position.set(-0.2 + i * 0.14, 0.02, 0);
      group.add(shell);
    }
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.35), new THREE.MeshStandardMaterial({ color: 0xcbd5e1 }));
    base.position.y = 0.03;
    group.add(base);
    return group;
  }
}
