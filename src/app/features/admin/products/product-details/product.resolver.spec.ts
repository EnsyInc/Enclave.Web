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
  productDetailsBreadcrumbResolver,
  productDetailsTitleResolver,
} from './product.resolver';

function routeSnapshotFor(productId: string): ActivatedRouteSnapshot {
  return { paramMap: convertToParamMap({ productId }) } as ActivatedRouteSnapshot;
}

describe('product breadcrumb resolvers', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  describe('productDetailsBreadcrumbResolver', () => {
    it('resolves to ["Products", name] for an existing product', () => {
      const result = TestBed.runInInjectionContext(() =>
        productDetailsBreadcrumbResolver(routeSnapshotFor('1'), {} as RouterStateSnapshot),
      );

      expect(result).toEqual(['Products', 'Enclave Core']);
    });

    it('redirects to /not-found for an unknown product id', () => {
      const result = TestBed.runInInjectionContext(() =>
        productDetailsBreadcrumbResolver(routeSnapshotFor('999'), {} as RouterStateSnapshot),
      );

      expect(result).toBeInstanceOf(RedirectCommand);
      const router = TestBed.inject(Router);
      expect(router.serializeUrl((result as RedirectCommand).redirectTo)).toBe('/not-found');
    });
  });

  describe('productDetailsTitleResolver', () => {
    it('resolves to the product name for an existing product', () => {
      const result = TestBed.runInInjectionContext(() =>
        productDetailsTitleResolver(routeSnapshotFor('1'), {} as RouterStateSnapshot),
      );

      expect(result).toBe('Enclave Core');
    });

    it('falls back to a generic title for an unknown product id', () => {
      const result = TestBed.runInInjectionContext(() =>
        productDetailsTitleResolver(routeSnapshotFor('999'), {} as RouterStateSnapshot),
      );

      expect(result).toBe('Product Details');
    });
  });
});
