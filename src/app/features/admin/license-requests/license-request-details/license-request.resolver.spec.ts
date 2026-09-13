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

import { LicenseRequestService } from '@enclave/domain/services';

import {
  licenseRequestDetailsBreadcrumbResolver,
  licenseRequestDetailsTitleResolver,
} from './license-request.resolver';

function routeSnapshotFor(licenseRequestId: string): ActivatedRouteSnapshot {
  return { paramMap: convertToParamMap({ licenseRequestId }) } as ActivatedRouteSnapshot;
}

describe('license request breadcrumb resolvers', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  describe('licenseRequestDetailsBreadcrumbResolver', () => {
    it('resolves to ["License Requests", "<product> - <organization>"] for an existing license request', () => {
      const result = TestBed.runInInjectionContext(() =>
        licenseRequestDetailsBreadcrumbResolver(routeSnapshotFor('1'), {} as RouterStateSnapshot),
      );

      expect(result).toEqual(['License Requests', 'Vault Analytics - Northwind Systems']);
    });

    it('redirects to /not-found for an unknown license request id', () => {
      const result = TestBed.runInInjectionContext(() =>
        licenseRequestDetailsBreadcrumbResolver(routeSnapshotFor('999'), {} as RouterStateSnapshot),
      );

      expect(result).toBeInstanceOf(RedirectCommand);
      const router = TestBed.inject(Router);
      expect(router.serializeUrl((result as RedirectCommand).redirectTo)).toBe('/not-found');
    });

    it('redirects to /not-found when the license request references a product that no longer exists', () => {
      const licenseRequestService = TestBed.inject(LicenseRequestService);
      vi.spyOn(licenseRequestService, 'getLicenseRequestById').mockReturnValue({
        id: '1',
        orgId: '1',
        productId: 'missing-product',
        userId: '1',
        status: 'Pending',
      });

      const result = TestBed.runInInjectionContext(() =>
        licenseRequestDetailsBreadcrumbResolver(routeSnapshotFor('1'), {} as RouterStateSnapshot),
      );

      expect(result).toBeInstanceOf(RedirectCommand);
      const router = TestBed.inject(Router);
      expect(router.serializeUrl((result as RedirectCommand).redirectTo)).toBe('/not-found');
    });

    it('redirects to /not-found when the license request references an organization that no longer exists', () => {
      const licenseRequestService = TestBed.inject(LicenseRequestService);
      vi.spyOn(licenseRequestService, 'getLicenseRequestById').mockReturnValue({
        id: '1',
        orgId: 'missing-org',
        productId: '1',
        userId: '1',
        status: 'Pending',
      });

      const result = TestBed.runInInjectionContext(() =>
        licenseRequestDetailsBreadcrumbResolver(routeSnapshotFor('1'), {} as RouterStateSnapshot),
      );

      expect(result).toBeInstanceOf(RedirectCommand);
      const router = TestBed.inject(Router);
      expect(router.serializeUrl((result as RedirectCommand).redirectTo)).toBe('/not-found');
    });
  });

  describe('licenseRequestDetailsTitleResolver', () => {
    it('resolves to "<product> - <organization>" for an existing license request', () => {
      const result = TestBed.runInInjectionContext(() =>
        licenseRequestDetailsTitleResolver(routeSnapshotFor('1'), {} as RouterStateSnapshot),
      );

      expect(result).toBe('Vault Analytics - Northwind Systems');
    });

    it('falls back to a generic title for an unknown license request id', () => {
      const result = TestBed.runInInjectionContext(() =>
        licenseRequestDetailsTitleResolver(routeSnapshotFor('999'), {} as RouterStateSnapshot),
      );

      expect(result).toBe('License Request Details');
    });
  });
});
