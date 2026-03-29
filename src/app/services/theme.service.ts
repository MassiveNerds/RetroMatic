import { Injectable } from '@angular/core';

const STORAGE_KEY = 'rm-color-scheme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark: boolean;

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    this.isDark = stored !== 'light';
    this._apply();
  }

  toggle(): void {
    this.isDark = !this.isDark;
    localStorage.setItem(STORAGE_KEY, this.isDark ? 'dark' : 'light');
    this._apply();
  }

  private _apply(): void {
    if (this.isDark) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }
}
