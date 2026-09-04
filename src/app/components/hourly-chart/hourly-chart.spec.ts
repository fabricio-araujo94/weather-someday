import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HourlyChart } from './hourly-chart';

describe('HourlyChart', () => {
  let component: HourlyChart;
  let fixture: ComponentFixture<HourlyChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HourlyChart],
    }).compileComponents();

    fixture = TestBed.createComponent(HourlyChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
