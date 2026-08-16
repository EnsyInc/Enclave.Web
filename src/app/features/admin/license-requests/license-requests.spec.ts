import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseRequests } from './license-requests';

describe('LicenseRequests', () => {
  let component: LicenseRequests;
  let fixture: ComponentFixture<LicenseRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicenseRequests],
    }).compileComponents();

    fixture = TestBed.createComponent(LicenseRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
