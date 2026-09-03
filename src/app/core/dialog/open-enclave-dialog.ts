import { ComponentType } from '@angular/cdk/overlay';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

const DIALOG_BACKDROP_CLASS = 'enclave-dialog-backdrop';
const DIALOG_PANEL_CLASS = 'enclave-dialog-panel';

export function openEnclaveDialog<T, D = unknown, R = unknown>(
  dialog: MatDialog,
  component: ComponentType<T>,
  config?: MatDialogConfig<D>,
): MatDialogRef<T, R> {
  return dialog.open(component, {
    ...config,
    backdropClass: DIALOG_BACKDROP_CLASS,
    panelClass: DIALOG_PANEL_CLASS,
    autoFocus: 'dialog',
  });
}
