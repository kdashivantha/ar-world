import { Injectable, inject, NgZone } from '@angular/core';
import * as THREE from 'three';
import { MapProjectionService } from '../geography/map-projection.service';
import type { Landmark, MapConfig } from '../geography/landmark.model';
import { ModelLoaderService } from './model-loader.service';

// mind-ar ships a CJS browser build; Angular esbuild can load it via default import.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MindARThreeInstance = any;

export type ArStatus = 'idle' | 'starting' | 'running' | 'error' | 'stopped';

@Injectable({ providedIn: 'root' })
export class ArSessionService {
  private readonly zone = inject(NgZone);
  private readonly projection = inject(MapProjectionService);
  private readonly models = inject(ModelLoaderService);

  private mindarThree: MindARThreeInstance | null = null;
  private anchorGroup: THREE.Group | null = null;
  private landmarks = new Map<string, THREE.Object3D>();
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private container: HTMLElement | null = null;
  private onSelect: ((id: string) => void) | null = null;

  status: ArStatus = 'idle';
  errorMessage = '';

  async start(
    container: HTMLElement,
    mindTargetUrl: string,
    map: MapConfig,
    landmarks: Landmark[],
    onSelect?: (id: string) => void
  ): Promise<void> {
    if (this.status === 'running' || this.status === 'starting') {
      return;
    }
    this.status = 'starting';
    this.errorMessage = '';
    this.container = container;
    this.onSelect = onSelect ?? null;

    try {
      const { MindARThree } = await import('mind-ar/dist/mindar-image-three.prod.js');

      await this.zone.runOutsideAngular(async () => {
        this.mindarThree = new MindARThree({
          container,
          imageTargetSrc: mindTargetUrl,
          filterMinCF: 0.0001,
          filterBeta: 0.001,
        });

        const { renderer, scene, camera } = this.mindarThree;
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.1);
        scene.add(light);
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(0, 1, 1);
        scene.add(dir);

        const anchor = this.mindarThree.addAnchor(0);
        this.anchorGroup = anchor.group;
        const group = this.anchorGroup;
        if (!group) {
          throw new Error('MindAR anchor group missing');
        }

        // Semi-transparent plane matching target aspect (helps visualize lock)
        const height = 1 / map.aspect;
        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(1, height),
          new THREE.MeshBasicMaterial({
            color: 0x22c55e,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide,
          })
        );
        group.add(plane);

        for (const landmark of landmarks) {
          const obj = await this.models.loadLandmark(landmark);
          const pos = this.projection.toThreePosition(landmark.longitude, landmark.latitude, map);
          // Models are Y-up; rotate so they stand out of the map (+Z toward camera).
          obj.rotation.x = Math.PI / 2;
          obj.position.set(pos.x, pos.y, pos.z);
          group.add(obj);
          this.landmarks.set(landmark.id, obj);
        }

        container.addEventListener('pointerdown', this.handlePointer);

        await this.mindarThree.start();
        renderer.setAnimationLoop(() => {
          renderer.render(scene, camera);
        });
      });

      this.status = 'running';
    } catch (err) {
      console.error(err);
      this.status = 'error';
      this.errorMessage = err instanceof Error ? err.message : String(err);
      await this.stop();
      throw err;
    }
  }

  async stop(): Promise<void> {
    this.container?.removeEventListener('pointerdown', this.handlePointer);
    if (this.mindarThree) {
      try {
        this.mindarThree.renderer?.setAnimationLoop(null);
        await this.mindarThree.stop();
      } catch {
        // ignore
      }
      try {
        this.mindarThree.renderer?.dispose();
      } catch {
        // ignore
      }
    }
    this.mindarThree = null;
    this.anchorGroup = null;
    this.landmarks.clear();
    if (this.container) {
      // MindAR injects video/canvas — clear leftover nodes
      this.container.replaceChildren();
    }
    this.status = 'stopped';
  }

  private handlePointer = (event: PointerEvent): void => {
    if (!this.mindarThree || !this.container || !this.onSelect) {
      return;
    }
    const rect = this.container.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    const { camera } = this.mindarThree;
    this.raycaster.setFromCamera(this.pointer, camera);
    const targets = [...this.landmarks.values()];
    const hits = this.raycaster.intersectObjects(targets, true);
    if (hits.length === 0) {
      return;
    }
    let obj: THREE.Object3D | null = hits[0].object;
    while (obj && !obj.userData['landmarkId']) {
      obj = obj.parent;
    }
    const id = obj?.userData['landmarkId'] as string | undefined;
    if (id) {
      this.zone.run(() => this.onSelect?.(id));
    }
  };
}
