import { Component, computed, input, ChangeDetectionStrategy, signal, inject, NgZone, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherData } from '../../core/interfaces/weather';
import { WeatherIconComponent } from '../weather-icon/weather-icon';

@Component({
  selector: 'app-current-weather',
  standalone: true,
  imports: [CommonModule, WeatherIconComponent],
  templateUrl: './current-weather.html',
  styleUrls: ['./current-weather.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrentWeatherComponent implements OnInit, OnDestroy {
  private ngZone = inject(NgZone);
  private timerId?: ReturnType<typeof setInterval>;

  weatherData = input<WeatherData | null>(null);
  currentTimeMs = signal<number>(Date.now());

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.timerId = setInterval(() => {
        this.currentTimeMs.set(Date.now());
      }, 1000);
    });
  }

  ngOnDestroy(): void {
    if (this.timerId !== undefined) {
      clearInterval(this.timerId);
    }
  }

  roundTemp(celsius: number): number {
    return Math.round(celsius);
  }

  windDirection = computed<string>(() => {
    const data = this.weatherData();
    if (!data || !data.wind) return 'N';
    const deg = data.wind.deg || 0;
    const directions = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
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
    const nowUtcMs = this.currentTimeMs();

    const formatCityTime = (utcTimestampMs: number) => {
      const cityDate = new Date(utcTimestampMs + timezoneOffsetMs);
      const hours = cityDate.getUTCHours().toString().padStart(2, '0');
      const minutes = cityDate.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    const isDay = nowUtcMs >= sunriseUtcMs && nowUtcMs <= sunsetUtcMs;
    let progress = 50;

    const DAY_MS = 24 * 60 * 60 * 1000;

    if (isDay) {
      const totalDaylight = sunsetUtcMs - sunriseUtcMs;
      const elapsed = nowUtcMs - sunriseUtcMs;
      progress = totalDaylight > 0 ? (elapsed / totalDaylight) * 100 : 0;
    } else {
      // Night-time calculation
      // Case 1: Before today's sunrise (nowUtcMs < sunriseUtcMs) -> night started yesterday evening
      // Yesterday's sunset is approximately sunsetUtcMs - DAY_MS
      // Case 2: After today's sunset (nowUtcMs > sunsetUtcMs) -> night ends tomorrow morning
      // Tomorrow's sunrise is approximately sunriseUtcMs + DAY_MS
      let nightStartMs: number;
      let nightEndMs: number;

      if (nowUtcMs < sunriseUtcMs) {
        nightStartMs = sunsetUtcMs - DAY_MS;
        nightEndMs = sunriseUtcMs;
      } else {
        nightStartMs = sunsetUtcMs;
        nightEndMs = sunriseUtcMs + DAY_MS;
      }

      const totalNight = nightEndMs - nightStartMs;
      const elapsedNight = nowUtcMs - nightStartMs;
      progress = totalNight > 0 ? (elapsedNight / totalNight) * 100 : 50;
    }

    progress = Math.min(100, Math.max(0, progress));

    return {
      sunrise: formatCityTime(sunriseUtcMs),
      sunset: formatCityTime(sunsetUtcMs),
      progressPercent: Math.round(progress),
      isDay
    };
  });
}
