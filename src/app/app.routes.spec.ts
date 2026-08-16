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
    ['/admin/dashboard', Dashboard],
    ['/admin/products', Products],
    ['/admin/organizations', Organizations],
    ['/admin/licenses', Licenses],
    ['/admin/license-requests', LicenseRequests],
  ] as const)('renders %s with the matching component', async (url, expectedComponent) => {
    const harness = await RouterTestingHarness.create(url);

    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(expectedComponent);
  });
});
