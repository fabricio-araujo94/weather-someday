import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { App } from './app';
import { WeatherService } from './core/services/weather';
import { WeatherData } from './core/interfaces/weather';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let weatherServiceMock: any;

  const mockWeatherData: WeatherData = {
    coord: { lon: -46.6333, lat: -23.5505 },
    weather: [{ id: 800, main: 'Clear', description: 'céu limpo', icon: '01d' }],
    base: 'stations',
    main: {
      temp: 24,
      feels_like: 25,
      temp_min: 20,
      temp_max: 27,
      pressure: 1015,
      humidity: 55
    },
    visibility: 10000,
    wind: { speed: 4.1, deg: 120 },
    clouds: { all: 10 },
    dt: 1600000000,
    sys: { country: 'BR', sunrise: 1600000000, sunset: 1600040000 },
    timezone: -10800,
    id: 3448439,
    name: 'São Paulo',
    cod: 200
  };

  beforeEach(async () => {
    weatherServiceMock = {
      getCurrentPosition: vi.fn().mockReturnValue(of({
        coords: { latitude: -23.5505, longitude: -46.6333 }
      })),
      getCurrentWeatherByCoords: vi.fn().mockReturnValue(of(mockWeatherData)),
      getForecastByCoords: vi.fn().mockReturnValue(of({ list: [] })),
      getCurrentWeatherByCity: vi.fn().mockReturnValue(of(mockWeatherData)),
      getForecastByCity: vi.fn().mockReturnValue(of({ list: [] }))
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: WeatherService, useValue: weatherServiceMock },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should render brand title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-title')?.textContent).toContain('Weather Someday');
  });

  it('should load weather data', () => {
    expect(component.weatherData()).toBeTruthy();
    expect(component.weatherData()?.name).toBe('São Paulo');
  });
});
