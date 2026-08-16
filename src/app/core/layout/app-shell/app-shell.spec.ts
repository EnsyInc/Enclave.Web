import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { By } from '@angular/platform-browser';
import { MatSidenav } from '@angular/material/sidenav';
import { BehaviorSubject } from 'rxjs';

import { AppShell } from './app-shell';

describe('AppShell', () => {
  let component: AppShell;
  let fixture: ComponentFixture<AppShell>;
  // AppShell reads Breakpoints.Handset through toSignal({ requireSync: true }),
  // which needs a *synchronous* first emission on subscribe. A BehaviorSubject
  // gives us that initial value while still letting tests push new states in
  // to simulate the viewport resizing after the component is alive.
  let breakpointState$: BehaviorSubject<BreakpointState>;

  beforeEach(async () => {
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
});
