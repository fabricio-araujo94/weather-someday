import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header';
import { CurrentWeatherComponent } from './components/current-weather/current-weather';
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
    HourlyChartComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  private weatherService = inject(WeatherService);

  weatherData: WeatherData | null = null;
  forecastData: ForecastData | null = null;
  errorMessage: string | null = null;
  isLoading = false;

  ngOnInit(): void {
    this.loadWeatherByGeolocation();
  }

  loadWeatherByGeolocation(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.weatherService.getCurrentPosition().subscribe({
      next: (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        this.fetchWeatherDataByCoords(lat, lon);
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
        // Fallback para uma cidade padrão caso a geolocalização falhe (ex: São Paulo)
        this.loadWeatherByCity('São Paulo');
      }
    });
  }

  fetchWeatherDataByCoords(lat: number, lon: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.weatherService.getCurrentWeatherByCoords(lat, lon).subscribe({
      next: (data) => {
        this.weatherData = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });

    this.weatherService.getForecastByCoords(lat, lon).subscribe({
      next: (data) => {
        this.forecastData = data;
      },
      error: (err) => {
        console.error('Erro ao buscar previsão:', err);
      }
    });
  }

  loadWeatherByCity(cityName: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.weatherService.getCurrentWeatherByCity(cityName).subscribe({
      next: (data) => {
        this.weatherData = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });

    this.weatherService.getForecastByCity(cityName).subscribe({
      next: (data) => {
        this.forecastData = data;
      },
      error: (err) => {
        console.error('Erro ao buscar previsão por cidade:', err);
      }
    });
  }

  onSearchCity(cityName: string): void {
    this.loadWeatherByCity(cityName);
  }

  onGeoClick(): void {
    this.loadWeatherByGeolocation();
  }
}
