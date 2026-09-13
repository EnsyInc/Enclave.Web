import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterLink } from '@angular/router';

import { LicenseRequestModel, UserModel } from '@enclave/domain/models';

import { EnclaveLicenseRenewalBanner } from './enclave-license-renewal-banner';

const user: UserModel = {
  id: '7',
  firstName: 'Jamie',
  lastName: 'Ellery',
  email: 'jamie.ellery@northwind.io',
  organizationId: '1',
  status: 'Active',
  role: 'Reader',
};

function licenseRequestWith(overrides: Partial<LicenseRequestModel> = {}): LicenseRequestModel {
  return {
    id: '1',
    orgId: '1',
    productId: '1',
    userId: '7',
    existingLicenseId: '2',
    status: 'Pending',
    ...overrides,
  };
}

describe('EnclaveLicenseRenewalBanner', () => {
  let fixture: ComponentFixture<EnclaveLicenseRenewalBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnclaveLicenseRenewalBanner],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EnclaveLicenseRenewalBanner);
  });

  function renderWith(licenseRequest: LicenseRequestModel, requester: UserModel = user): void {
    fixture.componentRef.setInput('licenseRequest', licenseRequest);
    fixture.componentRef.setInput('user', requester);
    fixture.detectChanges();
  }

  it('should create', () => {
    renderWith(licenseRequestWith());

    expect(fixture.componentInstance).toBeTruthy();
  });

  it("shows the requester's email in the predefined text", () => {
    renderWith(licenseRequestWith());

    const text: HTMLElement = fixture.debugElement.nativeElement.querySelector('.predefined-text');
    expect(text.textContent).toContain('jamie.ellery@northwind.io');
  });

  it('shows the request notes when present', () => {
    renderWith(licenseRequestWith({ requestNotes: 'Renewing before end of quarter.' }));

    const notes: HTMLElement | null =
      fixture.debugElement.nativeElement.querySelector('.user-notes');
    expect(notes?.textContent).toContain('Renewing before end of quarter.');
  });

  it('omits the notes line when requestNotes is absent', () => {
    renderWith(licenseRequestWith({ requestNotes: undefined }));

    expect(fixture.debugElement.nativeElement.querySelector('.user-notes')).toBeNull();
  });

  it('links the Review Request button to the request in the license-requests view', () => {
    renderWith(licenseRequestWith({ id: '42' }));

    const link = fixture.debugElement.query(By.directive(RouterLink)).injector.get(RouterLink);
    expect(link.urlTree?.toString()).toBe('/admin/license-requests/42');
  });
});
