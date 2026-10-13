import { Injectable, Renderer2, RendererFactory2, inject } from '@angular/core';
import { WeatherData } from '../interfaces/weather';

const THEME_CLASSES = [
  'theme-clear-day',
  'theme-clear-night',
  'theme-clouds-day',
  'theme-clouds-night',
  'theme-rain',
  'theme-thunderstorm',
  'theme-snow',
  'theme-mist'
];

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);

  updateTheme(data: WeatherData | null): void {
    const body = document.body;
    THEME_CLASSES.forEach(themeClass => this.renderer.removeClass(body, themeClass));

    if (!data?.weather?.length) {
      this.renderer.addClass(body, 'theme-clouds-day');
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
    } else if (
      mainCondition.includes('mist') ||
      mainCondition.includes('fog') ||
      mainCondition.includes('haze')
    ) {
      theme = 'theme-mist';
    } else if (mainCondition.includes('cloud')) {
      theme = isDay ? 'theme-clouds-day' : 'theme-clouds-night';
    }

    this.renderer.addClass(body, theme);
  }
}
