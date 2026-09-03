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

import { EnclavePageHeader } from '@enclave/core/components';
import { OrganizationModel, UserModel } from '@enclave/domain/models';
import { OrganizationService, UserService } from '@enclave/domain/services';

import { OrganizationList } from './organization-list';

const customUsers: UserModel[] = [
  {
    id: '1',
    firstName: 'ops',
    lastName: 'Northwind',
    email: 'ops@northwind.io',
    organizationId: '1',
    status: 'Active',
    role: 'Admin',
  },
  {
    id: '2',
    firstName: 'billing',
    lastName: 'Halcyon',
    email: 'billing@halcyon.dev',
    organizationId: '2',
    status: 'Active',
    role: 'Admin',
  },
  {
    id: '3',
    firstName: 'admin',
    lastName: 'Ridgeline',
    email: 'admin@ridgeline.co',
    organizationId: '3',
    status: 'Active',
    role: 'Admin',
  },
];

const customOrgs: OrganizationModel[] = [
  { id: '1', name: 'Alpha Org', status: 'Active', primaryUserId: '1' },
  { id: '2', name: 'Beta Org', status: 'Deactivated', primaryUserId: '2' },
  { id: '3', name: 'Gamma Org', status: 'Active', primaryUserId: '3' },
];

// Deliberately NOT alphabetical, so a click-to-sort test can distinguish "actually sorted"
// from "coincidentally already in order" -- see product-list.spec.ts for the same rationale.
const unsortedOrgs: OrganizationModel[] = [
  { id: '1', name: 'Zeta Org', status: 'Active', primaryUserId: '1' },
  { id: '2', name: 'Mu Org', status: 'Active', primaryUserId: '2' },
  { id: '3', name: 'Alpha Org', status: 'Active', primaryUserId: '3' },
];

function rowNames(fixture: ComponentFixture<OrganizationList>): (string | undefined)[] {
  // enclave-avatar renders its own internal fallback <span> -- select the name span by its
  // position right after the avatar, not by tag alone, or it'd pick up both.
  return Array.from(
    fixture.debugElement.nativeElement.querySelectorAll(
      'tr[mat-row] .org-name enclave-avatar + span',
    ),
  ).map((el) => (el as HTMLElement).textContent?.trim());
}

interface FixtureOptions {
  orgs?: OrganizationModel[];
  users?: UserModel[];
  queryParams?: Record<string, string>;
  router?: { navigate: ReturnType<typeof vi.fn> };
}

function createFixture(options: FixtureOptions = {}): ComponentFixture<OrganizationList> {
  const users = options.users ?? customUsers;

  TestBed.configureTestingModule({
    imports: [OrganizationList],
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
        provide: OrganizationService,
        useValue: { getOrganizations: () => options.orgs ?? customOrgs },
      },
      {
        provide: UserService,
        useValue: { getUserById: (id: string) => users.find((user) => user.id === id) },
      },
    ],
  });

  return TestBed.createComponent(OrganizationList);
}

describe('OrganizationList', () => {
  it('should create', async () => {
    const fixture = createFixture();
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the total organization count in the page header subtitle', async () => {
    const fixture = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const header = fixture.debugElement.query(By.directive(EnclavePageHeader))
      .componentInstance as EnclavePageHeader;
    expect(header.subTitle()).toBe('3 total');
  });

  it('renders a table row for every organization', async () => {
    const fixture = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows: NodeListOf<HTMLElement> =
      fixture.debugElement.nativeElement.querySelectorAll('tr[mat-row]');
    expect(rows).toHaveLength(3);
  });

  it("wires each row to navigate to that organization's details page", async () => {
    const fixture = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rowLinks = fixture.debugElement
      .queryAll(By.directive(RouterLink))
      .map((debugEl) => debugEl.injector.get(RouterLink).urlTree?.toString());

    expect(rowLinks).toEqual([
      '/admin/organizations/1',
      '/admin/organizations/2',
      '/admin/organizations/3',
    ]);
  });

  it("resolves and displays each organization's primary contact email", async () => {
    const fixture = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows: HTMLElement[] = Array.from(
      fixture.debugElement.nativeElement.querySelectorAll('tr[mat-row]'),
    );
    const alphaRow = rows.find((row) => row.textContent?.includes('Alpha Org'));

    expect(alphaRow?.querySelector('.org-primaryContact span')?.textContent?.trim()).toBe(
      'ops@northwind.io',
    );
  });

  it('marks a deactivated organization row so it can be styled distinctly', async () => {
    const fixture = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows: HTMLElement[] = Array.from(
      fixture.debugElement.nativeElement.querySelectorAll('tr[mat-row]'),
    );
    const betaRow = rows.find((row) => row.textContent?.includes('Beta Org'));
    const alphaRow = rows.find((row) => row.textContent?.includes('Alpha Org'));

    expect(betaRow?.classList.contains('deactivated')).toBe(true);
    expect(alphaRow?.classList.contains('deactivated')).toBe(false);
  });

  it('marks the name column as sorted ascending when its header is clicked', async () => {
    const fixture = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const nameHeader: HTMLElement =
      fixture.debugElement.nativeElement.querySelector('.mat-column-name');
    const nameSortHeader = fixture.debugElement.queryAll(By.directive(MatSortHeader))[0];
    nameSortHeader.triggerEventHandler('click', null);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
  });

  it('actually reorders the rows alphabetically by name when the header is clicked', async () => {
    // Regression test: aria-sort can flip to "ascending" while MatTableDataSource is a
    // completely different, unconnected instance -- see product-list.spec.ts.
    const fixture = createFixture({ orgs: unsortedOrgs });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(rowNames(fixture)).toEqual(['Zeta Org', 'Mu Org', 'Alpha Org']);

    const nameSortHeader = fixture.debugElement.queryAll(By.directive(MatSortHeader))[0];
    nameSortHeader.triggerEventHandler('click', null);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(rowNames(fixture)).toEqual(['Alpha Org', 'Mu Org', 'Zeta Org']);
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

describe('OrganizationList sort query param persistence', () => {
  // Malformed-param handling and debounce-collapsing are exhaustively covered at the
  // directive level (enclave-persistent-sort.spec.ts). These tests are deliberately kept
  // thin -- they exist only to prove the table's matSort/enclavePersistentSort wiring
  // (correct sortableColumns, real row reordering, reachable Router.navigate).

  it('restores ascending sort on the name column from the sort query param', async () => {
    const fixture = createFixture({ orgs: unsortedOrgs, queryParams: { sort: 'name:asc' } });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const nameHeader: HTMLElement =
      fixture.debugElement.nativeElement.querySelector('.mat-column-name');
    expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
    expect(rowNames(fixture)).toEqual(['Alpha Org', 'Mu Org', 'Zeta Org']);
  });

  it('navigates with the sort query param set once the debounce elapses after a header click', () => {
    vi.useFakeTimers();
    const navigate = vi.fn().mockResolvedValue(true);
    const fixture = createFixture({ router: { navigate } });
    fixture.detectChanges();

    const nameSortHeader = fixture.debugElement.queryAll(By.directive(MatSortHeader))[0];
    nameSortHeader.triggerEventHandler('click', null);

    vi.advanceTimersByTime(400);

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { sort: 'name:asc' },
      queryParamsHandling: 'merge',
    });

    vi.useRealTimers();
  });
});
