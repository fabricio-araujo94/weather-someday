import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherData } from '../../core/interfaces/weather';

@Component({
  selector: 'app-current-weather',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './current-weather.html',
  styleUrls: ['./current-weather.scss']
})
export class CurrentWeatherComponent {
  weatherData = input<WeatherData | null>(null);
  Math = Math;

  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  }
}
