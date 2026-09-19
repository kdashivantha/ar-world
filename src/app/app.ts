import { Component, OnInit, inject, isDevMode } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: `
    :host {
      display: block;
      min-height: 100%;
    }
  `,
})
export class App implements OnInit {
  private readonly updates = inject(SwUpdate, { optional: true });

  ngOnInit(): void {
    if (isDevMode() || !this.updates?.isEnabled) {
      return;
    }
    this.updates.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => {
        void this.updates!.activateUpdate().then(() => document.location.reload());
      });
    void this.updates.checkForUpdate();
  }
}
