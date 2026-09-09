import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';

import { EnsyLabsIcon } from '@enclave/core/icons';

import { ErrorPage } from './error-page';

/** Target for the "Back to dashboard" link, so clicking it resolves to a real route. */
@Component({ template: 'home' })
class StubHome {}

describe('ErrorPage', () => {
  let component: ErrorPage;
  let fixture: ComponentFixture<ErrorPage>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorPage],
      // RouterLink (on the primary action) injects ActivatedRoute, so the component cannot be
      // constructed without router providers at all.
      providers: [provideRouter([{ path: '', component: StubHome }])],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorPage);
    component = fixture.componentInstance;
    element = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults its reason to NotFound', () => {
    expect(component['reason']()).toBe('NotFound');
  });

  it('shows the 404 status code', () => {
    expect(element.querySelector('.status-code')?.textContent?.trim()).toBe('404');
  });

  it('titles the page with a real heading element', () => {
    // An <h1> rather than a styled span: it is what screen-reader heading navigation lands on,
    // and what e2e/not-found.spec.ts matches via getByRole('heading').
    const heading = element.querySelector('h1');

    expect(heading).toBeTruthy();
    expect(heading?.textContent?.trim()).toBe('Page not found');
  });

  it('explains the failure in the subtitle', () => {
    expect(element.querySelector('.subtitle')?.textContent?.trim()).toBe(
      "The page you're looking for doesn't exist or may have been moved",
    );
  });

  it('renders the branding and action icons by their registered names', () => {
    const icons = fixture.debugElement
      .queryAll(By.directive(EnsyLabsIcon))
      .map((debugEl) => (debugEl.componentInstance as EnsyLabsIcon).name());

    expect(icons).toEqual(['logo-full', 'arrow-left']);
  });

  it('labels the primary action', () => {
    expect(element.querySelector('button')?.textContent?.trim()).toBe('Back to dashboard');
  });

  it('navigates to the app root when the primary action is clicked', async () => {
    const router = TestBed.inject(Router);
    element.querySelector('button')?.click();
    await fixture.whenStable();

    // '/' rather than the dashboard itself -- the root route owns the redirect, so this page
    // only has to point at it.
    expect(router.url).toBe('/');
  });

  describe('when the reason is Forbidden', () => {
    beforeEach(async () => {
      // setInput is how the router feeds route data to inputs too, so this is the same path
      // production takes -- and it works despite `reason` being protected.
      fixture.componentRef.setInput('reason', 'Forbidden');
      await fixture.whenStable();
    });

    it('shows the 403 status code', () => {
      expect(element.querySelector('.status-code')?.textContent?.trim()).toBe('403');
    });

    it('swaps the heading copy', () => {
      expect(element.querySelector('h1')?.textContent?.trim()).toBe('Access denied');
    });

    it('swaps the subtitle copy', () => {
      expect(element.querySelector('.subtitle')?.textContent?.trim()).toBe(
        "You don't have permission to view this page. Ask your administrator if you need access",
      );
    });

    it('keeps the same primary action', () => {
      expect(element.querySelector('button')?.textContent?.trim()).toBe('Back to dashboard');
    });
  });

  describe('when the reason is missing', () => {
    beforeEach(async () => {
      // Exactly what the router does to a route that declares no `data.reason`: the input
      // binder's 'alwaysUndefined' behavior calls setInput(name, undefined), which beats the
      // input()'s own default. The page must still render rather than throw.
      fixture.componentRef.setInput('reason', undefined);
      await fixture.whenStable();
    });

    it('falls back to the not-found copy', () => {
      expect(element.querySelector('.status-code')?.textContent?.trim()).toBe('404');
      expect(element.querySelector('h1')?.textContent?.trim()).toBe('Page not found');
      expect(element.querySelector('.subtitle')?.textContent?.trim()).toBe(
        "The page you're looking for doesn't exist or may have been moved",
      );
    });
  });
});
