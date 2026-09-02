import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

import { EnclaveDetailCard } from './enclave-detail-card';
import { EnsyLabsIcon, IconName } from '@enclave/core/icons';

@Component({
  imports: [EnclaveDetailCard],
  template: `
    <enclave-detail-card
      [actionButtonIcon]="actionButtonIcon"
      [actionButtonText]="actionButtonText"
      (actionButtonClicked)="onActionButtonClicked()"
    >
      <span class="projected-content">Row content</span>
    </enclave-detail-card>
  `,
})
class HostComponent {
  actionButtonIcon: IconName | undefined;
  actionButtonText: string | undefined;
  onActionButtonClicked = vi.fn();
}

describe('EnclaveDetailCard', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
  });

  it('should create', () => {
    fixture.detectChanges();

    const card = fixture.debugElement.query(By.directive(EnclaveDetailCard));
    expect(card).toBeTruthy();
  });

  it('renders the Overview subtitle and projects content', () => {
    fixture.detectChanges();

    const nativeElement: HTMLElement = fixture.debugElement.nativeElement;
    expect(nativeElement.querySelector('mat-card-subtitle')?.textContent?.trim()).toBe('Overview');
    expect(nativeElement.querySelector('.projected-content')?.textContent?.trim()).toBe(
      'Row content',
    );
  });

  it('does not render an action button when neither actionButtonIcon nor actionButtonText is provided', () => {
    fixture.detectChanges();

    const button = fixture.debugElement.nativeElement.querySelector('.card-action-button');
    expect(button).toBeNull();
  });

  it('does not render an action button when only actionButtonIcon is provided', () => {
    fixture.componentInstance.actionButtonIcon = IconName.Edit;
    fixture.detectChanges();

    const button = fixture.debugElement.nativeElement.querySelector('.card-action-button');
    expect(button).toBeNull();
  });

  it('does not render an action button when only actionButtonText is provided', () => {
    fixture.componentInstance.actionButtonText = 'Edit';
    fixture.detectChanges();

    const button = fixture.debugElement.nativeElement.querySelector('.card-action-button');
    expect(button).toBeNull();
  });

  it('renders an action button with the given icon and text when both are provided', () => {
    fixture.componentInstance.actionButtonIcon = IconName.Edit;
    fixture.componentInstance.actionButtonText = 'Edit';
    fixture.detectChanges();

    const button: HTMLElement =
      fixture.debugElement.nativeElement.querySelector('.card-action-button');
    const icon = fixture.debugElement.query(By.directive(EnsyLabsIcon))
      .componentInstance as EnsyLabsIcon;

    expect(button).toBeTruthy();
    expect(button.textContent?.trim()).toBe('Edit');
    expect(icon.name()).toBe(IconName.Edit);
  });

  it('emits actionButtonClicked when the action button is clicked', () => {
    fixture.componentInstance.actionButtonIcon = IconName.Edit;
    fixture.componentInstance.actionButtonText = 'Edit';
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.debugElement.nativeElement.querySelector('.card-action-button');
    button.click();

    expect(fixture.componentInstance.onActionButtonClicked).toHaveBeenCalledTimes(1);
  });
});
