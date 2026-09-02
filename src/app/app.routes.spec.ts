import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';
import { EnclaveTitleStrategy } from './core/routing/enclave-title-strategy';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { ProductList } from './features/admin/products/product-list/product-list';
import { ProductDetails } from './features/admin/products/product-details/product-details';
import { Organizations } from './features/admin/organizations/organizations';
import { Licenses } from './features/admin/licenses/licenses';
import { LicenseRequests } from './features/admin/license-requests/license-requests';
import { NotFoundPage } from './features/not-found-page/not-found-page';

describe('app routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: TitleStrategy, useClass: EnclaveTitleStrategy },
      ],
    });
  });

  it('redirects the empty path to /admin/dashboard', async () => {
    const harness = await RouterTestingHarness.create('');
    const router = TestBed.inject(Router);

    expect(router.url).toBe('/admin/dashboard');
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(Dashboard);
  });

  it.each([
    ['/admin/dashboard', Dashboard, 'Dashboard'],
    ['/admin/products', ProductList, 'Products'],
    ['/admin/organizations', Organizations, 'Organizations'],
    ['/admin/licenses', Licenses, 'Licenses'],
    ['/admin/license-requests', LicenseRequests, 'License Requests'],
  ] as const)(
    'renders %s with the matching component and breadcrumb',
    async (url, expectedComponent, breadcrumb) => {
      const harness = await RouterTestingHarness.create(url);
      const router = TestBed.inject(Router);

      expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(expectedComponent);

      let route = router.routerState.root;
      while (route.firstChild) {
        route = route.firstChild;
      }
      expect(route.snapshot.data['breadcrumb']).toBe(breadcrumb);
    },
  );

  it('tags every admin route with a section of "Admin"', async () => {
    const harness = await RouterTestingHarness.create('/admin/dashboard');
    const router = TestBed.inject(Router);

    expect(harness.routeDebugElement).toBeTruthy();
    expect(router.routerState.root.firstChild?.snapshot.data['section']).toBe('Admin');
  });

  describe('/admin/products/:productId', () => {
    it('renders the product, binds the id input, and sets breadcrumb + title for an existing product', async () => {
      const harness = await RouterTestingHarness.create('/admin/products/1');
      const router = TestBed.inject(Router);

      const component = harness.routeDebugElement?.componentInstance;
      expect(component).toBeInstanceOf(ProductDetails);
      expect((component as ProductDetails)['productId']()).toBe('1');

      let route = router.routerState.root;
      while (route.firstChild) {
        route = route.firstChild;
      }
      expect(route.snapshot.data['breadcrumb']).toEqual(['Products', 'Enclave Core']);
      expect(TestBed.inject(Title).getTitle()).toBe('Enclave Core | Enclave');
    });

    it('redirects to /not-found for an unknown product id', async () => {
      const harness = await RouterTestingHarness.create('/admin/products/999');
      const router = TestBed.inject(Router);

      expect(router.url).toBe('/not-found');
      expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(NotFoundPage);
    });
  });

  it('redirects any unmatched path to /not-found', async () => {
    const harness = await RouterTestingHarness.create('/this/does/not/exist');
    const router = TestBed.inject(Router);

    expect(router.url).toBe('/not-found');
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(NotFoundPage);
  });
});
