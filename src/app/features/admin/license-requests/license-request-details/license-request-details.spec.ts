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

import { LicenseRequestDetails } from './license-request-details';

const product: ProductModel = {
  id: '2',
  name: 'Vault Analytics',
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
  firstName: 'Jamie',
  lastName: 'Ellery',
  email: 'jamie.ellery@northwind.io',
  organizationId: '1',
  status: 'Active',
  role: 'Reader',
};

const existingLicense: LicenseModel = {
  id: '2',
  orgId: '1',
  productId: '2',
  start: new Date('2024-01-01T00:00:00Z'),
  end: new Date('2025-06-15T00:00:00Z'),
  status: 'Active',
};

function licenseRequestWith(overrides: Partial<LicenseRequestModel> = {}): LicenseRequestModel {
  return {
    id: '1',
    orgId: '1',
    productId: '2',
    userId: '7',
    status: 'Pending',
    ...overrides,
  };
}

interface FixtureOptions {
  licenseRequest?: LicenseRequestModel;
  license?: LicenseModel;
  router?: { navigate: ReturnType<typeof vi.fn> };
}

function createFixture(options: FixtureOptions = {}): {
  fixture: ComponentFixture<LicenseRequestDetails>;
  component: LicenseRequestDetails;
} {
  const licenseRequest = options.licenseRequest ?? licenseRequestWith();

  TestBed.configureTestingModule({
    imports: [LicenseRequestDetails],
    providers: [
      { provide: LicenseRequestService, useValue: { getLicenseRequestById: () => licenseRequest } },
      { provide: ProductService, useValue: { getProductById: () => product } },
      { provide: OrganizationService, useValue: { getOrganizationById: () => organization } },
      { provide: UserService, useValue: { getUserById: () => requester } },
      { provide: LicenseService, useValue: { getLicenseById: () => options.license } },
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

  const fixture = TestBed.createComponent(LicenseRequestDetails);
  fixture.componentRef.setInput('licenseRequestId', licenseRequest.id);

  return { fixture, component: fixture.componentInstance };
}

describe('LicenseRequestDetails', () => {
  it('should create', async () => {
    const { fixture, component } = createFixture();
    await fixture.whenStable();

    expect(component).toBeTruthy();
  });

  it('resolves the license request, product, organization, and requester', async () => {
    const licenseRequest = licenseRequestWith();
    const { fixture, component } = createFixture({ licenseRequest });
    await fixture.whenStable();

    expect(component['licenseRequest']()).toEqual(licenseRequest);
    expect(component['product']()).toEqual(product);
    expect(component['org']()).toEqual(organization);
    expect(component['user']()).toEqual(requester);
  });

  it('renders the composed product/organization title', async () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();

    const titleEl: HTMLElement = fixture.debugElement.nativeElement.querySelector('.title');
    expect(titleEl.textContent?.trim()).toBe('Vault Analytics - Northwind Systems');
  });

  describe('subtitle', () => {
    it('shows "New License" when the request has no existing license', async () => {
      const { fixture } = createFixture();
      fixture.detectChanges();
      await fixture.whenStable();

      const subtitleEl: HTMLElement = fixture.debugElement.nativeElement.querySelector('.subtitle');
      expect(subtitleEl.textContent).toContain('New License');
    });

    it('shows "Renewal" when the request references an existing license', async () => {
      const { fixture } = createFixture({
        licenseRequest: licenseRequestWith({ existingLicenseId: '2' }),
        license: existingLicense,
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const subtitleEl: HTMLElement = fixture.debugElement.nativeElement.querySelector('.subtitle');
      expect(subtitleEl.textContent).toContain('Renewal');
    });
  });

  it('renders the Info tab fields for the resolved license request', async () => {
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

    expect(rowText('Product')).toBe('Vault Analytics');
    expect(rowText('Organization')).toBe('Northwind Systems');
    expect(rowText('Requested By')).toBe('jamie.ellery@northwind.io');
    expect(rowText('Existing License')).toBe('None');
    expect(rowText('Status')).toBe('Pending');
  });

  it('links the Product and Organization rows to their own detail pages', async () => {
    const { fixture } = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();

    const links = fixture.debugElement
      .queryAll(By.directive(RouterLink))
      .map((debugEl) => debugEl.injector.get(RouterLink).urlTree?.toString());

    expect(links).toEqual(['/admin/products/2', '/admin/organizations/1']);
  });

  it('links the Existing License row to the license when one exists', async () => {
    const { fixture } = createFixture({
      licenseRequest: licenseRequestWith({ existingLicenseId: '2' }),
      license: existingLicense,
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const links = fixture.debugElement
      .queryAll(By.directive(RouterLink))
      .map((debugEl) => debugEl.injector.get(RouterLink).urlTree?.toString());

    expect(links).toContain('/admin/licenses/2');
  });

  describe('action buttons', () => {
    it('shows Reject and Approve when the request is Pending', async () => {
      const { fixture } = createFixture({
        licenseRequest: licenseRequestWith({ status: 'Pending' }),
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const buttons: HTMLElement[] = Array.from(
        fixture.debugElement.nativeElement.querySelectorAll('.action-button'),
      );
      expect(buttons.map((button) => button.textContent?.trim())).toEqual(['Reject', 'Approve']);
    });

    it('are hidden when the request is not Pending', async () => {
      const { fixture } = createFixture({
        licenseRequest: licenseRequestWith({ status: 'Approved' }),
      });
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.debugElement.nativeElement.querySelector('.action-button')).toBeNull();
    });
  });

  describe('Notes tab', () => {
    it('shows the rejection reason when the request was Rejected with one', async () => {
      const { fixture } = createFixture({
        licenseRequest: licenseRequestWith({
          status: 'Rejected',
          rejectionReason: 'Product still in Upcoming status.',
        }),
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const responses: HTMLElement[] = Array.from(
        fixture.debugElement.nativeElement.querySelectorAll('.response'),
      );
      expect(responses[0].textContent).toContain('Product still in Upcoming status.');
      expect(responses[0].textContent).toContain('Enclave Admin');
    });

    it('falls back to "No notes" when the request was Rejected without a reason', async () => {
      const { fixture } = createFixture({
        licenseRequest: licenseRequestWith({ status: 'Rejected', rejectionReason: undefined }),
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const responses: HTMLElement[] = Array.from(
        fixture.debugElement.nativeElement.querySelectorAll('.response'),
      );
      expect(responses[0].textContent).toContain('No notes');
    });

    it('omits the rejection response entirely when the request is not Rejected', async () => {
      const { fixture } = createFixture({
        licenseRequest: licenseRequestWith({ status: 'Pending' }),
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const responses: HTMLElement[] = Array.from(
        fixture.debugElement.nativeElement.querySelectorAll('.response'),
      );
      expect(responses).toHaveLength(1);
    });

    it('shows the requester notes, falling back to "No notes" when absent', async () => {
      const { fixture } = createFixture({
        licenseRequest: licenseRequestWith({ requestNotes: undefined }),
      });
      fixture.detectChanges();
      await fixture.whenStable();

      const responses: HTMLElement[] = Array.from(
        fixture.debugElement.nativeElement.querySelectorAll('.response'),
      );
      expect(responses[responses.length - 1].textContent).toContain('No notes');
    });
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
});
