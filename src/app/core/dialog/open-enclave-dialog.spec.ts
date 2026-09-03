import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { vi } from 'vitest';

import { openEnclaveDialog } from './open-enclave-dialog';

@Component({ template: '' })
class TestDialogComponent {}

describe('openEnclaveDialog', () => {
  it('opens the dialog with the enclave backdrop/panel classes and dialog autofocus', () => {
    const open = vi.fn();
    const dialog = { open } as unknown as MatDialog;

    openEnclaveDialog(dialog, TestDialogComponent, { ariaLabel: 'Test Dialog' });

    expect(open).toHaveBeenCalledExactlyOnceWith(TestDialogComponent, {
      ariaLabel: 'Test Dialog',
      backdropClass: 'enclave-dialog-backdrop',
      panelClass: 'enclave-dialog-panel',
      autoFocus: 'dialog',
    });
  });

  it('forwards arbitrary config (e.g. data) alongside the enclave defaults', () => {
    const open = vi.fn();
    const dialog = { open } as unknown as MatDialog;
    const data = { id: '1' };

    openEnclaveDialog(dialog, TestDialogComponent, { data, ariaLabel: 'Test Dialog' });

    expect(open).toHaveBeenCalledExactlyOnceWith(TestDialogComponent, {
      data,
      ariaLabel: 'Test Dialog',
      backdropClass: 'enclave-dialog-backdrop',
      panelClass: 'enclave-dialog-panel',
      autoFocus: 'dialog',
    });
  });

  it('does not let a caller override the enclave backdrop/panel classes or autofocus', () => {
    const open = vi.fn();
    const dialog = { open } as unknown as MatDialog;

    openEnclaveDialog(dialog, TestDialogComponent, {
      ariaLabel: 'Test Dialog',
      backdropClass: 'some-other-backdrop',
      panelClass: 'some-other-panel',
      autoFocus: false,
    });

    expect(open).toHaveBeenCalledExactlyOnceWith(TestDialogComponent, {
      ariaLabel: 'Test Dialog',
      backdropClass: 'enclave-dialog-backdrop',
      panelClass: 'enclave-dialog-panel',
      autoFocus: 'dialog',
    });
  });

  it('opens the dialog with just the enclave defaults when no config is given', () => {
    const open = vi.fn();
    const dialog = { open } as unknown as MatDialog;

    openEnclaveDialog(dialog, TestDialogComponent);

    expect(open).toHaveBeenCalledExactlyOnceWith(TestDialogComponent, {
      backdropClass: 'enclave-dialog-backdrop',
      panelClass: 'enclave-dialog-panel',
      autoFocus: 'dialog',
    });
  });
});
