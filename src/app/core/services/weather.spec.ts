import { TestBed } from '@angular/core/testing';
import { WeatherService } from './weather';

describe('Weather', () => {
  let service: WeatherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Weather);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
