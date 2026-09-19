# Sketchfab models

Download **glTF** (or GLB) from Sketchfab, then place the binary at the path in `landmarks.geojson` → `modelUrl`.

## Current landmarks

| id | File | Sketchfab |
|----|------|-----------|
| eiffel | `public/models/eiffel.glb` | [Eiffel Tower — shatlykxfree](https://sketchfab.com/3d-models/eiffel-tower-model-3d-with-best-quality-c3391c293e70471e9a112f7855adcf2f) (CC-BY) |
| pisa | `public/models/pisa.glb` | *(send link)* |
| liberty | `public/models/liberty.glb` | *(send link)* |

## Steps

1. On Sketchfab → **Download 3D Model** → prefer **glTF** / **GLB**.
2. If you get a zip (`scene.gltf` + `textures/`), convert to a single GLB (Blender export, or [gltf.report](https://gltf.report/)).
3. Replace `public/models/<id>.glb`.
4. Update `author` / `license` / `sketchfabUrl` in `public/landmarks.geojson` if needed.
5. Redeploy (`git push`).

## Mobile tip

The Eiffel model above is ~544k triangles — heavy for phones. Prefer a low-poly download, or simplify with:

```bash
npx @gltf-transform/cli optimize public/models/eiffel.glb public/models/eiffel.glb --compress draco
```

Until a Sketchfab file is present, the app falls back to the procedural tower.
