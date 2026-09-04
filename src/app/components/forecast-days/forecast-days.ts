import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForecastData, ForecastItem } from '../../core/interfaces/forecast';
import { WeatherIconComponent } from '../weather-icon/weather-icon';

export interface DailyForecast {
  date: Date;
  dayLabel: string;
  formattedDate: string;
  condition: string;
  icon: string;
  minTemp: number;
  maxTemp: number;
  pop: number; // Probability of precipitation (0-100%)
  humidity: number;
  windSpeed: number;
  barOffsetPercent: number;
  barWidthPercent: number;
}

@Component({
  selector: 'app-forecast-days',
  standalone: true,
  imports: [CommonModule, WeatherIconComponent],
  templateUrl: './forecast-days.html',
  styleUrls: ['./forecast-days.scss']
})
export class ForecastDaysComponent {
  forecastData = input<ForecastData | null>(null);

  dailyForecasts = computed<DailyForecast[]>(() => {
    const data = this.forecastData();
    if (!data || !data.list || data.list.length === 0) return [];

    // Group items by local date YYYY-MM-DD
    const grouped = new Map<string, ForecastItem[]>();
    for (const item of data.list) {
      const d = new Date(item.dt * 1000);
      const dateKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(item);
    }

    const todayStr = (() => {
      const now = new Date();
      return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    })();

    const tomorrowStr = (() => {
      const tom = new Date();
      tom.setDate(tom.getDate() + 1);
      return `${tom.getFullYear()}-${(tom.getMonth() + 1).toString().padStart(2, '0')}-${tom.getDate().toString().padStart(2, '0')}`;
    })();

    const days: {
      date: Date;
      dayLabel: string;
      formattedDate: string;
      condition: string;
      icon: string;
      minTemp: number;
      maxTemp: number;
      pop: number;
      humidity: number;
      windSpeed: number;
    }[] = [];

    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    for (const [key, items] of grouped.entries()) {
      const firstDate = new Date(items[0].dt * 1000);
      let dayLabel = weekDays[firstDate.getDay()];
      if (key === todayStr) dayLabel = 'Hoje';
      else if (key === tomorrowStr) dayLabel = 'Amanhã';

      const formattedDate = `${firstDate.getDate().toString().padStart(2, '0')} ${months[firstDate.getMonth()]}`;

      let min = Number.POSITIVE_INFINITY;
      let max = Number.NEGATIVE_INFINITY;
      let maxPop = 0;
      let sumHumidity = 0;
      let maxWind = 0;

      // Select midday item if available, or center item
      const midIndex = Math.floor(items.length / 2);
      const representativeItem = items[midIndex] || items[0];

      for (const it of items) {
        if (it.main.temp_min < min) min = it.main.temp_min;
        if (it.main.temp_max > max) max = it.main.temp_max;
        if (it.main.temp < min) min = it.main.temp;
        if (it.main.temp > max) max = it.main.temp;
        if (it.pop && it.pop > maxPop) maxPop = it.pop;
        sumHumidity += it.main.humidity;
        if (it.wind && it.wind.speed > maxWind) maxWind = it.wind.speed;
      }

      days.push({
        date: firstDate,
        dayLabel,
        formattedDate,
        condition: representativeItem.weather[0]?.description || '',
        icon: representativeItem.weather[0]?.icon || '01d',
        minTemp: Math.round(min),
        maxTemp: Math.round(max),
        pop: Math.round(maxPop * 100),
        humidity: Math.round(sumHumidity / items.length),
        windSpeed: Math.round(maxWind * 3.6) // km/h
      });
    }

    // Limit to up to 5 days
    const sliced = days.slice(0, 5);

    if (sliced.length === 0) return [];

    let overallMin = Math.min(...sliced.map(d => d.minTemp));
    let overallMax = Math.max(...sliced.map(d => d.maxTemp));
    if (overallMax === overallMin) overallMax += 1;

    return sliced.map(d => {
      const barOffsetPercent = Math.max(0, Math.min(100, ((d.minTemp - overallMin) / (overallMax - overallMin)) * 100));
      const rawWidth = ((d.maxTemp - d.minTemp) / (overallMax - overallMin)) * 100;
      const barWidthPercent = Math.max(12, Math.min(100 - barOffsetPercent, rawWidth));

      return {
        ...d,
        barOffsetPercent,
        barWidthPercent
      };
    });
  });

  roundTemp(celsius: number): number {
    return Math.round(celsius);
  }
}
