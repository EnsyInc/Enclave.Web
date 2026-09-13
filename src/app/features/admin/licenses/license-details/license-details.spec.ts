import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import {
  LicenseModel,
  LicenseStatus,
  OrganizationModel,
  ProductModel,
} from '@enclave/domain/models';
import { LicenseService, OrganizationService, ProductService } from '@enclave/domain/services';

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

function createFixture(status: LicenseStatus = 'Scheduled'): {
  fixture: ComponentFixture<LicenseDetails>;
  component: LicenseDetails;
  navigate: ReturnType<typeof vi.fn>;
} {
  const navigate = vi.fn().mockResolvedValue(true);

  TestBed.configureTestingModule({
    imports: [LicenseDetails],
    providers: [
      { provide: LicenseService, useValue: { getLicenseById: () => licenseWithStatus(status) } },
      { provide: ProductService, useValue: { getProductById: () => product } },
      { provide: OrganizationService, useValue: { getOrganizationById: () => organization } },
      { provide: Router, useValue: { navigate } },
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

  return { fixture, component: fixture.componentInstance, navigate };
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
    const { fixture, navigate } = createFixture();
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
      const { fixture } = createFixture('Scheduled');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.debugElement.nativeElement.querySelector('enclave-time-left')).toBeNull();
    });

    it('is shown when the license is Active', async () => {
      const { fixture } = createFixture('Active');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.debugElement.nativeElement.querySelector('enclave-time-left')).not.toBeNull();
    });
  });
});
