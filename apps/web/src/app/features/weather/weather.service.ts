import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WeatherForecast } from './weather.models';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient)

  getForecasts() {
    return this.http.get<WeatherForecast[]>('/api/weatherforecast');
  }
}
