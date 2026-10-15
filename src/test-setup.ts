class MockIntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly scrollMargin: string = '';
  readonly thresholds: readonly number[] = [];
  observe(): void { /* no-op */ }
  unobserve(): void { /* no-op */ }
  disconnect(): void { /* no-op */ }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

(globalThis as unknown as Record<string, unknown>)['IntersectionObserver'] = MockIntersectionObserver;
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>)['IntersectionObserver'] = MockIntersectionObserver;
}

import '@angular/compiler';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
