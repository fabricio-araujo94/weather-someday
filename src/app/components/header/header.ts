import { Component, OnInit, OnDestroy, NgZone, inject, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentDate = signal(new Date());
  private ngZone = inject(NgZone);
  private timerId?: ReturnType<typeof setInterval>;
  
  searchCity = '';

  search = output<string>();
  geoClick = output<void>();

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.timerId = setInterval(() => {
        this.currentDate.set(new Date());
      }, 1000);
    });
  }

  ngOnDestroy(): void {
    if (this.timerId !== undefined) {
      clearInterval(this.timerId);
    }
  }

  onSearch(): void {
    const trimmed = this.searchCity.trim();
    if (trimmed) {
      this.search.emit(trimmed);
      this.searchCity = '';
    }
  }

  onGeoClick(): void {
    this.geoClick.emit();
  }

  clearSearch(): void {
    this.searchCity = '';
  }
}
