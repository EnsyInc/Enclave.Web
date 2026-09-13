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
  LicenseStatus,
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

import { LicenseDetails } from './license-details';

const product: ProductModel = {
  id: '1',
  name: 'Enclave Core',
  status: 'Active',
};

const organization: OrganizationModel = {
  id: '1',
  name: 'Northwind Systems',
  status: 'Active',
  primaryUserId: '1',
};

const requester: UserModel = {
  id: '7',
  firstName: 'Priya',
  lastName: 'Shah',
  email: 'priya.shah@northwind.io',
  organizationId: '1',
  status: 'Active',
  role: 'Admin',
};

function licenseWithStatus(status: LicenseStatus): LicenseModel {
  return {
    id: '1',
    orgId: '1',
    productId: '1',
    start: new Date('2024-01-01T00:00:00Z'),
    end: new Date('2025-06-15T00:00:00Z'),
    status,
  };
}

function pendingRequest(overrides: Partial<LicenseRequestModel> = {}): LicenseRequestModel {
  return {
    id: 'r1',
    orgId: '1',
    productId: '1',
    userId: '7',
    existingLicenseId: '1',
    status: 'Pending',
    ...overrides,
  };
}

interface FixtureOptions {
  status?: LicenseStatus;
  licenseRequests?: LicenseRequestModel[];
  users?: UserModel[];
  router?: { navigate: ReturnType<typeof vi.fn> };
}

function createFixture(options: FixtureOptions = {}): {
  fixture: ComponentFixture<LicenseDetails>;
  component: LicenseDetails;
} {
  const status = options.status ?? 'Scheduled';
  const licenseRequests = options.licenseRequests ?? [];
  const users = options.users ?? [];

  TestBed.configureTestingModule({
    imports: [LicenseDetails],
    providers: [
      { provide: LicenseService, useValue: { getLicenseById: () => licenseWithStatus(status) } },
      { provide: ProductService, useValue: { getProductById: () => product } },
      { provide: OrganizationService, useValue: { getOrganizationById: () => organization } },
      {
        provide: LicenseRequestService,
        useValue: {
          getLicenseRequestsForLicense: (licenseId: string) =>
            licenseRequests.filter((request) => request.existingLicenseId === licenseId),
        },
      },
      {
        provide: UserService,
        useValue: { getUserById: (id: string) => users.find((user) => user.id === id) },
      },
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

  const fixture = TestBed.createComponent(LicenseDetails);
  fixture.componentRef.setInput('licenseId', '1');

  return { fixture, component: fixture.componentInstance };
}

describe('LicenseDetails', () => {
  it('should create', async () => {
    const { fixture, component } = createFixture();
    await fixture.whenStable();

    expect(component).toBeTruthy();
  });

  it('resolves the license, product, and organization for the bound licenseId', async () => {
    const { fixture, component } = createFixture();
    await fixture.whenStable();

    expect(component['license']()).toEqual(licenseWithStatus('Scheduled'));
    expect(component['product']()).toEqual(product);
    expect(component['org']()).toEqual(organization);
  });

  it('renders the composed product/organization title from the resolved license', async () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();

    const titleEl: HTMLElement = fixture.debugElement.nativeElement.querySelector('.title');
    expect(titleEl.textContent?.trim()).toBe('Enclave Core - Northwind Systems');
  });

  it('renders the Info tab fields for the resolved license', async () => {
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

    expect(rowText('Product')).toBe('Enclave Core');
    expect(rowText('Organization')).toBe('Northwind Systems');
    expect(rowText('Start Date')).toBe('1 Jan 2024');
    expect(rowText('Expiry Date')).toBe('15 Jun 2025');
    expect(rowText('Status')).toBe('Scheduled');
    expect(rowText('Id')).toBe('1');
  });

  it('renders the Suspend and Revoke action buttons', async () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();

    const buttons: HTMLElement[] = Array.from(
      fixture.debugElement.nativeElement.querySelectorAll('.action-button'),
    );
    expect(buttons.map((button) => button.textContent?.trim())).toEqual(['Suspend', 'Revoke']);
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

  describe('time left indicator', () => {
    it('is hidden when the license is not Active', async () => {
      const { fixture } = createFixture({ status: 'Scheduled' });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.debugElement.nativeElement.querySelector('enclave-time-left')).toBeNull();
    });

    it('is shown when the license is Active', async () => {
      const { fixture } = createFixture({ status: 'Active' });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.debugElement.nativeElement.querySelector('enclave-time-left')).not.toBeNull();
    });
  });

  describe('renewal request banner', () => {
    it('is hidden when there is no license request for this license', async () => {
      const { fixture } = createFixture({ licenseRequests: [], users: [requester] });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(
        fixture.debugElement.nativeElement.querySelector('.license-request-container'),
      ).toBeNull();
    });

    it('is hidden when the only requests for this license are not Pending', async () => {
      const { fixture } = createFixture({
        licenseRequests: [pendingRequest({ status: 'Approved' })],
        users: [requester],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(
        fixture.debugElement.nativeElement.querySelector('.license-request-container'),
      ).toBeNull();
    });

    it('is hidden when the requesting user cannot be resolved', async () => {
      const { fixture } = createFixture({ licenseRequests: [pendingRequest()], users: [] });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(
        fixture.debugElement.nativeElement.querySelector('.license-request-container'),
      ).toBeNull();
    });

    it("shows the requester's email and notes when a Pending request exists", async () => {
      const { fixture } = createFixture({
        licenseRequests: [pendingRequest({ requestNotes: 'Renewing before end of quarter.' })],
        users: [requester],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const banner: HTMLElement = fixture.debugElement.nativeElement.querySelector(
        '.license-request-container',
      );
      expect(banner).not.toBeNull();
      expect(banner.querySelector('.predefined-text')?.textContent).toContain(
        'priya.shah@northwind.io',
      );
      expect(banner.querySelector('.user-notes')?.textContent).toContain(
        'Renewing before end of quarter.',
      );
    });

    it('omits the notes line when the request has no requestNotes', async () => {
      const { fixture } = createFixture({
        licenseRequests: [pendingRequest({ requestNotes: undefined })],
        users: [requester],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const banner: HTMLElement = fixture.debugElement.nativeElement.querySelector(
        '.license-request-container',
      );
      expect(banner.querySelector('.user-notes')).toBeNull();
    });

    it('links the review-request button to the pending request in the license-requests view', async () => {
      const { fixture } = createFixture({
        licenseRequests: [pendingRequest({ id: 'r9' })],
        users: [requester],
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const links = fixture.debugElement
        .queryAll(By.directive(RouterLink))
        .map((debugEl) => debugEl.injector.get(RouterLink).urlTree?.toString());

      expect(links).toContain('/admin/license-requests/r9');
    });
  });
});
