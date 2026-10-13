import { Component, OnInit, inject, signal, effect, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, Subscription } from 'rxjs';
import { HeaderComponent } from './components/header/header';
import { CurrentWeatherComponent } from './components/current-weather/current-weather';
import { ForecastDaysComponent } from './components/forecast-days/forecast-days';
import { HourlyChartComponent } from './components/hourly-chart/hourly-chart';
import { WeatherService } from './core/services/weather';
import { ThemeService } from './core/services/theme';
import { WeatherData } from './core/interfaces/weather';
import { ForecastData } from './core/interfaces/forecast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    CurrentWeatherComponent,
    ForecastDaysComponent,
    HourlyChartComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  private weatherService = inject(WeatherService);
  private themeService = inject(ThemeService);
  private destroyRef = inject(DestroyRef);
  private activeRequestSub?: Subscription;

  weatherData = signal<WeatherData | null>(null);
  forecastData = signal<ForecastData | null>(null);
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  lastSearchedCity = signal<string>('São Paulo');

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.activeRequestSub?.unsubscribe();
    });

    // Dynamic theme updater
    effect(() => {
      const data = this.weatherData();
      this.themeService.updateTheme(data);
    });
  }

  ngOnInit(): void {
    this.loadWeatherByGeolocation();
  }

  loadWeatherByGeolocation(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.activeRequestSub?.unsubscribe();
    this.activeRequestSub = this.weatherService.getCurrentPosition().subscribe({
      next: (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        this.fetchWeatherDataByCoords(lat, lon);
      },
      error: () => {
        // Fallback gracefully to default city (São Paulo)
        this.loadWeatherByCity('São Paulo');
      }
    });
  }

  fetchWeatherDataByCoords(lat: number, lon: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.activeRequestSub?.unsubscribe();
    this.activeRequestSub = forkJoin({
      weather: this.weatherService.getCurrentWeatherByCoords(lat, lon),
      forecast: this.weatherService.getForecastByCoords(lat, lon)
    }).subscribe({
      next: ({ weather, forecast }) => {
        this.weatherData.set(weather);
        this.forecastData.set(forecast);
        this.lastSearchedCity.set(weather.name);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Erro ao carregar dados meteorológicos.');
        this.isLoading.set(false);
      }
    });
  }

  loadWeatherByCity(cityName: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.lastSearchedCity.set(cityName);

    this.activeRequestSub?.unsubscribe();
    this.activeRequestSub = forkJoin({
      weather: this.weatherService.getCurrentWeatherByCity(cityName),
      forecast: this.weatherService.getForecastByCity(cityName)
    }).subscribe({
      next: ({ weather, forecast }) => {
        this.weatherData.set(weather);
        this.forecastData.set(forecast);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Erro ao carregar dados da cidade informada.');
        this.isLoading.set(false);
      }
    });
  }

  onSearchCity(cityName: string): void {
    this.loadWeatherByCity(cityName);
  }

  onGeoClick(): void {
    this.loadWeatherByGeolocation();
  }

  retry(): void {
    this.loadWeatherByCity(this.lastSearchedCity() || 'São Paulo');
  }

}
