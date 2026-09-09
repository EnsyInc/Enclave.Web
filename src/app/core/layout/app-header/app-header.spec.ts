import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, RouterOutlet, withComponentInputBinding } from '@angular/router';
import { vi } from 'vitest';

import { routes } from '@enclave/app.routes';
import { ThemeService } from '@enclave/core';
import { EnclaveAvatar } from '@enclave/core/components';

import { AppHeader } from './app-header';

@Component({
  imports: [AppHeader, RouterOutlet],
  template: `<enclave-header (toggleSidenav)="toggleCount = toggleCount + 1" /><router-outlet />`,
})
class HostComponent {
  toggleCount = 0;
}

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

describe('AppHeader', () => {
  let hostFixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let component: AppHeader;

  beforeEach(async () => {
    // The real /admin routes activate AppShell, so navigating below renders a *second*,
    // nested AppHeader inside it. Harmless for these assertions -- every query resolves to
    // the host's own header, which comes first in document order -- but the shell itself
    // needs localStorage and a BreakpointObserver-grade matchMedia to construct at all.
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
      imports: [HostComponent],
      // Real app routes (not an empty array) so the breadcrumb tests below can
      // navigate to routes that actually carry `data.breadcrumb`. Input binding
      // is required too: ProductDetails reads its :productId param as an input.
      providers: [provideRouter(routes, withComponentInputBinding())],
    }).compileComponents();

    hostFixture = TestBed.createComponent(HostComponent);
    host = hostFixture.componentInstance;
    component = hostFixture.debugElement.query(By.directive(AppHeader)).componentInstance;
    await hostFixture.whenStable();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('passes the user name to the avatar, asking for two initials', () => {
    const avatar = hostFixture.debugElement.query(By.directive(EnclaveAvatar))
      .componentInstance as EnclaveAvatar;

    expect(avatar.name()).toBe('John Doe');
    expect(avatar.maxInitials()).toBe(2);
  });

  it('emits toggleSidenav when the menu button is clicked', () => {
    const toggleButton: HTMLButtonElement =
      hostFixture.debugElement.nativeElement.querySelector('.app-header-left button');
    toggleButton.click();

    expect(host.toggleCount).toBe(1);
  });

  it('toggles the theme when the moon button is clicked', () => {
    const themeService = TestBed.inject(ThemeService);
    const toggleSpy = vi.spyOn(themeService, 'toggle').mockImplementation(() => {});

    const themeButton: HTMLButtonElement = hostFixture.debugElement.nativeElement.querySelector(
      '.app-header-right button',
    );
    themeButton.click();

    expect(toggleSpy).toHaveBeenCalledOnce();
  });

  it('has no breadcrumb before any route has been activated', () => {
    expect(component['breadcrumb']()).toEqual([]);
  });

  it('shows the active route breadcrumb once navigation resolves', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/admin/products');
    await hostFixture.whenStable();

    expect(component['breadcrumb']()).toEqual(['Products']);
  });

  it('updates the breadcrumb again on subsequent navigation', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/admin/products');
    await hostFixture.whenStable();

    await router.navigateByUrl('/admin/licenses');
    await hostFixture.whenStable();

    expect(component['breadcrumb']()).toEqual(['Licenses']);
  });

  it('shows every segment of a multi-part breadcrumb (product detail resolver)', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/admin/products/1');
    await hostFixture.whenStable();

    expect(component['breadcrumb']()).toEqual(['Products', 'Enclave Core']);
  });

  it('has no section before any route has been activated', () => {
    expect(component['section']()).toBeUndefined();
  });

  it('shows the section inherited from the admin parent route', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/admin/products');
    await hostFixture.whenStable();

    expect(component['section']()).toBe('Admin');
  });

  it('renders the full breadcrumb trail once navigation resolves', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/admin/products');
    await hostFixture.whenStable();

    const breadcrumbText: string = hostFixture.debugElement.nativeElement
      .querySelector('.breadcrumb')
      .textContent.replace(/\s+/g, '')
      .trim();
    expect(breadcrumbText).toBe('Enclave/Admin/Products');
  });

  it('renders every segment of a multi-part breadcrumb trail', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/admin/products/1');
    await hostFixture.whenStable();

    const breadcrumbText: string = hostFixture.debugElement.nativeElement
      .querySelector('.breadcrumb')
      .textContent.replace(/\s+/g, '')
      .trim();
    expect(breadcrumbText).toBe('Enclave/Admin/Products/EnclaveCore');
  });
});
