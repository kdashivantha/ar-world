# 3D models

## Shipped GLBs (real meshes)

From [smart-webcomponents-angular demo assets](https://github.com/HTMLElements/smart-webcomponents-angular/tree/51b58e6bdea720f345bad1db5a54481b51d153c5/demos/3d-chart/custom-models/src/assets):

| File | Landmark |
|------|----------|
| `eiffel.glb` | Eiffel Tower |
| `burj.glb` | Burj Khalifa |
| `empire.glb` | Empire State Building |
| `onewtc.glb` | One World Trade Center |
| `cntower.glb` | CN Tower |
| `shanghai.glb` | Shanghai Tower |

Other landmarks still use procedural placeholders until you add matching `models/<id>.glb` files.

## Drop-in

Replace or add `public/models/<id>.glb` to match `modelUrl` in `landmarks.geojson`, then push.
