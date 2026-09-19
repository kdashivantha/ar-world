declare module 'mind-ar/dist/mindar-image-three.prod.js' {
  export class MindARThree {
    constructor(options: {
      container: HTMLElement;
      imageTargetSrc: string;
      filterMinCF?: number;
      filterBeta?: number;
      uiLoading?: string;
      uiScanning?: string;
      uiError?: string;
    });
    renderer: import('three').WebGLRenderer;
    scene: import('three').Scene;
    camera: import('three').Camera;
    addAnchor(index: number): { group: import('three').Group; onTargetFound?: () => void; onTargetLost?: () => void };
    start(): Promise<void>;
    stop(): Promise<void>;
  }
}
