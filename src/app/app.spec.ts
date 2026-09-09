import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { App } from './app';

/**
 * Stands in for whatever the router activates. App renders nothing but an outlet now that the
 * shell is scoped to the /admin subtree, so this asserts the outlet wiring without dragging
 * AppShell (and its BreakpointObserver/localStorage setup) into App's own spec.
 */
@Component({ template: 'routed content' })
class StubRoutedComponent {}

function createStorageMock(): Storage {
  const store = new Map<string, string>();
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

describe('App', () => {
  beforeEach(async () => {
    vi.stubGlobal('localStorage', createStorageMock());
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as typeof window.matchMedia,
    );

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([{ path: '', component: StubRoutedComponent }])],
    }).compileComponents();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the routed component into its outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigate(['/']);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('routed content');
  });
});
