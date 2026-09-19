# Sketchfab models for ArWorld

Landmarks are listed in `../landmarks.geojson`. Until a GLB exists at `modelUrl`, the app uses a procedural placeholder.

## Your picks vs shippable (free) files

Many links you chose are **paid / not downloadable**. We still show them on the map (with credits), but for real GLBs use **Download** on a **CC** model.

| id | Your link | Free to download? | Suggested free CC alternative |
|----|-----------|-------------------|-------------------------------|
| eiffel | [shatlykxfree](https://sketchfab.com/3d-models/eiffel-tower-model-3d-with-best-quality-c3391c293e70471e9a112f7855adcf2f) | Yes (CC-BY, heavy) | same |
| liberty | [Gravity Jack](https://sketchfab.com/3d-models/statue-of-liberty-84094e8d5e724b5c882cf576ca12e44e) | Yes (CC-BY) | same |
| brandenburg | [Fovea](https://sketchfab.com/3d-models/brandenburg-gate-germany-1df210f3fec941768ceb50c375856c10) | Yes (CC-BY, heavy) | same |
| burj | [SDC PERFORMANCE](https://sketchfab.com/3d-models/free-burj-khalifa-dubai-c1d6f5884c9c4a56b8d8f9c5555f1902) | Yes (CC-BY, heavy) | same |
| pisa | Zhang (paid) | No | [Aglaiapoulida](https://sketchfab.com/3d-models/leaning-tower-of-pisa-f0456bc36bdc4bfd8890f0dfdaf86656) |
| bigben | Zhang (paid) | No | [noears6 Clock Tower](https://sketchfab.com/3d-models/clock-tower-big-ben-9a1c691fac774bcca4e2ba565c4c9d9b) |
| colosseum | Pikoandniki (paid) | No | [gabriele.l Colosseo](https://sketchfab.com/3d-models/colosseo-flavian-amphitheatre-drone-73c497e1f4954da0aaa54bf2918bc3c9) |
| parthenon | Théo Derory (paid) | No | [aumakua Parthenon](https://sketchfab.com/3d-models/parthenon-acropolis-athens-greece-d5cc54ccd57a4bdeb3c164a96c677b59) |
| basil | Caturegli (locked) | No | [augustgamer1808](https://sketchfab.com/3d-models/saint-basil-s-cathedral-a0b09745ecfe4cfea590eefcaac1e457) |
| tajmahal | uday (locked) | No | [NeyoZ](https://sketchfab.com/3d-models/taj-mahal-3d-model-1eb09052f6cd421caeaa6cb3204cb15d) |
| greatwall | Korneev (locked) | No | pick a smaller CC wall segment |
| pyramids | LibanCiel (paid) | No | [Civilization VI Giza](https://sketchfab.com/3d-models/giza-pyramid-complex-from-civilization-vi-329c613267934db88066eb0c868d49b1) |
| redeemer | SQUIR3D (paid) | No | [juang3d](https://sketchfab.com/3d-models/christ-the-redeemer-d143e5357efd42529777438d0f72c79c) |
| sydney | CyArk (locked) | No | [Nickardiamond](https://sketchfab.com/3d-models/sydney-opera-house-317b2d540f0a4f7e8d87dd3b0372712d) |

## Drop-in steps

1. Download **GLB** / **glTF** (login required on Sketchfab).
2. Save as `public/models/<id>.glb` matching `modelUrl` in geojson.
3. Prefer models under ~100k triangles for phones; compress if needed:
   `npx @gltf-transform/cli optimize in.glb out.glb --compress draco`
4. Push to deploy.

## Prefer quality that we can legally ship

For a polished demo without buying store models, download the **free** column first (Liberty, Burj, Brandenburg, Eiffel + free Pisa/Big Ben/Colosseum/etc.), then replace procedural placeholders.
