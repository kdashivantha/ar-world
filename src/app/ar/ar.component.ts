import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  signal,
  computed,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LandmarkDataService } from '../geography/landmark-data.service';
import type { Landmark, LandmarkCollection } from '../geography/landmark.model';
import { ArSessionService } from '../three/ar-session.service';
import { LocationInfoComponent } from '../location-info/location-info.component';

@Component({
  selector: 'app-ar',
  standalone: true,
  imports: [RouterLink, LocationInfoComponent],
  templateUrl: './ar.component.html',
  styleUrl: './ar.component.css',
})
export class ArComponent implements OnDestroy {
  @ViewChild('arContainer', { static: true }) arContainer!: ElementRef<HTMLDivElement>;

  private readonly data = inject(LandmarkDataService);
  private readonly session = inject(ArSessionService);

  readonly collection = signal<LandmarkCollection | null>(null);
  readonly selected = signal<Landmark | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly usingFallbackTarget = signal(false);

  readonly status = computed(() => this.session.status);
  readonly errorMessage = computed(() => this.session.errorMessage);
  readonly isRunning = computed(() => this.session.status === 'running');

  constructor() {
    void this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    try {
      const col = await this.data.load();
      this.collection.set(col);
    } catch (err) {
      this.loadError.set(err instanceof Error ? err.message : String(err));
    } finally {
      this.loading.set(false);
    }
  }

  async start(): Promise<void> {
    const col = this.collection();
    if (!col) {
      return;
    }

    let mindTarget = col.map.mindTarget;
    // Prefer compiled world-map.mind; fall back to MindAR sample card for smoke tests.
    const worldMindOk = await this.assetExists(mindTarget);
    if (!worldMindOk) {
      mindTarget = 'ar/card.mind';
      this.usingFallbackTarget.set(true);
    } else {
      this.usingFallbackTarget.set(false);
    }

    await this.session.start(
      this.arContainer.nativeElement,
      mindTarget,
      col.map,
      col.landmarks,
      (id) => {
        const lm = col.landmarks.find((l) => l.id === id) ?? null;
        this.selected.set(lm);
      }
    );
  }

  async stop(): Promise<void> {
    this.selected.set(null);
    await this.session.stop();
  }

  clearSelection(): void {
    this.selected.set(null);
  }

  async ngOnDestroy(): Promise<void> {
    await this.session.stop();
  }

  private async assetExists(path: string): Promise<boolean> {
    try {
      const res = await fetch(path, { method: 'HEAD' });
      if (res.ok) {
        return true;
      }
      // Some hosts don't allow HEAD
      const get = await fetch(path, { method: 'GET' });
      return get.ok;
    } catch {
      return false;
    }
  }
}
