import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnclaveProductFormOverlay } from './product-form-overlay';

describe('ProductFormOverlay', () => {
  let component: EnclaveProductFormOverlay;
  let fixture: ComponentFixture<EnclaveProductFormOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnclaveProductFormOverlay],
    }).compileComponents();

    fixture = TestBed.createComponent(EnclaveProductFormOverlay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
