import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatTooltip } from '@angular/material/tooltip';

import { EnclaveDetailRow } from './enclave-detail-row';

@Component({
  imports: [EnclaveDetailRow],
  template: `<enclave-detail-row [label]="label" [valueTooltip]="tooltip">{{
    value
  }}</enclave-detail-row>`,
})
class HostComponent {
  label = 'Name';
  value = 'Enclave Core';
  tooltip: string | undefined;
}

describe('EnclaveDetailRow', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
  });

  it('should create', () => {
    fixture.detectChanges();

    const row = fixture.debugElement.query(By.directive(EnclaveDetailRow));
    expect(row).toBeTruthy();
  });

  it('renders the label and projected value', () => {
    fixture.detectChanges();

    const nativeElement: HTMLElement = fixture.debugElement.nativeElement;
    expect(nativeElement.querySelector('.info-label')?.textContent?.trim()).toBe('Name');
    expect(nativeElement.querySelector('.info-value')?.textContent?.trim()).toBe('Enclave Core');
  });

  it('does not set a tooltip message when valueTooltip is not provided', () => {
    fixture.detectChanges();

    const tooltip = fixture.debugElement.query(By.directive(MatTooltip)).injector.get(MatTooltip);
    expect(tooltip.message).toBeFalsy();
  });

  it('sets the tooltip message on the value when valueTooltip is provided', () => {
    fixture.componentInstance.tooltip = 'Full description text';
    fixture.detectChanges();

    const tooltip = fixture.debugElement.query(By.directive(MatTooltip)).injector.get(MatTooltip);
    expect(tooltip.message).toBe('Full description text');
  });

  it('does not render a divider by default', () => {
    fixture.detectChanges();

    const divider = fixture.debugElement.nativeElement.querySelector('mat-divider');
    expect(divider).toBeNull();
  });

  it('renders a divider once renderDivider is set to true', () => {
    fixture.detectChanges();

    const row = fixture.debugElement.query(By.directive(EnclaveDetailRow))
      .componentInstance as EnclaveDetailRow;
    row.renderDivider.set(true);
    fixture.detectChanges();

    const divider = fixture.debugElement.nativeElement.querySelector('mat-divider');
    expect(divider).toBeTruthy();
  });
});
