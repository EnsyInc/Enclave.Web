import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnclaveDetailCard } from './enclave-detail-card';

describe('EnclaveDetailCard', () => {
  let component: EnclaveDetailCard;
  let fixture: ComponentFixture<EnclaveDetailCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnclaveDetailCard],
    }).compileComponents();

    fixture = TestBed.createComponent(EnclaveDetailCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
