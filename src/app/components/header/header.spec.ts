import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LOCALE_ID, NgZone } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { vi } from 'vitest';
import { HeaderComponent } from './header';

registerLocaleData(localePt, 'pt-BR');

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit search on onSearch() with valid input', () => {
    let emittedCity = '';
    component.search.subscribe(city => {
      emittedCity = city;
    });

    component.searchCity = 'Rio de Janeiro';
    component.onSearch();

    expect(emittedCity).toBe('Rio de Janeiro');
    expect(component.searchCity).toBe('');
  });

  it('should update the clock outside Angular and clear its timer on destroy', () => {
    fixture.destroy();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-14T12:00:00Z'));

    const ngZone = TestBed.inject(NgZone);
    const runOutsideAngular = vi.spyOn(ngZone, 'runOutsideAngular');
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    try {
      fixture.detectChanges();

      expect(runOutsideAngular).toHaveBeenCalled();
      const initialTime = component.currentDate().getTime();

      vi.advanceTimersByTime(1000);
      expect(component.currentDate().getTime()).toBe(initialTime + 1000);

      fixture.destroy();
      vi.advanceTimersByTime(2000);
      expect(component.currentDate().getTime()).toBe(initialTime + 1000);
    } finally {
      fixture.destroy();
      vi.useRealTimers();
    }
  });
});
