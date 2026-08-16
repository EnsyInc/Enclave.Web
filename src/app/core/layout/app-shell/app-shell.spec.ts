import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { By } from '@angular/platform-browser';
import { MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

import { AppShell, SIDENAV_STORAGE_KEY } from './app-shell';

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

describe('AppShell', () => {
  let component: AppShell;
  let fixture: ComponentFixture<AppShell>;
  // AppShell reads Breakpoints.Handset through toSignal({ requireSync: true }),
  // which needs a *synchronous* first emission on subscribe. A BehaviorSubject
  // gives us that initial value while still letting tests push new states in
  // to simulate the viewport resizing after the component is alive.
  let breakpointState$: BehaviorSubject<BreakpointState>;

  beforeEach(async () => {
    vi.stubGlobal('localStorage', createStorageMock());
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia,
    );
    breakpointState$ = new BehaviorSubject<BreakpointState>({ matches: false, breakpoints: {} });

    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [
        provideRouter([]),
        {
          provide: BreakpointObserver,
          useValue: { observe: () => breakpointState$.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens the sidenav as a permanent side panel on desktop', () => {
    const sidenav = fixture.debugElement.query(By.directive(MatSidenav))
      .componentInstance as MatSidenav;
    expect(sidenav.mode).toBe('side');
    expect(sidenav.opened).toBe(true);
  });

  it('switches the sidenav to an overlay drawer on handset', async () => {
    breakpointState$.next({ matches: true, breakpoints: {} });
    await fixture.whenStable();

    const sidenav = fixture.debugElement.query(By.directive(MatSidenav))
      .componentInstance as MatSidenav;
    expect(sidenav.mode).toBe('over');
    expect(sidenav.opened).toBe(false);
  });

  it('renders a nav link for each admin route', () => {
    const links: HTMLAnchorElement[] =
      fixture.debugElement.nativeElement.querySelectorAll('a[mat-list-item]');
    const hrefs = Array.from(links).map(
      (link) => link.getAttribute('routerLink') ?? link.getAttribute('href'),
    );

    expect(hrefs).toEqual([
      '/admin/dashboard',
      '/admin/products',
      '/admin/organizations',
      '/admin/licenses',
      '/admin/license-requests',
    ]);
  });

  describe('onToggleSidenav', () => {
    it('toggles the drawer open state on handset instead of collapsing it', async () => {
      breakpointState$.next({ matches: true, breakpoints: {} });
      await fixture.whenStable();
      const sidenav = fixture.debugElement.query(By.directive(MatSidenav))
        .componentInstance as MatSidenav;
      expect(sidenav.opened).toBe(false);

      component['onToggleSidenav']();
      await fixture.whenStable();

      expect(sidenav.opened).toBe(true);
      expect(component['sidenavCollapsed']()).toBe(false);
    });

    it('collapses the sidenav on desktop instead of closing the drawer', () => {
      const sidenav = fixture.debugElement.query(By.directive(MatSidenav))
        .componentInstance as MatSidenav;

      component['onToggleSidenav']();

      expect(component['sidenavCollapsed']()).toBe(true);
      expect(sidenav.opened).toBe(true);
    });

    it('reflects the collapsed state as a class on the sidenav', () => {
      const sidenavEl: HTMLElement = fixture.debugElement.query(
        By.directive(MatSidenav),
      ).nativeElement;
      expect(sidenavEl.classList.contains('collapsed')).toBe(false);

      component['onToggleSidenav']();
      fixture.detectChanges();

      expect(sidenavEl.classList.contains('collapsed')).toBe(true);
    });

    it('wires the header toggle button to onToggleSidenav', () => {
      const toggleSpy = vi.spyOn(
        component as unknown as { onToggleSidenav(): void },
        'onToggleSidenav',
      );
      const toggleButton: HTMLButtonElement =
        fixture.debugElement.nativeElement.querySelector('.app-header-left button');

      toggleButton.click();

      expect(toggleSpy).toHaveBeenCalledOnce();
    });

    it('persists the new collapsed state to localStorage on desktop', () => {
      component['onToggleSidenav']();
      expect(localStorage.getItem(SIDENAV_STORAGE_KEY)).toBe('true');

      component['onToggleSidenav']();
      expect(localStorage.getItem(SIDENAV_STORAGE_KEY)).toBe('false');
    });

    it('does not touch localStorage on handset', async () => {
      breakpointState$.next({ matches: true, breakpoints: {} });
      await fixture.whenStable();

      component['onToggleSidenav']();

      expect(localStorage.getItem(SIDENAV_STORAGE_KEY)).toBeNull();
    });
  });

  describe('persisted sidenav collapse state', () => {
    it('starts expanded when localStorage has no remembered state', () => {
      // The outer beforeEach already created `component` with clean storage.
      expect(component['sidenavCollapsed']()).toBe(false);
      expect(component['sidenavContentHidden']()).toBe(false);
    });

    it('starts collapsed when localStorage remembers a collapsed state', async () => {
      vi.stubGlobal('localStorage', createStorageMock({ [SIDENAV_STORAGE_KEY]: 'true' }));

      const freshFixture = TestBed.createComponent(AppShell);
      await freshFixture.whenStable();

      expect(freshFixture.componentInstance['sidenavCollapsed']()).toBe(true);
      expect(freshFixture.componentInstance['sidenavContentHidden']()).toBe(true);
    });

    it('starts expanded when localStorage is unavailable rather than throwing', async () => {
      vi.stubGlobal('localStorage', undefined);

      const freshFixture = TestBed.createComponent(AppShell);
      await freshFixture.whenStable();

      expect(freshFixture.componentInstance['sidenavCollapsed']()).toBe(false);
    });
  });

  describe('sidenav width-transition handling', () => {
    // jsdom's requestAnimationFrame is real, and other framework internals
    // (CDK overlay/viewport plumbing) schedule their own frames independently
    // of AppShell, so counting *total* rAF calls is noisy. Faking rAF/cAF
    // gives us a private, deterministic queue to drive, and we assert on the
    // one effect that's actually ours: calls to updateContentMargins.
    let updateContentMarginsSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      const sidenavContainer = fixture.debugElement.query(By.directive(MatSidenavContainer))
        .componentInstance as MatSidenavContainer;
      updateContentMarginsSpy = vi
        .spyOn(sidenavContainer, 'updateContentMargins')
        .mockImplementation(() => {});
      vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('ignores transitionstart events for properties other than width', () => {
      component['onSidenavTransitionStart']({ propertyName: 'opacity' } as TransitionEvent);
      vi.advanceTimersByTime(48);

      expect(updateContentMarginsSpy).not.toHaveBeenCalled();
    });

    it('re-measures content margins on every animation frame while the width transition runs', () => {
      component['onSidenavTransitionStart']({ propertyName: 'width' } as TransitionEvent);

      vi.advanceTimersByTime(16);
      expect(updateContentMarginsSpy).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(16);
      expect(updateContentMarginsSpy).toHaveBeenCalledTimes(2);
    });

    it('ignores transitionend events for properties other than width', () => {
      component['onSidenavTransitionStart']({ propertyName: 'width' } as TransitionEvent);
      component['onSidenavTransitionEnd']({ propertyName: 'opacity' } as TransitionEvent);
      updateContentMarginsSpy.mockClear();

      vi.advanceTimersByTime(16);

      expect(updateContentMarginsSpy).toHaveBeenCalledTimes(1);
    });

    it('stops re-measuring once the width transition ends, after one final update', () => {
      component['onSidenavTransitionStart']({ propertyName: 'width' } as TransitionEvent);
      vi.advanceTimersByTime(16);
      updateContentMarginsSpy.mockClear();

      component['onSidenavTransitionEnd']({ propertyName: 'width' } as TransitionEvent);
      expect(updateContentMarginsSpy).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(48);
      expect(updateContentMarginsSpy).toHaveBeenCalledTimes(1);
    });

    it('reveals sidenav content immediately when the width transition starts while expanding', () => {
      component['sidenavCollapsed'].set(false);
      component['sidenavContentHidden'].set(true);

      component['onSidenavTransitionStart']({ propertyName: 'width' } as TransitionEvent);

      expect(component['sidenavContentHidden']()).toBe(false);
    });

    it('keeps sidenav content visible while collapsing, hiding it only once the transition ends', () => {
      component['sidenavCollapsed'].set(true);
      component['sidenavContentHidden'].set(false);

      component['onSidenavTransitionStart']({ propertyName: 'width' } as TransitionEvent);
      expect(component['sidenavContentHidden']()).toBe(false);

      component['onSidenavTransitionEnd']({ propertyName: 'width' } as TransitionEvent);
      expect(component['sidenavContentHidden']()).toBe(true);
    });

    it('leaves sidenav content visible when the transition ends while expanded', () => {
      component['sidenavCollapsed'].set(false);
      component['sidenavContentHidden'].set(false);

      component['onSidenavTransitionEnd']({ propertyName: 'width' } as TransitionEvent);

      expect(component['sidenavContentHidden']()).toBe(false);
    });

    it('reflects the content-hidden state as a class on the sidenav', () => {
      const sidenavEl: HTMLElement = fixture.debugElement.query(
        By.directive(MatSidenav),
      ).nativeElement;
      expect(sidenavEl.classList.contains('content-hidden')).toBe(false);

      component['sidenavContentHidden'].set(true);
      fixture.detectChanges();

      expect(sidenavEl.classList.contains('content-hidden')).toBe(true);
    });
  });
});
