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

    const timezoneOffsetMs = (data.timezone ?? 0) * 1000;
    const sunriseUtcMs = data.sys.sunrise * 1000;
    const sunsetUtcMs = data.sys.sunset * 1000;
    const nowUtcMs = Date.now();

    const formatCityTime = (utcTimestampMs: number) => {
      const cityDate = new Date(utcTimestampMs + timezoneOffsetMs);
      const hours = cityDate.getUTCHours().toString().padStart(2, '0');
      const minutes = cityDate.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    const totalDaylight = sunsetUtcMs - sunriseUtcMs;
    const elapsed = nowUtcMs - sunriseUtcMs;
    let progress = totalDaylight > 0 ? Math.min(100, Math.max(0, (elapsed / totalDaylight) * 100)) : 0;

    const isDay = nowUtcMs >= sunriseUtcMs && nowUtcMs <= sunsetUtcMs;

    return {
      sunrise: formatCityTime(sunriseUtcMs),
      sunset: formatCityTime(sunsetUtcMs),
      progressPercent: Math.round(progress),
      isDay
    };
  });
}
