import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

import { EnclaveDialogHeader } from './enclave-dialog-header';
import { EnsyLabsIcon, IconName } from '@enclave/core/icons';

function createFixture(): {
  fixture: ComponentFixture<EnclaveDialogHeader>;
  close: ReturnType<typeof vi.fn>;
} {
  const close = vi.fn();

  TestBed.configureTestingModule({
    imports: [EnclaveDialogHeader],
    providers: [{ provide: MatDialogRef, useValue: { close } }],
  });

  const fixture = TestBed.createComponent(EnclaveDialogHeader);
  fixture.componentRef.setInput('action', 'Edit');
  fixture.componentRef.setInput('title', 'Edit Product');

  return { fixture, close };
}

describe('EnclaveDialogHeader', () => {
  it('should create', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the action and title', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();

    const nativeElement: HTMLElement = fixture.debugElement.nativeElement;
    expect(nativeElement.querySelector('.action')?.textContent).toBe('Edit');
    expect(nativeElement.querySelector('.title')?.textContent).toBe('Edit Product');
  });

  it('renders a close icon on the close button', () => {
    const { fixture } = createFixture();
    fixture.detectChanges();

    const icon = fixture.debugElement.query(By.directive(EnsyLabsIcon))
      .componentInstance as EnsyLabsIcon;
    expect(icon.name()).toBe(IconName.Close);
  });

  it('closes the dialog when the close button is clicked', () => {
    const { fixture, close } = createFixture();
    fixture.detectChanges();

    const closeButton: HTMLButtonElement =
      fixture.debugElement.nativeElement.querySelector('.close-button');
    closeButton.click();

    expect(close).toHaveBeenCalledExactlyOnceWith('');
  });
});
