import { TestBed } from '@angular/core/testing';
import { WeatherData } from '../interfaces/weather';
import { ThemeService } from './theme';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ThemeService] });
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    document.body.className = '';
  });

  it('should replace previous theme classes based on weather conditions', () => {
    const clearWeather: WeatherData = {
      coord: { lon: 0, lat: 0 },
      weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
      base: 'stations',
      main: {
        temp: 20,
        feels_like: 20,
        temp_min: 19,
        temp_max: 21,
        pressure: 1013,
        humidity: 50
      },
      visibility: 10000,
      wind: { speed: 1, deg: 0 },
      clouds: { all: 0 },
      dt: 0,
      sys: { country: 'BR', sunrise: 0, sunset: 0 },
      timezone: 0,
      id: 1,
      name: 'Test',
      cod: 200
    };

    service.updateTheme(clearWeather);
    expect(document.body.classList.contains('theme-clear-day')).toBe(true);

    service.updateTheme({
      ...clearWeather,
      weather: [{ id: 500, main: 'Rain', description: 'rain', icon: '10n' }]
    });

    expect(document.body.classList.contains('theme-clear-day')).toBe(false);
    expect(document.body.classList.contains('theme-rain')).toBe(true);
  });

  it('should apply the default daytime theme when weather data is missing', () => {
    service.updateTheme(null);

    expect(document.body.classList.contains('theme-clouds-day')).toBe(true);
  });
});
