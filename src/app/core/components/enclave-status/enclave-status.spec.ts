import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { EnclaveStatus } from './enclave-status';
import { EnsyLabsIcon } from '@enclave/core/icons/ensy-labs-icon/ensy-labs-icon';

@Component({
  imports: [EnclaveStatus],
  template: `<enclave-status>Active</enclave-status>`,
})
class HostComponent {}

describe('EnclaveStatus', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    const status = fixture.debugElement.query(By.directive(EnclaveStatus));
    expect(status).toBeTruthy();
  });

  it('defaults to the dot icon', () => {
    const icon = fixture.debugElement.query(By.directive(EnsyLabsIcon))
      .componentInstance as EnsyLabsIcon;
    expect(icon.name()).toBe('dot');
  });

  it('projects its content into the status label', () => {
    const content: HTMLElement = fixture.debugElement.nativeElement.querySelector('.content');
    expect(content.textContent?.trim()).toBe('Active');
  });
});
