import { TestBed } from '@angular/core/testing';
import { By, Title } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from './app.routes';
import { AppShell } from './core/layout/app-shell/app-shell';
import { EnclaveTitleStrategy } from './core/routing/enclave-title-strategy';
import { ErrorPage } from './features';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { LicenseRequestList } from './features/admin/license-requests/license-request-list/license-request-list';
import { LicenseList } from './features/admin/licenses/license-list/license-list';
import { OrganizationList } from './features/admin/organizations/organization-list/organization-list';
import { ProductList, ProductDetails } from './features/admin/products';

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

describe('app routes', () => {
  beforeEach(() => {
    // Admin routes now activate AppShell, which reads localStorage for its collapse state and
    // observes Breakpoints.Handset -- the latter needs the legacy addListener/removeListener
    // pair, not just `matches`. See the testing gotchas in CLAUDE.md.
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

    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: TitleStrategy, useClass: EnclaveTitleStrategy },
      ],
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('redirects the empty path to /admin/dashboard', async () => {
    const harness = await RouterTestingHarness.create('');
    const router = TestBed.inject(Router);

    expect(router.url).toBe('/admin/dashboard');
    // /admin activates AppShell, so the harness's own outlet reports the shell -- the page
    // component renders one level deeper, into the shell's outlet.
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(AppShell);
    expect(harness.fixture.debugElement.query(By.directive(Dashboard))).toBeTruthy();
  });

  it.each([
    ['/admin/dashboard', Dashboard, 'Dashboard'],
    ['/admin/products', ProductList, 'Products'],
    ['/admin/organizations', OrganizationList, 'Organizations'],
    ['/admin/licenses', LicenseList, 'Licenses'],
    ['/admin/license-requests', LicenseRequestList, 'License Requests'],
  ] as const)(
    'renders %s with the matching component and breadcrumb',
    async (url, expectedComponent, breadcrumb) => {
      const harness = await RouterTestingHarness.create(url);
      const router = TestBed.inject(Router);

      expect(harness.fixture.debugElement.query(By.directive(expectedComponent))).toBeTruthy();

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

      const component = harness.fixture.debugElement.query(By.directive(ProductDetails))
        ?.componentInstance as ProductDetails | undefined;
      expect(component).toBeInstanceOf(ProductDetails);
      expect(component?.['productId']()).toBe('1');

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
      expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(ErrorPage);
    });
  });

  describe('full-page error states', () => {
    // Asserts what the page *renders*, not that `data.reason` echoes back through the input.
    // An echo test passes whatever string the route carries, so it stays green even when the
    // route's vocabulary and the component's REASONS union have drifted apart -- exactly the
    // case where ErrorPage silently falls back to its default copy.
    it.each([
      ['/not-found', '404', 'Page not found', 'Page not found | Enclave'],
      ['/forbidden', '403', 'Access denied', 'Forbidden | Enclave'],
    ] as const)('renders %s as a %s page', async (url, statusCode, heading, title) => {
      const harness = await RouterTestingHarness.create(url);
      const page = harness.routeNativeElement;

      expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(ErrorPage);
      expect(page?.querySelector('.status-code')?.textContent?.trim()).toBe(statusCode);
      expect(page?.querySelector('h1')?.textContent?.trim()).toBe(heading);
      expect(TestBed.inject(Title).getTitle()).toBe(title);
    });

    it('renders chromeless, outside the app shell', async () => {
      const harness = await RouterTestingHarness.create('/not-found');

      expect(harness.fixture.debugElement.query(By.directive(AppShell))).toBeNull();
    });

    it('spells out reason on /not-found rather than leaning on the input default', () => {
      // withComponentInputBinding()'s default unmatchedInputBehavior is 'alwaysUndefined': it
      // calls setInput(name, undefined) for every declared input a route omits, which *wins*
      // over an input()'s own default. Drop `data.reason` here and reason() becomes undefined,
      // not the declared default -- so the route data has to state it explicitly.
      const notFound = routes.find((route) => route.path === 'not-found');

      expect(notFound?.data?.['reason']).toBe('NotFound');
    });
  });

  it('redirects any unmatched path to /not-found', async () => {
    const harness = await RouterTestingHarness.create('/this/does/not/exist');
    const router = TestBed.inject(Router);

    expect(router.url).toBe('/not-found');
    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(ErrorPage);
  });
});
