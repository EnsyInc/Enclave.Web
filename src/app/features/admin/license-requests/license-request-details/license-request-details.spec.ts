import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseRequestDetails } from './license-request-details';

describe('LicenseRequestDetails', () => {
  let component: LicenseRequestDetails;
  let fixture: ComponentFixture<LicenseRequestDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicenseRequestDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(LicenseRequestDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
