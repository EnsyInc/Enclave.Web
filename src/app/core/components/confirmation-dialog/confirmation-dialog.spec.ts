import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';

import { ConfirmationDialog, ConfirmationDialogData } from './confirmation-dialog';

const data: ConfirmationDialogData = {
  action: 'Delete',
  title: 'Delete "Alpha"',
  message: 'Are you sure you want to delete "<span class="highlight">Alpha</span>"?',
  confirmLabel: 'Delete',
};

function createFixture(): {
  fixture: ComponentFixture<ConfirmationDialog>;
  close: ReturnType<typeof vi.fn>;
} {
  const close = vi.fn();

  TestBed.configureTestingModule({
    imports: [ConfirmationDialog],
    providers: [
      { provide: MAT_DIALOG_DATA, useValue: data },
      { provide: MatDialogRef, useValue: { close } },
    ],
  });

  return { fixture: TestBed.createComponent(ConfirmationDialog), close };
}

describe('ConfirmationDialog', () => {
  it('renders the action, title, and confirm label from the dialog data', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();

    const nativeElement: HTMLElement = fixture.debugElement.nativeElement;
    expect(nativeElement.querySelector('.action')?.textContent).toBe('Delete');
    expect(nativeElement.querySelector('.title')?.textContent).toBe('Delete "Alpha"');
    expect(nativeElement.querySelector('.confirm-button')?.textContent?.trim()).toBe('Delete');
  });

  it('renders the message as HTML, including the highlighted product name', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();

    const highlight: HTMLElement | null =
      fixture.debugElement.nativeElement.querySelector('.highlight');
    expect(highlight?.textContent).toBe('Alpha');
  });

  it('closes the dialog with true when the confirm button is clicked', () => {
    const { fixture, close } = createFixture();
    fixture.detectChanges();

    const confirmButton: HTMLButtonElement =
      fixture.debugElement.nativeElement.querySelector('.confirm-button');
    confirmButton.click();

    expect(close).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('does not close with true when the cancel button is clicked', () => {
    const { fixture, close } = createFixture();
    fixture.detectChanges();

    const cancelButton: HTMLButtonElement =
      fixture.debugElement.nativeElement.querySelector('.cancel-button');
    cancelButton.click();

    expect(close).not.toHaveBeenCalledWith(true);
  });
});
