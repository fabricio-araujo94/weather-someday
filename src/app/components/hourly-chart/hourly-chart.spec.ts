import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HourlyChartComponent } from './hourly-chart';
import { ForecastData, ForecastItem } from '../../core/interfaces/forecast';

describe('HourlyChartComponent', () => {
  let component: HourlyChartComponent;
  let fixture: ComponentFixture<HourlyChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HourlyChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HourlyChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should label forecast points using the city timezone', () => {
    const makeItem = (dt: number): ForecastItem => ({
      dt,
      main: {
        temp: 20,
        feels_like: 20,
        temp_min: 19,
        temp_max: 21,
        pressure: 1013,
        sea_level: 1013,
        grnd_level: 1000,
        humidity: 50,
        temp_kf: 0
      },
      weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
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
      cnt: 2,
      list: [
        makeItem(Date.UTC(2024, 0, 1, 15) / 1000),
        makeItem(Date.UTC(2024, 0, 1, 18, 30) / 1000)
      ],
      city: {
        id: 1,
        name: 'Tokyo',
        coord: { lat: 35.6762, lon: 139.6503 },
        country: 'JP',
        population: 0,
        timezone: 9 * 60 * 60,
        sunrise: 0,
        sunset: 0
      }
    };

    fixture.componentRef.setInput('forecastData', forecastData);
    fixture.detectChanges();

    expect(component.chartData.labels).toEqual(['Agora', '03:30']);
    expect(component.chartData.datasets[0].data).toEqual([20, 20]);

    fixture.componentRef.setInput('forecastData', null);
    fixture.detectChanges();

    expect(component.chartData.labels).toEqual([]);
    expect(component.chartData.datasets[0].data).toEqual([]);

    fixture.componentRef.setInput('forecastData', forecastData);
    fixture.detectChanges();
    fixture.componentRef.setInput('forecastData', { ...forecastData, list: [] });
    fixture.detectChanges();

    expect(component.chartData.labels).toEqual([]);
    expect(component.chartData.datasets[0].data).toEqual([]);
  });
});
