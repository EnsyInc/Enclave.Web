import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseRequestList } from './license-request-list';

describe('LicenseRequestList', () => {
  let component: LicenseRequestList;
  let fixture: ComponentFixture<LicenseRequestList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicenseRequestList],
    }).compileComponents();

    fixture = TestBed.createComponent(LicenseRequestList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
