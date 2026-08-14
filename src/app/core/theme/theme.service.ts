import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

export const STORAGE_KEY = 'enclave-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.resolveInitialTheme());

  constructor() {
    this.applyTheme(this.theme());
  }

  toggle(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
    this.applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }

  private resolveInitialTheme(): Theme {
    // Precedence: remembered choice > OS preference > brand default (dark —
    // see docs/UiUx/branding.md, "Dark mode is the natural home for this palette").
    if (typeof localStorage === 'undefined') {
      return 'dark';
    }

    const existingTheme = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (existingTheme) {
      return existingTheme;
    }

    const osTheme: Theme = window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
    localStorage.setItem(STORAGE_KEY, osTheme);

    return osTheme;
  }
}
