import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent]
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
