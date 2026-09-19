import { Component, input, output } from '@angular/core';
import type { Landmark } from '../geography/landmark.model';

@Component({
  selector: 'app-location-info',
  standalone: true,
  template: `
    @if (landmark(); as lm) {
      <aside class="sheet" role="dialog" aria-label="Landmark details">
        <header>
          <h2>{{ lm.name }}</h2>
          <button type="button" class="close" (click)="closed.emit()" aria-label="Close">×</button>
        </header>
        <p class="city">{{ lm.city }}</p>
        <p class="desc">{{ lm.description }}</p>
        <p class="credit">
          Model:
          <a [href]="lm.attribution.sketchfabUrl" target="_blank" rel="noopener noreferrer">Sketchfab</a>
          · {{ lm.attribution.author }} ·
          <a [href]="lm.attribution.licenseUrl" target="_blank" rel="noopener noreferrer">{{
            lm.attribution.license
          }}</a>
        </p>
      </aside>
    }
  `,
  styles: `
    .sheet {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 20;
      padding: 1rem 1.25rem 1.5rem;
      background: rgba(12, 18, 28, 0.94);
      color: #f4f7fb;
      border-radius: 1rem 1rem 0 0;
      box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.35);
      max-width: 32rem;
      margin: 0 auto;
    }
    header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 0.75rem;
    }
    h2 {
      margin: 0;
      font-size: 1.25rem;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    .close {
      border: 0;
      background: transparent;
      color: #f4f7fb;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
    }
    .city {
      margin: 0.35rem 0 0.75rem;
      color: #9db0c9;
      font-size: 0.95rem;
    }
    .desc {
      margin: 0 0 0.75rem;
      line-height: 1.45;
      font-size: 0.95rem;
    }
    .credit {
      margin: 0;
      font-size: 0.75rem;
      color: #8fa3bc;
    }
    a {
      color: #7dd3fc;
    }
  `,
})
export class LocationInfoComponent {
  readonly landmark = input<Landmark | null>(null);
  readonly closed = output<void>();
}
