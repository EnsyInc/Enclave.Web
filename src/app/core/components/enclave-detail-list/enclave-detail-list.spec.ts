import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { EnclaveDetailRow } from '@enclave/core/components/enclave-detail-row/enclave-detail-row';

import { EnclaveDetailList } from './enclave-detail-list';

@Component({
  imports: [EnclaveDetailList, EnclaveDetailRow],
  template: `
    <enclave-detail-list>
      <enclave-detail-row label="Name">Enclave Core</enclave-detail-row>
      <enclave-detail-row label="Status">Active</enclave-detail-row>
      <enclave-detail-row label="Id">1</enclave-detail-row>
    </enclave-detail-list>
  `,
})
class HostComponent {}

describe('EnclaveDetailList', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
  });

  it('should create', () => {
    fixture.detectChanges();

    const list = fixture.debugElement.query(By.directive(EnclaveDetailList));
    expect(list).toBeTruthy();
  });

  it('projects all rows', () => {
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.directive(EnclaveDetailRow));
    expect(rows.length).toBe(3);
  });

  it('enables the divider on every row except the last', () => {
    fixture.detectChanges();
    TestBed.flushEffects();

    const rows = fixture.debugElement
      .queryAll(By.directive(EnclaveDetailRow))
      .map((debugEl) => debugEl.componentInstance as EnclaveDetailRow);

    expect(rows.map((row) => row.renderDivider())).toEqual([true, true, false]);
  });
});
