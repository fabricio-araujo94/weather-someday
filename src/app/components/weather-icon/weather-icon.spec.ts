import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeatherIconComponent } from './weather-icon';

describe('WeatherIconComponent', () => {
  let component: WeatherIconComponent;
  let fixture: ComponentFixture<WeatherIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherIconComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(WeatherIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should identify sun icon correctly', () => {
    fixture.componentRef.setInput('icon', '01d');
    fixture.detectChanges();
    expect(component.iconCategory).toBe('sun');
  });

  it('should identify rain icon correctly', () => {
    fixture.componentRef.setInput('icon', '10d');
    fixture.detectChanges();
    expect(component.iconCategory).toBe('rain');
  });

  it('should render the OpenWeatherMap fallback for unknown icons and conditions', () => {
    fixture.componentRef.setInput('icon', '99x');
    fixture.componentRef.setInput('condition', 'unknown condition');
    fixture.detectChanges();

    expect(component.iconCategory).toBe('default');
    const fallbackImage = fixture.nativeElement.querySelector('.img-fallback') as HTMLImageElement;
    expect(fallbackImage).not.toBeNull();
    expect(fallbackImage.src).toBe('https://openweathermap.org/img/wn/99x@4x.png');
  });
});
