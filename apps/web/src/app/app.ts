import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { WeatherService } from './features/weather/weather.service';
import { WeatherForecast } from './features/weather/weather.models';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-shell',
  },
  template: `
    <main [attr.aria-busy]="isLoading() ? 'true' : 'false'">
      <h1>Weather forecasts</h1>

      <p id="help">
        Data is loaded from the backend via the <code>/api</code> proxy.
      </p>

      <div class="actions" role="group" aria-describedby="help">
        <button type="button" (click)="reload()" [disabled]="isLoading()">
          Reload
        </button>
      </div>

      <div aria-live="polite" aria-atomic="true">
        @if (isLoading()) {
          <p>Loading…</p>
        }
      </div>

      <div aria-live="assertive" aria-atomic="true">
        @if (errorMessage()) {
          <p class="error">
            {{ errorMessage() }}
          </p>
        }
      </div>

      @if (hasForecasts()) {
        <table class="table" aria-describedby="help">
          <caption class="sr-only">Forecast list</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Temp (°C)</th>
              <th scope="col">Summary</th>
            </tr>
          </thead>
          <tbody>
            @for (f of forecastsView(); track f.date) {
              <tr>
                <td>{{ f.date }}</td>
                <td>{{ f.temperatureC }}</td>
                <td>
                  @if (f.summary) {
                    {{ f.summary }}
                  } @else {
                    <span aria-label="No summary available">—</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      } @else {
        @if (!isLoading() && !errorMessage()) {
          <p>No forecasts loaded yet.</p>
        }
      }
    </main>
  `,
  styles: [`
    :host.app-shell {
      display: block;
      padding: 16px;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      line-height: 1.5;
    }

    .actions {
      margin: 12px 0 16px;
    }

    button {
      padding: 8px 12px;
      font: inherit;
    }

    button:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }

    .error {
      margin: 12px 0;
    }

    .table {
      border-collapse: collapse;
      width: 100%;
      max-width: 720px;
    }

    th, td {
      border: 1px solid currentColor;
      padding: 8px;
      text-align: left;
      vertical-align: top;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `],
})
export class App {
  readonly #weather = inject(WeatherService);
  readonly #destroyRef = inject(DestroyRef);

  readonly forecasts = signal<readonly WeatherForecast[] | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly hasForecasts = computed(() => (this.forecasts()?.length ?? 0) > 0);
  readonly forecastsView = computed(() => this.forecasts() ?? []);

  constructor() {
    this.reload();
  }

  reload(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.#weather.getForecasts()
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (data) => this.forecasts.set(data),
        error: (err: unknown) => {
          this.forecasts.set(null);
          this.errorMessage.set(this.#toMessage(err));
        },
      });
  }

  #toMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      return `Failed to load forecasts. HTTP ${err.status}${err.statusText ? ` (${err.statusText})` : ''}.`;
    }
    if (err instanceof Error) {
      return `Failed to load forecasts. ${err.message}`;
    }
    return 'Failed to load forecasts.';
  }
}
