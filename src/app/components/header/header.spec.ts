import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
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
});
