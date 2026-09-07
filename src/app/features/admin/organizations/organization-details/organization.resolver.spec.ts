import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  provideRouter,
  RedirectCommand,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import {
  organizationDetailsBreadcrumbResolver,
  organizationDetailsTitleResolver,
} from './organization.resolver';

function routeSnapshotFor(organizationId: string): ActivatedRouteSnapshot {
  return { paramMap: convertToParamMap({ organizationId }) } as ActivatedRouteSnapshot;
}

describe('organization breadcrumb resolvers', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  describe('organizationDetailsBreadcrumbResolver', () => {
    it('resolves to ["Organizations", name] for an existing organization', () => {
      const result = TestBed.runInInjectionContext(() =>
        organizationDetailsBreadcrumbResolver(routeSnapshotFor('1'), {} as RouterStateSnapshot),
      );

      expect(result).toEqual(['Organizations', 'Northwind Systems']);
    });

    it('redirects to /not-found for an unknown organization id', () => {
      const result = TestBed.runInInjectionContext(() =>
        organizationDetailsBreadcrumbResolver(routeSnapshotFor('999'), {} as RouterStateSnapshot),
      );

      expect(result).toBeInstanceOf(RedirectCommand);
      const router = TestBed.inject(Router);
      expect(router.serializeUrl((result as RedirectCommand).redirectTo)).toBe('/not-found');
    });
  });

  describe('organizationDetailsTitleResolver', () => {
    it('resolves to the organization name for an existing organization', () => {
      const result = TestBed.runInInjectionContext(() =>
        organizationDetailsTitleResolver(routeSnapshotFor('1'), {} as RouterStateSnapshot),
      );

      expect(result).toBe('Northwind Systems');
    });

    it('falls back to a generic title for an unknown organization id', () => {
      const result = TestBed.runInInjectionContext(() =>
        organizationDetailsTitleResolver(routeSnapshotFor('999'), {} as RouterStateSnapshot),
      );

      expect(result).toBe('Organization Details');
    });
  });
});
