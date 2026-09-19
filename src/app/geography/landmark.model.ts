export interface LandmarkAttribution {
  sketchfabUrl: string;
  author: string;
  license: string;
  licenseUrl: string;
}

export interface Landmark {
  id: string;
  name: string;
  city: string;
  description: string;
  latitude: number;
  longitude: number;
  modelUrl: string;
  maxHeight: number;
  attribution: LandmarkAttribution;
}

export interface MapConfig {
  image: string;
  mindTarget: string;
  projection: 'equirectangular' | 'web-mercator';
  lonMin: number;
  lonMax: number;
  latMin: number;
  latMax: number;
  /** Image width / height */
  aspect: number;
}

export interface LandmarkCollection {
  map: MapConfig;
  landmarks: Landmark[];
}

interface GeoJsonFeature {
  type: string;
  properties: {
    id: string;
    name: string;
    city: string;
    description: string;
    modelUrl: string;
    maxHeight?: number;
    sketchfabUrl: string;
    author: string;
    license: string;
    licenseUrl: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

interface GeoJsonCollection {
  map: MapConfig;
  features: GeoJsonFeature[];
}

export function parseLandmarkGeoJson(data: GeoJsonCollection): LandmarkCollection {
  return {
    map: data.map,
    landmarks: data.features.map((f) => ({
      id: f.properties.id,
      name: f.properties.name,
      city: f.properties.city,
      description: f.properties.description,
      longitude: f.geometry.coordinates[0],
      latitude: f.geometry.coordinates[1],
      modelUrl: f.properties.modelUrl,
      maxHeight: f.properties.maxHeight ?? 0.1,
      attribution: {
        sketchfabUrl: f.properties.sketchfabUrl,
        author: f.properties.author,
        license: f.properties.license,
        licenseUrl: f.properties.licenseUrl,
      },
    })),
  };
}
