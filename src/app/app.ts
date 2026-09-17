import { Component, OnInit, inject, signal, effect, Renderer2, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, Subscription } from 'rxjs';
import { HeaderComponent } from './components/header/header';
import { CurrentWeatherComponent } from './components/current-weather/current-weather';
import { ForecastDaysComponent } from './components/forecast-days/forecast-days';
import { HourlyChartComponent } from './components/hourly-chart/hourly-chart';
import { WeatherService } from './core/services/weather';
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
  private renderer = inject(Renderer2);
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
      this.updateDynamicTheme(data);
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

  private updateDynamicTheme(data: WeatherData | null): void {
    // Remove all previous theme classes
    const themeClasses = [
      'theme-clear-day',
      'theme-clear-night',
      'theme-clouds-day',
      'theme-clouds-night',
      'theme-rain',
      'theme-thunderstorm',
      'theme-snow',
      'theme-mist'
    ];
    themeClasses.forEach(cls => this.renderer.removeClass(document.body, cls));

    if (!data || !data.weather || data.weather.length === 0) {
      this.renderer.addClass(document.body, 'theme-clouds-day');
      return;
    }

    const iconCode = data.weather[0].icon || '01d';
    const mainCondition = (data.weather[0].main || '').toLowerCase();
    const isDay = iconCode.endsWith('d');

    let theme = isDay ? 'theme-clear-day' : 'theme-clear-night';

    if (mainCondition.includes('rain') || mainCondition.includes('drizzle')) {
      theme = 'theme-rain';
    } else if (mainCondition.includes('thunder')) {
      theme = 'theme-thunderstorm';
    } else if (mainCondition.includes('snow')) {
      theme = 'theme-snow';
    } else if (mainCondition.includes('mist') || mainCondition.includes('fog') || mainCondition.includes('haze')) {
      theme = 'theme-mist';
    } else if (mainCondition.includes('cloud')) {
      theme = isDay ? 'theme-clouds-day' : 'theme-clouds-night';
    }

    this.renderer.addClass(document.body, theme);
  }
}
