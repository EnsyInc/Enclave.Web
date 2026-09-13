import { OverlayContainer } from '@angular/cdk/overlay';
import { ANIMATION_MODULE_TYPE } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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

import {
  LicenseModel,
  LicenseRequestModel,
  OrganizationModel,
  ProductModel,
  UserModel,
} from '@enclave/domain/models';
import {
  LicenseRequestService,
  LicenseService,
  OrganizationService,
  ProductService,
  UserService,
} from '@enclave/domain/services';

import { OrganizationDetails } from './organization-details';

const organization: OrganizationModel = {
  id: '1',
  name: 'Northwind Systems',
  status: 'Active',
  primaryUserId: '1',
};

const primaryUser: UserModel = {
  id: '1',
  firstName: 'ops',
  lastName: 'Northwind',
  email: 'ops@northwind.io',
  organizationId: '1',
  status: 'Active',
  role: 'Admin',
};

const product: ProductModel = {
  id: 'p1',
  name: 'Enclave Core',
  status: 'Active',
};

interface FixtureOptions {
  licenses?: LicenseModel[];
  users?: UserModel[];
  licenseRequests?: LicenseRequestModel[];
  router?: { navigate: ReturnType<typeof vi.fn> };
}

function createFixture(options: FixtureOptions = {}): {
  fixture: ComponentFixture<OrganizationDetails>;
  component: OrganizationDetails;
} {
  const licenses = options.licenses ?? [];
  const users = options.users ?? [];
  const licenseRequests = options.licenseRequests ?? [];

  TestBed.configureTestingModule({
    imports: [OrganizationDetails],
    providers: [
      // Without this, tab-body centering relies on a 100ms fallback timer instead of settling synchronously.
      { provide: ANIMATION_MODULE_TYPE, useValue: 'NoopAnimations' },
      { provide: OrganizationService, useValue: { getOrganizationById: () => organization } },
      {
        provide: UserService,
        useValue: {
          getUserById: () => primaryUser,
          getUsersForOrg: (orgId: string) => users.filter((user) => user.organizationId === orgId),
        },
      },
      {
        provide: LicenseService,
        useValue: {
          getLicensesForOrg: (orgId: string) =>
            licenses.filter((license) => license.orgId === orgId),
        },
      },
      {
        provide: LicenseRequestService,
        useValue: {
          getPendingLicenseRequestForOrgProduct: (orgId: string, productId: string) =>
            licenseRequests.find(
              (request) =>
                request.orgId === orgId &&
                request.productId === productId &&
                request.status === 'Pending',
            ),
        },
      },
      { provide: ProductService, useValue: { getProductById: () => product } },
      // Only stubbed with a fake `navigate` when a test needs to assert on it (persistent-tab
      // wiring below) -- otherwise a real router lets RouterLink resolve a genuine urlTree.
      options.router ? { provide: Router, useValue: options.router } : provideRouter([]),
      {
        // enclavePersistentTab, wired to the Info tab in the template, injects this itself.
        provide: ActivatedRoute,
        useValue: {
          snapshot: { queryParamMap: convertToParamMap({}) },
          queryParamMap: of(convertToParamMap({})),
        },
      },
    ],
  });

  const fixture = TestBed.createComponent(OrganizationDetails);
  fixture.componentRef.setInput('organizationId', '1');

  return { fixture, component: fixture.componentInstance };
}

// MatTabGroup flips the clicked tab's `isActive` (which lazily attaches its content portal)
// inside a `Promise.resolve().then(...)` in its own ngAfterContentChecked, so the content only
// renders after that microtask drains and a further change-detection pass runs.
async function selectLicensesTab(fixture: ComponentFixture<OrganizationDetails>): Promise<void> {
  const tabLabels: HTMLElement[] =
    fixture.debugElement.nativeElement.querySelectorAll('[role="tab"]');
  tabLabels[1].click();
  fixture.detectChanges();
  await Promise.resolve();
  fixture.detectChanges();
}

async function selectUsersTab(fixture: ComponentFixture<OrganizationDetails>): Promise<void> {
  const tabLabels: HTMLElement[] =
    fixture.debugElement.nativeElement.querySelectorAll('[role="tab"]');
  tabLabels[2].click();
  fixture.detectChanges();
  await Promise.resolve();
  fixture.detectChanges();
}

describe('OrganizationDetails', () => {
  it('should create', async () => {
    const { fixture, component } = createFixture();
    await fixture.whenStable();

    expect(component).toBeTruthy();
  });

  it('resolves the organization for the bound organizationId', async () => {
    const { fixture, component } = createFixture();
    await fixture.whenStable();

    expect(component['org']()).toEqual(organization);
  });

  it('resolves the primary contact for the resolved organization', async () => {
    const { fixture, component } = createFixture();
    await fixture.whenStable();

    expect(component['primaryContact']()).toEqual(primaryUser);
  });

  it('renders the organization name and status from the resolved organization', async () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();

    const nameEl: HTMLElement = fixture.debugElement.nativeElement.querySelector('.title');
    expect(nameEl.textContent?.trim()).toBe('Northwind Systems');
  });

  it("renders the primary contact's email", async () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();

    const infoEl: HTMLElement = fixture.debugElement.nativeElement.querySelector('.subtitle');
    expect(infoEl.textContent).toContain('ops@northwind.io');
  });

  it('renders the Info tab fields for the resolved organization', async () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();

    const rows: NodeListOf<HTMLElement> =
      fixture.debugElement.nativeElement.querySelectorAll('enclave-detail-row');
    const rowText = (label: string) =>
      Array.from(rows)
        .find((row) => row.textContent?.includes(label))
        ?.querySelector('.info-value')
        ?.textContent?.trim();

    expect(rowText('Name')).toBe('Northwind Systems');
    expect(rowText('Primary Contact Email')).toBe('ops@northwind.io');
    expect(rowText('Id')).toBe('1');
  });

  // Full restore/self-heal/debounce coverage lives at the directive level
  // (enclave-persistent-tab.spec.ts) -- this just proves the Info tab is actually wired up with
  // enclavePersistentTab and a reachable Router.navigate.
  it('populates the URL with the Info tab once mounted', async () => {
    const navigate = vi.fn().mockResolvedValue(true);
    const { fixture } = createFixture({ router: { navigate } });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { tab: 'info' },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  });

  describe('Licenses tab', () => {
    const licenses: LicenseModel[] = [
      {
        id: 'l1',
        orgId: '1',
        productId: 'p1',
        start: new Date('2024-01-01T00:00:00Z'),
        end: new Date('2099-01-01T00:00:00Z'),
        status: 'Active',
      },
    ];

    it('shows the license count badge on the tab label', async () => {
      const { fixture } = createFixture({ licenses });
      fixture.detectChanges();
      await fixture.whenStable();

      const badge: HTMLElement = fixture.debugElement.nativeElement.querySelector('.license-count');
      expect(badge.textContent?.trim()).toBe('1');
    });

    it('hides the license count badge when the org has no licenses', async () => {
      const { fixture } = createFixture({ licenses: [] });
      fixture.detectChanges();
      await fixture.whenStable();

      const badge: HTMLElement | null =
        fixture.debugElement.nativeElement.querySelector('.license-count');
      expect(badge).toBeNull();
    });

    it('maps each license row to its product name via the productId', async () => {
      const { fixture } = createFixture({ licenses });
      fixture.detectChanges();
      await fixture.whenStable();
      await selectLicensesTab(fixture);

      const rows: NodeListOf<HTMLElement> =
        fixture.debugElement.nativeElement.querySelectorAll('.licenses-table tr');
      expect(rows[1].textContent).toContain('Enclave Core');
    });

    it('shows the empty state row when the org has no licenses', async () => {
      const { fixture } = createFixture({ licenses: [] });
      fixture.detectChanges();
      await fixture.whenStable();
      await selectLicensesTab(fixture);

      const rows: NodeListOf<HTMLElement> =
        fixture.debugElement.nativeElement.querySelectorAll('.licenses-table tr');
      expect(rows[1].textContent).toContain('No licenses yet');
    });

    it("wires the row's Details menu item to that license's own details page", async () => {
      const { fixture } = createFixture({ licenses });
      fixture.detectChanges();
      await fixture.whenStable();
      await selectLicensesTab(fixture);

      const overlayContainer = TestBed.inject(OverlayContainer);
      const trigger: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector(
        'button[aria-label="Enclave Core actions"]',
      );
      trigger.click();
      fixture.detectChanges();

      const links = fixture.debugElement
        .queryAll(By.directive(RouterLink))
        .map((debugEl) => debugEl.injector.get(RouterLink).urlTree?.toString());
      expect(links).toContain('/admin/licenses/l1');

      overlayContainer.ngOnDestroy();
    });

    describe('pending renewal request indicator', () => {
      const pendingRequest: LicenseRequestModel = {
        id: 'req1',
        orgId: '1',
        productId: 'p1',
        userId: 'u1',
        existingLicenseId: 'l1',
        status: 'Pending',
      };

      it('shows a badge on the product link when there is a Pending request for that product', async () => {
        const { fixture } = createFixture({ licenses, licenseRequests: [pendingRequest] });
        fixture.detectChanges();
        await fixture.whenStable();
        await selectLicensesTab(fixture);

        const badge: HTMLElement | null =
          fixture.debugElement.nativeElement.querySelector('.mat-badge-content');
        expect(badge?.textContent?.trim()).toBe('*');
      });

      it('hides the badge when there is no Pending request for that product', async () => {
        const { fixture } = createFixture({ licenses, licenseRequests: [] });
        fixture.detectChanges();
        await fixture.whenStable();
        await selectLicensesTab(fixture);

        expect(fixture.debugElement.nativeElement.querySelector('.mat-badge-content')).toBeNull();
      });

      it('hides the badge when the only matching request is not Pending', async () => {
        const { fixture } = createFixture({
          licenses,
          licenseRequests: [{ ...pendingRequest, status: 'Approved' }],
        });
        fixture.detectChanges();
        await fixture.whenStable();
        await selectLicensesTab(fixture);

        expect(fixture.debugElement.nativeElement.querySelector('.mat-badge-content')).toBeNull();
      });

      it("wires the row's View License Request menu item to that request", async () => {
        const { fixture } = createFixture({ licenses, licenseRequests: [pendingRequest] });
        fixture.detectChanges();
        await fixture.whenStable();
        await selectLicensesTab(fixture);

        const overlayContainer = TestBed.inject(OverlayContainer);
        const trigger: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector(
          'button[aria-label="Enclave Core actions"]',
        );
        trigger.click();
        fixture.detectChanges();

        const links = fixture.debugElement
          .queryAll(By.directive(RouterLink))
          .map((debugEl) => debugEl.injector.get(RouterLink).urlTree?.toString());
        expect(links).toContain('/admin/license-requests/req1');

        overlayContainer.ngOnDestroy();
      });

      it('omits the View License Request menu item when there is no Pending request', async () => {
        const { fixture } = createFixture({ licenses, licenseRequests: [] });
        fixture.detectChanges();
        await fixture.whenStable();
        await selectLicensesTab(fixture);

        const overlayContainer = TestBed.inject(OverlayContainer);
        const trigger: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector(
          'button[aria-label="Enclave Core actions"]',
        );
        trigger.click();
        fixture.detectChanges();

        const panel = overlayContainer.getContainerElement().querySelector('.mat-mdc-menu-panel');
        expect(panel?.textContent).not.toContain('View License Request');

        overlayContainer.ngOnDestroy();
      });
    });
  });

  describe('Users tab', () => {
    const users: UserModel[] = [
      {
        id: '2',
        firstName: 'Jamie',
        lastName: 'Doe',
        email: 'jamie.doe@northwind.io',
        organizationId: '1',
        status: 'Active',
        role: 'Reader',
      },
    ];

    it('shows the user count badge on the tab label', async () => {
      const { fixture } = createFixture({ users });
      fixture.detectChanges();
      await fixture.whenStable();

      const badge: HTMLElement = fixture.debugElement.nativeElement.querySelector('.user-count');
      expect(badge.textContent?.trim()).toBe('1');
    });

    it('hides the user count badge when the org has no users', async () => {
      const { fixture } = createFixture({ users: [] });
      fixture.detectChanges();
      await fixture.whenStable();

      const badge: HTMLElement | null =
        fixture.debugElement.nativeElement.querySelector('.user-count');
      expect(badge).toBeNull();
    });

    it('maps each user row to their full name from firstName and lastName', async () => {
      const { fixture } = createFixture({ users });
      fixture.detectChanges();
      await fixture.whenStable();
      await selectUsersTab(fixture);

      const rows: NodeListOf<HTMLElement> =
        fixture.debugElement.nativeElement.querySelectorAll('.users-table tr');
      expect(rows[1].textContent).toContain('Jamie Doe');
    });

    it('shows the empty state row when the org has no users', async () => {
      const { fixture } = createFixture({ users: [] });
      fixture.detectChanges();
      await fixture.whenStable();
      await selectUsersTab(fixture);

      const rows: NodeListOf<HTMLElement> =
        fixture.debugElement.nativeElement.querySelectorAll('.users-table tr');
      expect(rows[1].textContent).toContain('No users yet');
    });
  });
});
