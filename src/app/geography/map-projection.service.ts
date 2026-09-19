import { Injectable } from '@angular/core';
import type { MapConfig } from './landmark.model';

export interface MapXY {
  /** MindAR anchor X (map width ≈ 1, origin at center) */
  x: number;
  /** MindAR anchor Y (up on map plane before rotation) — we use Z in Three for map plane */
  y: number;
}

/**
 * Converts geographic coordinates into MindAR/Three map-plane positions.
 * MindAR image targets use width = 1 (X), height = 1/aspect (Y in image space).
 * We place models on the XZ plane with Y up.
 */
@Injectable({ providedIn: 'root' })
export class MapProjectionService {
  toMapXY(longitude: number, latitude: number, map: MapConfig): MapXY {
    if (map.projection === 'web-mercator') {
      return this.webMercatorToMapXY(longitude, latitude, map);
    }
    return this.equirectangularToMapXY(longitude, latitude, map);
  }

  /** Three.js position on the MindAR image plane (XY = map, Z toward camera). */
  toThreePosition(longitude: number, latitude: number, map: MapConfig): {
    x: number;
    y: number;
    z: number;
  } {
    const { x, y } = this.toMapXY(longitude, latitude, map);
    // MindAR target plane is XY; Y is up on the printed image (north).
    return { x, y, z: 0 };
  }

  private equirectangularToMapXY(lon: number, lat: number, map: MapConfig): MapXY {
    const u = (lon - map.lonMin) / (map.lonMax - map.lonMin);
    const v = (map.latMax - lat) / (map.latMax - map.latMin);
    const width = 1;
    const height = 1 / map.aspect;
    return {
      x: (u - 0.5) * width,
      y: (0.5 - v) * height,
    };
  }

  private webMercatorToMapXY(lon: number, lat: number, map: MapConfig): MapXY {
    const clampLat = Math.max(map.latMin, Math.min(map.latMax, lat));
    const xMerc = this.lonToMercX(lon);
    const yMerc = this.latToMercY(clampLat);
    const xMin = this.lonToMercX(map.lonMin);
    const xMax = this.lonToMercX(map.lonMax);
    const yMin = this.latToMercY(map.latMin);
    const yMax = this.latToMercY(map.latMax);
    const u = (xMerc - xMin) / (xMax - xMin);
    const v = (yMax - yMerc) / (yMax - yMin);
    const width = 1;
    const height = 1 / map.aspect;
    return {
      x: (u - 0.5) * width,
      y: (0.5 - v) * height,
    };
  }

  private lonToMercX(lon: number): number {
    return (lon * Math.PI) / 180;
  }

  private latToMercY(lat: number): number {
    const rad = (lat * Math.PI) / 180;
    return Math.log(Math.tan(Math.PI / 4 + rad / 2));
  }
}
