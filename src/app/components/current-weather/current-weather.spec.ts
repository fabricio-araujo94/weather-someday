import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrentWeatherComponent } from './current-weather';

describe('CurrentWeatherComponent', () => {
  let component: CurrentWeatherComponent;
  let fixture: ComponentFixture<CurrentWeatherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentWeatherComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentWeatherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should round Celsius temperature properly', () => {
    expect(component.roundTemp(25.4)).toBe(25);
    expect(component.roundTemp(25.6)).toBe(26);
  });

  it('should calculate sunTimes progress correctly during day', () => {
    const mockWeather = {
      name: 'São Paulo',
      timezone: 0,
      sys: {
        country: 'BR',
        sunrise: 1000,
        sunset: 2000
      },
      main: { temp: 20, feels_like: 20, temp_min: 15, temp_max: 25, pressure: 1013, humidity: 50 },
      weather: [{ description: 'ensolarado', icon: '01d' }],
      wind: { speed: 5, deg: 90 }
    } as any;

    fixture.componentRef.setInput('weatherData', mockWeather);
    // Midday (1500s) -> 50%
    component.currentTimeMs.set(1500 * 1000);
    fixture.detectChanges();

    const result = component.sunTimes();
    expect(result.isDay).toBe(true);
    expect(result.progressPercent).toBe(50);
  });

  it('should calculate sunTimes progress correctly during night', () => {
    const mockWeather = {
      name: 'São Paulo',
      timezone: 0,
      sys: {
        country: 'BR',
        sunrise: 100000,
        sunset: 140000
      },
      main: { temp: 15, feels_like: 15, temp_min: 10, temp_max: 20, pressure: 1013, humidity: 60 },
      weather: [{ description: 'noite limpa', icon: '01n' }],
      wind: { speed: 2, deg: 180 }
    } as any;

    fixture.componentRef.setInput('weatherData', mockWeather);
    // After sunset: sunset is 140000, next sunrise is 100000 + 86400 = 186400.
    // Mid-night is 140000 + 46400 / 2 = 163200s.
    component.currentTimeMs.set(163200 * 1000);
    fixture.detectChanges();

    const result = component.sunTimes();
    expect(result.isDay).toBe(false);
    expect(result.progressPercent).toBe(50);
  });
});
