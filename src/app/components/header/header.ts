import { Component, OnInit, OnDestroy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentDate = new Date();
  private timeSubscription?: Subscription;
  
  searchCity = '';
  search = output<string>();
  geoClick = output<void>();

  ngOnInit(): void {
    this.timeSubscription = interval(1000).pipe(
      map(() => new Date())
    ).subscribe(time => {
      this.currentDate = time;
    });
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }

  onSearch(): void {
    if (this.searchCity.trim()) {
      this.search.emit(this.searchCity.trim());
      this.searchCity = '';
    }
  }

  onGeoClick(): void {
    this.geoClick.emit();
  }
}
