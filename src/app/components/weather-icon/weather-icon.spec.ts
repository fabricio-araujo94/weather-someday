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
});
