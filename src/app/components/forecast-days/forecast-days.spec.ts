import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ForecastDaysComponent } from './forecast-days';
import { ForecastData, ForecastItem } from '../../core/interfaces/forecast';

describe('ForecastDaysComponent', () => {
  let component: ForecastDaysComponent;
  let fixture: ComponentFixture<ForecastDaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForecastDaysComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ForecastDaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle null forecastData gracefully', () => {
    fixture.componentRef.setInput('forecastData', null);
    fixture.detectChanges();
    expect(component.dailyForecasts()).toEqual([]);
  });

  it('should round Celsius temperature properly', () => {
    expect(component.roundTemp(19.2)).toBe(19);
    expect(component.roundTemp(19.8)).toBe(20);
  });

  it('should group all eight forecasts by the city timezone date', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-01T12:00:00Z'));

    const timezoneOffsetSeconds = 9 * 60 * 60;
    const makeItem = (dt: number, temperature: number): ForecastItem => ({
      dt,
      main: {
        temp: temperature,
        feels_like: temperature,
        temp_min: temperature,
        temp_max: temperature,
        pressure: 1013,
        sea_level: 1013,
        grnd_level: 1000,
        humidity: 50,
        temp_kf: 0
      },
      weather: [{ id: 800, main: 'Clear', description: 'céu limpo', icon: '01d' }],
      clouds: { all: 0 },
      wind: { speed: 1, deg: 0, gust: 1 },
      visibility: 10000,
      pop: 0,
      sys: { pod: 'd' },
      dt_txt: ''
    });
    const forecastData: ForecastData = {
      cod: '200',
      message: 0,
      cnt: 16,
      list: [
        ...Array.from({ length: 8 }, (_, hour) =>
          makeItem(
            Date.UTC(2024, 1, 29, 15 + hour * 3) / 1000,
            10 + hour
          )
        ),
        ...Array.from({ length: 8 }, (_, hour) =>
          makeItem(
            Date.UTC(2024, 2, 1, 15 + hour * 3) / 1000,
            100 + hour
          )
        )
      ],
      city: {
        id: 1,
        name: 'Tokyo',
        coord: { lat: 35.6762, lon: 139.6503 },
        country: 'JP',
        population: 0,
        timezone: timezoneOffsetSeconds,
        sunrise: 0,
        sunset: 0
      }
    };

    try {
      fixture.componentRef.setInput('forecastData', forecastData);
      const days = component.dailyForecasts();

      expect(days).toHaveLength(2);
      expect(days[0]).toMatchObject({
        dayLabel: 'Hoje',
        formattedDate: '01 Mar',
        minTemp: 10,
        maxTemp: 17
      });
      expect(days[1]).toMatchObject({
        dayLabel: 'Amanhã',
        formattedDate: '02 Mar',
        minTemp: 100,
        maxTemp: 107
      });
    } finally {
      vi.useRealTimers();
    }
  });
});
