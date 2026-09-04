import { Component, OnInit, OnDestroy, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentDate = signal(new Date());
  private timerId?: ReturnType<typeof setInterval>;
  
  searchCity = '';

  search = output<string>();
  geoClick = output<void>();

  ngOnInit(): void {
    this.timerId = setInterval(() => {
      this.currentDate.set(new Date());
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
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
