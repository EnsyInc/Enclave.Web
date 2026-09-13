import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  provideRouter,
  RedirectCommand,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { vi } from 'vitest';

import { LicenseService } from '@enclave/domain/services';

import { licenseDetailsBreadcrumbResolver, licenseDetailsTitleResolver } from './license.resolver';

function routeSnapshotFor(licenseId: string): ActivatedRouteSnapshot {
  return { paramMap: convertToParamMap({ licenseId }) } as ActivatedRouteSnapshot;
}

describe('license breadcrumb resolvers', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  describe('licenseDetailsBreadcrumbResolver', () => {
    it('resolves to ["Licenses", "<product> - <organization>"] for an existing license', () => {
      const result = TestBed.runInInjectionContext(() =>
        licenseDetailsBreadcrumbResolver(routeSnapshotFor('1'), {} as RouterStateSnapshot),
      );

      expect(result).toEqual(['Licenses', 'Enclave Core - Northwind Systems']);
    });

    it('redirects to /not-found for an unknown license id', () => {
      const result = TestBed.runInInjectionContext(() =>
        licenseDetailsBreadcrumbResolver(routeSnapshotFor('999'), {} as RouterStateSnapshot),
      );

      expect(result).toBeInstanceOf(RedirectCommand);
      const router = TestBed.inject(Router);
      expect(router.serializeUrl((result as RedirectCommand).redirectTo)).toBe('/not-found');
    });

    it('redirects to /not-found when the license references a product that no longer exists', () => {
      const licenseService = TestBed.inject(LicenseService);
      vi.spyOn(licenseService, 'getLicenseById').mockReturnValue({
        id: '1',
        orgId: '1',
        productId: 'missing-product',
        start: new Date(),
        end: new Date(),
        status: 'Active',
      });

      const result = TestBed.runInInjectionContext(() =>
        licenseDetailsBreadcrumbResolver(routeSnapshotFor('1'), {} as RouterStateSnapshot),
      );

      expect(result).toBeInstanceOf(RedirectCommand);
      const router = TestBed.inject(Router);
      expect(router.serializeUrl((result as RedirectCommand).redirectTo)).toBe('/not-found');
    });

    it('redirects to /not-found when the license references an organization that no longer exists', () => {
      const licenseService = TestBed.inject(LicenseService);
      vi.spyOn(licenseService, 'getLicenseById').mockReturnValue({
        id: '1',
        orgId: 'missing-org',
        productId: '1',
        start: new Date(),
        end: new Date(),
        status: 'Active',
      });

      const result = TestBed.runInInjectionContext(() =>
        licenseDetailsBreadcrumbResolver(routeSnapshotFor('1'), {} as RouterStateSnapshot),
      );

      expect(result).toBeInstanceOf(RedirectCommand);
      const router = TestBed.inject(Router);
      expect(router.serializeUrl((result as RedirectCommand).redirectTo)).toBe('/not-found');
    });
  });

  describe('licenseDetailsTitleResolver', () => {
    it('resolves to "<product> - <organization>" for an existing license', () => {
      const result = TestBed.runInInjectionContext(() =>
        licenseDetailsTitleResolver(routeSnapshotFor('1'), {} as RouterStateSnapshot),
      );

      expect(result).toBe('Enclave Core - Northwind Systems');
    });

    it('falls back to a generic title for an unknown license id', () => {
      const result = TestBed.runInInjectionContext(() =>
        licenseDetailsTitleResolver(routeSnapshotFor('999'), {} as RouterStateSnapshot),
      );

      expect(result).toBe('License Details');
    });
  });
});
