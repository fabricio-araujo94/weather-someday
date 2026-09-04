import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForecastDaysComponent } from './forecast-days';

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
});
