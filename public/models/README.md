# Sketchfab models

Download **glTF** (or GLB) from Sketchfab, then place the binary at the path in `landmarks.geojson` → `modelUrl`.

## Current landmarks

| id | File | Sketchfab | Notes |
|----|------|-----------|-------|
| eiffel | `public/models/eiffel.glb` | [shatlykxfree](https://sketchfab.com/3d-models/eiffel-tower-model-3d-with-best-quality-c3391c293e70471e9a112f7855adcf2f) | CC-BY · free · ~544k tris (heavy) |
| pisa | `public/models/pisa.glb` | [Zhang Shangbin](https://sketchfab.com/3d-models/the-leaning-tower-of-pisa-b627f6861e5d4cabb616a848e9552f55) | **Paid store model** — cannot ship without purchase. Use a free CC alternative (below) or buy then drop GLB. |
| liberty | `public/models/liberty.glb` | [Gravity Jack](https://sketchfab.com/3d-models/statue-of-liberty-84094e8d5e724b5c882cf576ca12e44e) | CC-BY · free · ~57k tris (good for mobile) |

### Free Pisa alternatives (CC-BY, downloadable)

- [Aglaiapoulida — Leaning tower of Pisa](https://sketchfab.com/3d-models/leaning-tower-of-pisa-f0456bc36bdc4bfd8890f0dfdaf86656) (~54k tris)
- [LinkinPipe — Torre_Pisa](https://sketchfab.com/3d-models/torre-pisa-1ff02ed0588e4e4f9dcf621a8af07336) (~71k tris)

## Steps

1. On Sketchfab → **Download 3D Model** → prefer **glTF** / **GLB**.
2. If you get a zip (`scene.gltf` + `textures/`), convert to a single GLB (Blender export, or [gltf.report](https://gltf.report/)).
3. Replace `public/models/<id>.glb`.
4. Update `author` / `license` / `sketchfabUrl` in `public/landmarks.geojson` if needed.
5. Redeploy (`git push`).

Until a Sketchfab file is present, the app falls back to the procedural mesh.
