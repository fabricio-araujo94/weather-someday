import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherData } from '../../core/interfaces/weather';
import { WeatherIconComponent } from '../weather-icon/weather-icon';

@Component({
  selector: 'app-current-weather',
  standalone: true,
  imports: [CommonModule, WeatherIconComponent],
  templateUrl: './current-weather.html',
  styleUrls: ['./current-weather.scss']
})
export class CurrentWeatherComponent {
  weatherData = input<WeatherData | null>(null);

  Math = Math;

  roundTemp(celsius: number): number {
    return Math.round(celsius);
  }

  windDirection = computed<string>(() => {
    const data = this.weatherData();
    if (!data || !data.wind) return 'N';
    const deg = data.wind.deg || 0;
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  });

  windSpeedKmH = computed<number>(() => {
    const data = this.weatherData();
    if (!data || !data.wind) return 0;
    return Math.round(data.wind.speed * 3.6);
  });

  humidityStatus = computed<string>(() => {
    const data = this.weatherData();
    if (!data || !data.main) return '';
    const h = data.main.humidity;
    if (h < 30) return 'Ar muito seco';
    if (h < 60) return 'Nível confortável';
    if (h < 80) return 'Umidade moderada';
    return 'Umidade elevada';
  });

  visibilityKm = computed<{ value: string; status: string }>(() => {
    const data = this.weatherData();
    if (!data || data.visibility === undefined) return { value: '--', status: '' };
    const km = (data.visibility / 1000).toFixed(1);
    const num = Number(km);
    let status = 'Excelente';
    if (num < 2) status = 'Muito Baixa';
    else if (num < 5) status = 'Moderada';
    else if (num < 10) status = 'Boa';
    return { value: `${km} km`, status };
  });

  pressureStatus = computed<string>(() => {
    const data = this.weatherData();
    if (!data || !data.main) return 'Normal';
    const p = data.main.pressure;
    if (p > 1020) return 'Alta pressão';
    if (p < 1005) return 'Baixa pressão';
    return 'Pressão normal';
  });

  sunTimes = computed<{ sunrise: string; sunset: string; progressPercent: number; isDay: boolean }>(() => {
    const data = this.weatherData();
    if (!data || !data.sys || !data.sys.sunrise || !data.sys.sunset) {
      return { sunrise: '--:--', sunset: '--:--', progressPercent: 50, isDay: true };
    }

    const sunriseDate = new Date(data.sys.sunrise * 1000);
    const sunsetDate = new Date(data.sys.sunset * 1000);
    const now = new Date();

    const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const totalDaylight = sunsetDate.getTime() - sunriseDate.getTime();
    const elapsed = now.getTime() - sunriseDate.getTime();
    let progress = Math.min(100, Math.max(0, (elapsed / totalDaylight) * 100));

    const isDay = now.getTime() >= sunriseDate.getTime() && now.getTime() <= sunsetDate.getTime();

    return {
      sunrise: formatTime(sunriseDate),
      sunset: formatTime(sunsetDate),
      progressPercent: Math.round(progress),
      isDay
    };
  });
}
