import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LandmarkDataService } from '../geography/landmark-data.service';
import type { Landmark } from '../geography/landmark.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="home">
      <section class="hero">
        <p class="brand">ArWorld</p>
        <h1>Point your camera at a printed world map</h1>
        <p class="lead">
          Landmarks appear in 3D where they belong — Paris, Pisa, New York — tracked on your physical map.
        </p>
        <div class="cta">
          <a routerLink="/ar" class="btn primary">Open AR</a>
          <a href="ar/world-map.png" target="_blank" rel="noopener" class="btn ghost">Print map image</a>
        </div>
      </section>

      <section class="how">
        <h2>How to try it</h2>
        <ol>
          <li>Print <code>world-map.png</code> (A3/A4, exact crop, matte paper if possible).</li>
          <li>Deploy or open this app over <strong>HTTPS</strong> on your phone.</li>
          <li>Open AR, allow camera, point at the map, tap Start.</li>
          <li>Tap a landmark for details and Sketchfab credits.</li>
        </ol>
      </section>

      <section class="credits">
        <h2>Landmarks & credits</h2>
        <ul>
          @for (lm of landmarks(); track lm.id) {
            <li>
              <strong>{{ lm.name }}</strong> — {{ lm.city }}
              ·
              <a [href]="lm.attribution.sketchfabUrl" target="_blank" rel="noopener noreferrer">Sketchfab</a>
            </li>
          }
        </ul>
        <p class="note">
          Demo ships procedural GLB samples. Swap files in <code>public/models/</code> with downloadable
          <a href="https://sketchfab.com/" target="_blank" rel="noopener noreferrer">Sketchfab</a> models and update
          attribution in <code>landmarks.geojson</code>.
        </p>
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100dvh;
    }
    .home {
      min-height: 100dvh;
      color: #e8eef7;
      background:
        radial-gradient(ellipse 80% 50% at 50% -10%, rgba(56, 189, 248, 0.22), transparent),
        linear-gradient(160deg, #0b1220 0%, #132033 45%, #0f172a 100%);
      padding: 2rem 1.25rem 3rem;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    .hero {
      max-width: 40rem;
      margin: 0 auto 2.5rem;
    }
    .brand {
      margin: 0 0 0.75rem;
      font-size: clamp(2rem, 8vw, 3.25rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      background: linear-gradient(90deg, #7dd3fc, #a5f3fc);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    h1 {
      margin: 0 0 0.75rem;
      font-size: clamp(1.25rem, 4vw, 1.75rem);
      font-weight: 600;
      line-height: 1.25;
    }
    .lead {
      margin: 0 0 1.5rem;
      color: #9db0c9;
      line-height: 1.5;
      max-width: 36rem;
    }
    .cta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      padding: 0.7rem 1.15rem;
      border-radius: 0.65rem;
      text-decoration: none;
      font-weight: 650;
    }
    .primary {
      background: #38bdf8;
      color: #082f49;
    }
    .ghost {
      background: transparent;
      color: #cae8ff;
      border: 1px solid rgba(125, 211, 252, 0.35);
    }
    .how,
    .credits {
      max-width: 40rem;
      margin: 0 auto 2rem;
    }
    h2 {
      margin: 0 0 0.75rem;
      font-size: 1.1rem;
    }
    ol,
    ul {
      margin: 0;
      padding-left: 1.2rem;
      color: #c5d4e8;
      line-height: 1.55;
    }
    li {
      margin-bottom: 0.4rem;
    }
    a {
      color: #7dd3fc;
    }
    .note {
      margin: 1rem 0 0;
      color: #8fa3bc;
      font-size: 0.9rem;
      line-height: 1.45;
    }
    code {
      font-size: 0.85em;
      color: #bae6fd;
    }
  `,
})
export class HomeComponent implements OnInit {
  private readonly data = inject(LandmarkDataService);
  readonly landmarks = signal<Landmark[]>([]);

  async ngOnInit(): Promise<void> {
    try {
      const col = await this.data.load();
      this.landmarks.set(col.landmarks);
    } catch {
      this.landmarks.set([]);
    }
  }
}
