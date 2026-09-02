import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OverlayContainer } from '@angular/cdk/overlay';

import { EnclaveMoreActionsMenu } from './enclave-more-actions-menu';
import { EnsyLabsIcon } from '@enclave/core/icons';

@Component({
  imports: [EnclaveMoreActionsMenu],
  template: `
    <enclave-more-actions-menu elementName="Widget">
      <button mat-menu-item>Details</button>
      <button mat-menu-item>Delete</button>
    </enclave-more-actions-menu>
  `,
})
class HostComponent {}

describe('EnclaveMoreActionsMenu', () => {
  let fixture: ComponentFixture<HostComponent>;
  let overlayContainer: OverlayContainer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should create', () => {
    const rowAction = fixture.debugElement.query(By.directive(EnclaveMoreActionsMenu));
    expect(rowAction).toBeTruthy();
  });

  it('labels the trigger button with the element name', () => {
    const trigger: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('button');
    expect(trigger.getAttribute('aria-label')).toBe('Widget actions');
  });

  it('shows the more-horizontal icon on the trigger button', () => {
    const icon = fixture.debugElement.query(By.directive(EnsyLabsIcon))
      .componentInstance as EnsyLabsIcon;
    expect(icon.name()).toBe('more-horizontal');
  });

  it('does not render the menu content before the trigger is clicked', () => {
    const panel = overlayContainer.getContainerElement().querySelector('.mat-mdc-menu-panel');
    expect(panel).toBeNull();
  });

  it('projects the provided menu items into the menu when the trigger is clicked', () => {
    const trigger: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('button');
    trigger.click();
    fixture.detectChanges();

    const panel = overlayContainer.getContainerElement().querySelector('.mat-mdc-menu-panel');
    expect(panel).toBeTruthy();
    expect(panel?.textContent).toContain('Details');
    expect(panel?.textContent).toContain('Delete');
  });
});
