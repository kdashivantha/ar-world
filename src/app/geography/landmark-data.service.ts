import { Injectable } from '@angular/core';
import { parseLandmarkGeoJson, type LandmarkCollection } from './landmark.model';

@Injectable({ providedIn: 'root' })
export class LandmarkDataService {
  private cache: LandmarkCollection | null = null;

  async load(url = 'landmarks.geojson'): Promise<LandmarkCollection> {
    if (this.cache) {
      return this.cache;
    }
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to load landmarks: ${res.status}`);
    }
    const json = await res.json();
    this.cache = parseLandmarkGeoJson(json);
    return this.cache;
  }
}
