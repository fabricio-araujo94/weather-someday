import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-weather-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-icon.html',
  styleUrls: ['./weather-icon.scss']
})
export class WeatherIconComponent {
  icon = input<string>('01d');
  condition = input<string>('');
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  get iconCategory(): string {
    const code = (this.icon() || '').toLowerCase();
    const cond = (this.condition() || '').toLowerCase();

    if (code.startsWith('01')) return code.endsWith('d') ? 'sun' : 'moon';
    if (code.startsWith('02')) return code.endsWith('d') ? 'few-clouds-day' : 'few-clouds-night';
    if (code.startsWith('03') || code.startsWith('04')) return 'scattered-clouds';
    if (code.startsWith('09') || code.startsWith('10')) return 'rain';
    if (code.startsWith('11')) return 'thunderstorm';
    if (code.startsWith('13')) return 'snow';
    if (code.startsWith('50')) return 'mist';

    if (cond.includes('chuva') || cond.includes('rain')) return 'rain';
    if (cond.includes('trov') || cond.includes('thunder')) return 'thunderstorm';
    if (cond.includes('neve') || cond.includes('snow')) return 'snow';
    if (cond.includes('nublado') || cond.includes('cloud')) return 'scattered-clouds';
    if (cond.includes('névoa') || cond.includes('nevoeiro') || cond.includes('mist') || cond.includes('fog')) return 'mist';

    return 'sun';
  }

  get fallbackUrl(): string {
    const code = this.icon() || '01d';
    return `https://openweathermap.org/img/wn/${code}@4x.png`;
  }
}
