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
    // Rest on the map plane (y = 0)
    const scaledBox = new THREE.Box3().setFromObject(object);
    object.position.y -= scaledBox.min.y;
  }

  private createProcedural(id: string): THREE.Object3D {
    const group = new THREE.Group();
    if (id === 'pisa') {
      const mat = new THREE.MeshStandardMaterial({ color: 0xf5f0e6 });
      for (let i = 0; i < 6; i++) {
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.2 - i * 0.01, 0.21 - i * 0.01, 0.15, 16), mat);
        mesh.position.set(i * 0.02, 0.075 + i * 0.15, 0);
        group.add(mesh);
      }
      group.rotation.z = -0.12;
      return group;
    }
    if (id === 'liberty') {
      const green = new THREE.MeshStandardMaterial({ color: 0x3d8b6e });
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.7, 12), green);
      body.position.y = 0.45;
      group.add(body);
      return group;
    }
    // Default: Eiffel-like stacked boxes
    const metal = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.5, roughness: 0.4 });
    const parts = [
      [0.5, 0.12, 0.06],
      [0.3, 0.4, 0.35],
      [0.15, 0.35, 0.75],
      [0.06, 0.3, 1.1],
    ] as const;
    for (const [w, h, y] of parts) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), metal);
      m.position.y = y;
      group.add(m);
    }
    return group;
  }
}
