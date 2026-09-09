import { Injectable, signal } from '@angular/core';

import { readLocalStorage, writeLocalStorage } from '@enclave/core/storage/local-storage';

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
    const root = document.documentElement;
    root.classList.add('theme-transitioning');

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target === document.body && event.propertyName == 'background-color') {
        root.classList.remove('theme-transitioning');
        document.body.removeEventListener('transitionend', onTransitionEnd);
      }
    };
    document.body.addEventListener('transitionend', onTransitionEnd);

    this.theme.set(theme);
    this.applyTheme(theme);
    writeLocalStorage(STORAGE_KEY, theme);
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.dataset['theme'] = theme;
  }

  /** Resolves theme on page load.
   * Priority: Remembered Choice > OS Preference > Brand Default (dark)
   */
  private resolveInitialTheme(): Theme {
    const existingTheme = readLocalStorage(STORAGE_KEY) as Theme | null;
    if (existingTheme) {
      return existingTheme;
    }

    const osTheme = this.resolveOsTheme();
    writeLocalStorage(STORAGE_KEY, osTheme);

    return osTheme;
  }

  /** Falls back to the brand default when matchMedia is missing or throws (SSR, jsdom). */
  private resolveOsTheme(): Theme {
    try {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  }
}
