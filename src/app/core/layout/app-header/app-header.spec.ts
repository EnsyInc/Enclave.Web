import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import { vi } from 'vitest';

import { AppHeader } from './app-header';
import { routes } from '../../../app.routes';
import { ThemeService } from '../../theme/theme.service';

@Component({
  imports: [AppHeader, RouterOutlet],
  template: `<app-header (toggleSidenav)="toggleCount = toggleCount + 1" /><router-outlet />`,
})
class HostComponent {
  toggleCount = 0;
}

describe('AppHeader', () => {
  let hostFixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let component: AppHeader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      // Real app routes (not an empty array) so the breadcrumb tests below can
      // navigate to routes that actually carry `data.breadcrumb`.
      providers: [provideRouter(routes)],
    }).compileComponents();

    hostFixture = TestBed.createComponent(HostComponent);
    host = hostFixture.componentInstance;
    component = hostFixture.debugElement.query(By.directive(AppHeader)).componentInstance;
    await hostFixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('derives initials from the user name', () => {
    expect(component['userInitials']).toBe('JD');
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
    expect(component['breadcrumb']()).toBeUndefined();
  });

  it('shows the active route breadcrumb once navigation resolves', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/admin/products');
    await hostFixture.whenStable();

    expect(component['breadcrumb']()).toBe('Products');
  });

  it('updates the breadcrumb again on subsequent navigation', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/admin/products');
    await hostFixture.whenStable();

    await router.navigateByUrl('/admin/licenses');
    await hostFixture.whenStable();

    expect(component['breadcrumb']()).toBe('Licenses');
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
});
