import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'enclave-theme';

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
    // TODO(human): decide which theme to use before the user has made any
    // explicit in-app choice. You have two signals available:
    //   - localStorage.getItem(STORAGE_KEY): a previously saved 'dark' | 'light',
    //     or null if this browser has never chosen one.
    //   - window.matchMedia('(prefers-color-scheme: light)').matches: the OS-level
    //     preference.
    // Decide the precedence between "remembered choice", "OS preference", and
    // the brand default (dark — see docs/UiUx/branding.md, "Dark mode is the
    // natural home for this palette").
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
