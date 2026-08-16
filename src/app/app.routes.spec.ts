import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { Products } from './features/admin/products/products';
import { Organizations } from './features/admin/organizations/organizations';
import { Licenses } from './features/admin/licenses/licenses';
import { LicenseRequests } from './features/admin/license-requests/license-requests';

describe('app routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
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
    ['/admin/products', Products, 'Products'],
    ['/admin/organizations', Organizations, 'Organizations'],
    ['/admin/licenses', Licenses, 'Licenses'],
    ['/admin/license-requests', LicenseRequests, 'License Requests'],
  ] as const)('renders %s with the matching component and breadcrumb', async (url, expectedComponent, breadcrumb) => {
    const harness = await RouterTestingHarness.create(url);
    const router = TestBed.inject(Router);

    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(expectedComponent);

    let route = router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    expect(route.snapshot.data['breadcrumb']).toBe(breadcrumb);
  });
});
