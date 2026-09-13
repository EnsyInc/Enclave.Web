import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseDetails } from './license-details';

describe('LicenseDetails', () => {
  let component: LicenseDetails;
  let fixture: ComponentFixture<LicenseDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicenseDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(LicenseDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
