import { Injectable, inject, NgZone } from '@angular/core';
import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
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
  private labelRenderer: CSS2DRenderer | null = null;
  private anchorGroup: THREE.Group | null = null;
  private landmarks = new Map<string, THREE.Object3D>();
  private labelCleanups: Array<() => void> = [];
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private container: HTMLElement | null = null;
  private onSelect: ((id: string) => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;

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
          // Disable MindAR's default green scanning/loading overlays.
          uiLoading: 'no',
          uiScanning: 'no',
          uiError: 'no',
        });

        const { renderer, scene, camera } = this.mindarThree;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        // Keep WebGL canvas transparent so the MindAR camera video shows through.
        renderer.setClearColor(0x000000, 0);
        renderer.setClearAlpha(0);

        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
        const labelEl = this.labelRenderer.domElement;
        labelEl.className = 'ar-label-layer';
        labelEl.style.position = 'absolute';
        labelEl.style.inset = '0';
        labelEl.style.width = '100%';
        labelEl.style.height = '100%';
        labelEl.style.pointerEvents = 'none';
        labelEl.style.background = 'transparent';
        labelEl.style.zIndex = '3';
        container.appendChild(labelEl);

        this.resizeObserver = new ResizeObserver(() => {
          if (!this.labelRenderer || !this.container) {
            return;
          }
          this.labelRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });
        this.resizeObserver.observe(container);

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

        // Start camera immediately — live video is the only background.
        container.addEventListener('pointerdown', this.handlePointer);
        await this.mindarThree.start();
        this.hideMindArChrome(container);
        this.zone.run(() => {
          this.status = 'running';
        });

        renderer.setAnimationLoop(() => {
          renderer.setClearColor(0x000000, 0);
          renderer.render(scene, camera);
          this.labelRenderer?.render(scene, camera);
          // Keep MindAR scanning chrome suppressed if it reappears.
          this.hideMindArChrome(container);
        });

        // No map-texture plane: physical map + camera feed are the background.
        // 3D landmarks only — MindAR toggles anchor.group.visible on track/lost.
        for (const landmark of landmarks) {
          const wrapper = new THREE.Group();
          wrapper.name = `landmark-${landmark.id}`;
          wrapper.userData['landmarkId'] = landmark.id;

          const obj = await this.models.loadLandmark(landmark);
          // Models are Y-up; rotate so they stand out of the map (+Z toward camera).
          obj.rotation.x = Math.PI / 2;
          wrapper.add(obj);

          const label = this.createFloatingLabel(landmark);
          label.position.set(0, 0, landmark.maxHeight + 0.035);
          wrapper.add(label);

          const pos = this.projection.toThreePosition(landmark.longitude, landmark.latitude, map);
          wrapper.position.set(pos.x, pos.y, pos.z);
          group.add(wrapper);
          this.landmarks.set(landmark.id, wrapper);
        }
      });
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
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    for (const cleanup of this.labelCleanups) {
      cleanup();
    }
    this.labelCleanups = [];

    if (this.labelRenderer) {
      this.labelRenderer.domElement.remove();
      this.labelRenderer = null;
    }

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

  private hideMindArChrome(container: HTMLElement): void {
    // Hide MindAR default overlay nodes (scanning / loading / error).
    container.querySelectorAll('.mindar-ui-overlay, .mindar-ui-loading, .mindar-ui-scanning, .mindar-ui-error').forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });
    // MindAR also mounts an unused CSS3D layer; keep it non-interactive and invisible.
    if (this.mindarThree?.cssRenderer?.domElement) {
      const cssEl = this.mindarThree.cssRenderer.domElement as HTMLElement;
      cssEl.style.pointerEvents = 'none';
      cssEl.style.background = 'transparent';
    }
  }

  private createFloatingLabel(landmark: Landmark): CSS2DObject {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'ar-landmark-label';
    el.innerHTML = `<span class="ar-landmark-label__name">${landmark.name}</span><span class="ar-landmark-label__city">${landmark.city}</span>`;
    el.style.pointerEvents = 'auto';

    const onClick = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      this.zone.run(() => this.onSelect?.(landmark.id));
    };
    el.addEventListener('click', onClick);
    this.labelCleanups.push(() => el.removeEventListener('click', onClick));

    return new CSS2DObject(el);
  }

  private handlePointer = (event: PointerEvent): void => {
    if (!this.mindarThree || !this.container || !this.onSelect) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (target?.closest('.ar-landmark-label')) {
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
