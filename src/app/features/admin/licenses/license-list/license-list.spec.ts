import { OverlayContainer } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSortHeader } from '@angular/material/sort';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  Router,
  RouterLink,
} from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { EnclavePageHeader, EnclaveStatus, EnclaveTimeLeft } from '@enclave/core/components';
import { LicenseModel, OrganizationModel, ProductModel } from '@enclave/domain/models';
import { LicenseService, OrganizationService, ProductService } from '@enclave/domain/services';

import { LicenseList } from './license-list';

const customOrgs: OrganizationModel[] = [
  { id: '1', name: 'Alpha Org', status: 'Active', primaryUserId: '1' },
  { id: '2', name: 'Beta Org', status: 'Active', primaryUserId: '2' },
  { id: '3', name: 'Gamma Org', status: 'Active', primaryUserId: '3' },
];

const customProducts: ProductModel[] = [
  { id: '1', name: 'Core', status: 'Active', description: '' },
  { id: '2', name: 'Analytics', status: 'Active', description: '' },
];

const customLicenses: LicenseModel[] = [
  {
    id: '1',
    orgId: '1',
    productId: '1',
    start: new Date('2025-01-01T00:00:00Z'),
    end: new Date('2026-06-01T00:00:00Z'),
    status: 'Active',
  },
  {
    id: '2',
    orgId: '2',
    productId: '2',
    start: new Date('2024-01-01T00:00:00Z'),
    end: new Date('2025-01-01T00:00:00Z'),
    status: 'Expired',
  },
  {
    id: '3',
    orgId: '3',
    productId: '1',
    start: new Date('2026-06-01T00:00:00Z'),
    end: new Date('2027-06-01T00:00:00Z'),
    status: 'Scheduled',
  },
];

// Deliberately NOT alphabetical, so a click-to-sort test can distinguish "actually sorted"
// from "coincidentally already in order" -- see organization-list.spec.ts for the same rationale.
const unsortedOrgs: OrganizationModel[] = [
  { id: '1', name: 'Zeta Org', status: 'Active', primaryUserId: '1' },
  { id: '2', name: 'Mu Org', status: 'Active', primaryUserId: '2' },
  { id: '3', name: 'Alpha Org', status: 'Active', primaryUserId: '3' },
];

const unsortedOrgLicenses: LicenseModel[] = [
  {
    id: '1',
    orgId: '1',
    productId: '1',
    start: new Date('2025-01-01T00:00:00Z'),
    end: new Date('2026-06-01T00:00:00Z'),
    status: 'Active',
  },
  {
    id: '2',
    orgId: '2',
    productId: '1',
    start: new Date('2025-01-01T00:00:00Z'),
    end: new Date('2026-06-01T00:00:00Z'),
    status: 'Active',
  },
  {
    id: '3',
    orgId: '3',
    productId: '1',
    start: new Date('2025-01-01T00:00:00Z'),
    end: new Date('2026-06-01T00:00:00Z'),
    status: 'Active',
  },
];

// Two visible expiry dates (Active/Expired) plus one hidden one (Scheduled), to check that
// sorting by "Expiry Date" both orders the visible dates and pushes the hidden one out of the way.
const endSortOrgs: OrganizationModel[] = [
  { id: '1', name: 'Org A', status: 'Active', primaryUserId: '1' },
  { id: '2', name: 'Org B', status: 'Active', primaryUserId: '2' },
  { id: '3', name: 'Org C', status: 'Active', primaryUserId: '3' },
];

const endSortLicenses: LicenseModel[] = [
  {
    id: '1',
    orgId: '1',
    productId: '1',
    start: new Date('2025-01-01T00:00:00Z'),
    end: new Date('2026-03-01T00:00:00Z'),
    status: 'Active',
  },
  {
    id: '2',
    orgId: '2',
    productId: '1',
    start: new Date('2024-01-01T00:00:00Z'),
    end: new Date('2026-01-01T00:00:00Z'),
    status: 'Expired',
  },
  {
    id: '3',
    orgId: '3',
    productId: '1',
    start: new Date('2025-01-01T00:00:00Z'),
    end: new Date('2025-06-01T00:00:00Z'),
    status: 'Scheduled',
  },
];

function organizationNames(fixture: ComponentFixture<LicenseList>): (string | undefined)[] {
  // enclave-avatar renders its own internal fallback <span> -- select the name span by its
  // position right after the avatar (now inside the routerLink <a>), not by tag alone, or
  // it'd pick up both.
  return Array.from(
    fixture.debugElement.nativeElement.querySelectorAll(
      'tr[mat-row] .org-name enclave-avatar + a span',
    ),
  ).map((el) => (el as HTMLElement).textContent?.trim());
}

interface FixtureOptions {
  licenses?: LicenseModel[];
  orgs?: OrganizationModel[];
  products?: ProductModel[];
  queryParams?: Record<string, string>;
  router?: { navigate: ReturnType<typeof vi.fn> };
}

function createFixture(options: FixtureOptions = {}): ComponentFixture<LicenseList> {
  const orgs = options.orgs ?? customOrgs;
  const products = options.products ?? customProducts;

  TestBed.configureTestingModule({
    imports: [LicenseList],
    providers: [
      options.router ? { provide: Router, useValue: options.router } : provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { queryParamMap: convertToParamMap(options.queryParams ?? {}) },
          // EnclaveSearchBarFilter, nested in the template, subscribes to this stream directly.
          queryParamMap: of(convertToParamMap({})),
        },
      },
      {
        provide: LicenseService,
        useValue: { getLicenses: () => options.licenses ?? customLicenses },
      },
      {
        provide: OrganizationService,
        useValue: { getOrganizationById: (id: string) => orgs.find((org) => org.id === id) },
      },
      {
        provide: ProductService,
        useValue: {
          getProductById: (id: string) => products.find((product) => product.id === id),
        },
      },
    ],
  });

  return TestBed.createComponent(LicenseList);
}

describe('LicenseList', () => {
  it('should create', async () => {
    const fixture = createFixture();
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the active license count in the page header subtitle', async () => {
    const fixture = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const header = fixture.debugElement.query(By.directive(EnclavePageHeader))
      .componentInstance as EnclavePageHeader;
    expect(header.subTitle()).toBe('1 active');
  });

  it('renders a table row for every license', async () => {
    const fixture = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows: NodeListOf<HTMLElement> =
      fixture.debugElement.nativeElement.querySelectorAll('tr[mat-row]');
    expect(rows).toHaveLength(3);
  });

  it("resolves and displays each license's organization and product names", async () => {
    const fixture = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(organizationNames(fixture)).toEqual(['Alpha Org', 'Beta Org', 'Gamma Org']);

    const productNames = Array.from(
      fixture.debugElement.nativeElement.querySelectorAll(
        'tr[mat-row] .product-name enclave-avatar + a span',
      ),
    ).map((el) => (el as HTMLElement).textContent?.trim());
    expect(productNames).toEqual(['Core', 'Analytics', 'Core']);
  });

  it("wires each row's organization and product names to their detail pages", async () => {
    const fixture = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const links = fixture.debugElement
      .queryAll(By.directive(RouterLink))
      .map((debugEl) => debugEl.injector.get(RouterLink).urlTree?.toString());

    expect(links).toEqual([
      '/admin/organizations/1',
      '/admin/products/1',
      '/admin/organizations/2',
      '/admin/products/2',
      '/admin/organizations/3',
      '/admin/products/1',
    ]);
  });

  it("wires the row's Details menu item to that license's own details page", async () => {
    const fixture = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const overlayContainer = TestBed.inject(OverlayContainer);
    const trigger: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector(
      'button[aria-label="Alpha Org_Core actions"]',
    );
    trigger.click();
    fixture.detectChanges();

    const links = fixture.debugElement
      .queryAll(By.directive(RouterLink))
      .map((debugEl) => debugEl.injector.get(RouterLink).urlTree?.toString());
    expect(links).toContain('/admin/licenses/1');

    overlayContainer.ngOnDestroy();
  });

  it('shows each license status via enclave-status', async () => {
    const fixture = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const statuses = fixture.debugElement
      .queryAll(By.directive(EnclaveStatus))
      .map((debugEl) => (debugEl.componentInstance as EnclaveStatus).status());
    expect(statuses).toEqual(['Active', 'Expired', 'Scheduled']);
  });

  it('shows the expiry date only for Active and Expired licenses', async () => {
    const fixture = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const expiryCells: HTMLElement[] = Array.from(
      fixture.debugElement.nativeElement.querySelectorAll('.license-expiry-date'),
    );
    expect(expiryCells[0].textContent?.trim()).toBe('1 Jun 2026');
    expect(expiryCells[1].textContent?.trim()).toBe('1 Jan 2025');
    expect(expiryCells[2].textContent?.trim()).toBe('-');
  });

  it('shows the time-left widget only for Active licenses, bound to the real dates', async () => {
    const fixture = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const timeLeftWidgets = fixture.debugElement.queryAll(By.directive(EnclaveTimeLeft));
    expect(timeLeftWidgets).toHaveLength(1);
    expect((timeLeftWidgets[0].componentInstance as EnclaveTimeLeft).startDate()).toEqual(
      customLicenses[0].start,
    );
    expect((timeLeftWidgets[0].componentInstance as EnclaveTimeLeft).endDate()).toEqual(
      customLicenses[0].end,
    );

    const timeLeftCells: HTMLElement[] = Array.from(
      fixture.debugElement.nativeElement.querySelectorAll('.license-time-left'),
    );
    expect(timeLeftCells[1].textContent?.trim()).toBe('-');
    expect(timeLeftCells[2].textContent?.trim()).toBe('-');
  });

  it('marks the organization column as sorted ascending when its header is clicked', async () => {
    const fixture = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const orgHeader: HTMLElement = fixture.debugElement.nativeElement.querySelector(
      '.mat-column-organization',
    );
    const orgSortHeader = fixture.debugElement.queryAll(By.directive(MatSortHeader))[0];
    orgSortHeader.triggerEventHandler('click', null);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(orgHeader.getAttribute('aria-sort')).toBe('ascending');
  });

  it('actually reorders the rows alphabetically by organization when the header is clicked', async () => {
    // Regression test: aria-sort can flip to "ascending" while MatTableDataSource is a
    // completely different, unconnected instance -- see organization-list.spec.ts.
    const fixture = createFixture({ orgs: unsortedOrgs, licenses: unsortedOrgLicenses });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(organizationNames(fixture)).toEqual(['Zeta Org', 'Mu Org', 'Alpha Org']);

    const orgSortHeader = fixture.debugElement.queryAll(By.directive(MatSortHeader))[0];
    orgSortHeader.triggerEventHandler('click', null);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(organizationNames(fixture)).toEqual(['Alpha Org', 'Mu Org', 'Zeta Org']);
  });

  it('sorts ascending by expiry date and pushes licenses with no visible date to the end', async () => {
    const fixture = createFixture({ orgs: endSortOrgs, licenses: endSortLicenses });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // organization(0), product(1), status(2), end(3), timeLeft(4)
    const endSortHeader = fixture.debugElement.queryAll(By.directive(MatSortHeader))[3];
    endSortHeader.triggerEventHandler('click', null);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(organizationNames(fixture)).toEqual(['Org B', 'Org A', 'Org C']);
  });

  it('filters rows to those matching the search term', async () => {
    const fixture = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const searchInput: HTMLInputElement =
      fixture.debugElement.nativeElement.querySelector('input[matInput]');
    searchInput.value = 'gamma org';
    searchInput.dispatchEvent(new Event('keyup'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows: HTMLElement[] = Array.from(
      fixture.debugElement.nativeElement.querySelectorAll('tr[mat-row]'),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain('Gamma Org');
  });
});

describe('LicenseList sort query param persistence', () => {
  // Malformed-param handling and debounce-collapsing are exhaustively covered at the
  // directive level (enclave-persistent-sort.spec.ts). These tests are deliberately kept
  // thin -- they exist only to prove the table's matSort/enclavePersistentSort wiring
  // (correct sortableColumns, real row reordering, reachable Router.navigate).

  it('restores ascending sort on the organization column from the sort query param', async () => {
    const fixture = createFixture({
      orgs: unsortedOrgs,
      licenses: unsortedOrgLicenses,
      queryParams: { sort: 'organization:asc' },
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const orgHeader: HTMLElement = fixture.debugElement.nativeElement.querySelector(
      '.mat-column-organization',
    );
    expect(orgHeader.getAttribute('aria-sort')).toBe('ascending');
    expect(organizationNames(fixture)).toEqual(['Alpha Org', 'Mu Org', 'Zeta Org']);
  });

  it('navigates with the sort query param set once the debounce elapses after a header click', () => {
    vi.useFakeTimers();
    const navigate = vi.fn().mockResolvedValue(true);
    const fixture = createFixture({ router: { navigate } });
    fixture.detectChanges();

    const orgSortHeader = fixture.debugElement.queryAll(By.directive(MatSortHeader))[0];
    orgSortHeader.triggerEventHandler('click', null);

    vi.advanceTimersByTime(400);

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { sort: 'organization:asc' },
      queryParamsHandling: 'merge',
    });

    vi.useRealTimers();
  });
});
