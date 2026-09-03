import { TestBed } from '@angular/core/testing';

import { STORAGE_KEY, ThemeService } from './theme.service';

function createStorageMock(initial: Record<string, string> = {}): Storage {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => void store.set(key, value),
    removeItem: (key) => void store.delete(key),
    clear: () => store.clear(),
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
}

function stubMatchMedia(matches: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches }) as unknown as typeof window.matchMedia,
  );
}

describe('ThemeService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to dark when localStorage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined);

    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('dark');
  });

  it('prefers a previously saved theme over OS preference', () => {
    vi.stubGlobal('localStorage', createStorageMock({ [STORAGE_KEY]: 'light' }));
    stubMatchMedia(false); // OS says dark; the saved choice should still win

    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('light');
  });

  it('falls back to OS preference and persists it when nothing is saved', () => {
    const storage = createStorageMock();
    vi.stubGlobal('localStorage', storage);
    stubMatchMedia(true); // OS prefers light

    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('light');
    expect(storage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('falls back to dark when nothing is saved and the OS has no light preference', () => {
    vi.stubGlobal('localStorage', createStorageMock());
    stubMatchMedia(false);

    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('dark');
  });

  it('applies the resolved theme to the document element on construction', () => {
    vi.stubGlobal('localStorage', createStorageMock({ [STORAGE_KEY]: 'light' }));

    TestBed.inject(ThemeService);

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('toggle() flips between dark and light, persisting and re-applying each time', () => {
    const storage = createStorageMock({ [STORAGE_KEY]: 'dark' });
    vi.stubGlobal('localStorage', storage);
    const service = TestBed.inject(ThemeService);

    service.toggle();

    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(storage.getItem(STORAGE_KEY)).toBe('light');

    service.toggle();

    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(storage.getItem(STORAGE_KEY)).toBe('dark');
  });

  describe('theme-transitioning class', () => {
    let service: ThemeService;

    beforeEach(() => {
      vi.stubGlobal('localStorage', createStorageMock({ [STORAGE_KEY]: 'dark' }));
      service = TestBed.inject(ThemeService);
    });

    afterEach(() => {
      document.documentElement.classList.remove('theme-transitioning');
    });

    it('adds theme-transitioning to the document root while the theme change animates', () => {
      service.setTheme('light');

      expect(document.documentElement.classList.contains('theme-transitioning')).toBe(true);
    });

    it('removes theme-transitioning once the body background-color transition ends', () => {
      service.setTheme('light');

      document.body.dispatchEvent(
        new TransitionEvent('transitionend', { propertyName: 'background-color' }),
      );

      expect(document.documentElement.classList.contains('theme-transitioning')).toBe(false);
    });

    it('ignores transitionend events for properties other than background-color', () => {
      service.setTheme('light');

      document.body.dispatchEvent(
        new TransitionEvent('transitionend', { propertyName: 'opacity' }),
      );

      expect(document.documentElement.classList.contains('theme-transitioning')).toBe(true);
    });

    it('ignores transitionend events that did not originate on the body', () => {
      service.setTheme('light');
      const child = document.createElement('div');
      document.body.appendChild(child);

      child.dispatchEvent(
        new TransitionEvent('transitionend', {
          propertyName: 'background-color',
          bubbles: true,
        }),
      );

      expect(document.documentElement.classList.contains('theme-transitioning')).toBe(true);
      child.remove();
    });
  });
});
