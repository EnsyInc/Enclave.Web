import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { LicenseRequestList } from './license-request-list';

describe('LicenseRequestList', () => {
  let component: LicenseRequestList;
  let fixture: ComponentFixture<LicenseRequestList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicenseRequestList],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({}) },
            // EnclaveSearchBarFilter, nested in the template, subscribes to this stream directly.
            queryParamMap: of(convertToParamMap({})),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LicenseRequestList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
