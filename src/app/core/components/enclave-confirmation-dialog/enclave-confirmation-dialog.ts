import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

import { EnclaveDialogHeader } from '@enclave/core/components/enclave-dialog-header/enclave-dialog-header';

export interface ConfirmationDialogData {
  action: string;
  title: string;
  message: string;
  confirmLabel: string;
}

@Component({
  selector: 'enclave-confirmation-dialog',
  imports: [EnclaveDialogHeader, MatButtonModule, MatDialogModule, MatDividerModule],
  templateUrl: './enclave-confirmation-dialog.html',
  styleUrl: './enclave-confirmation-dialog.scss',
})
export class EnclaveConfirmationDialog {
  private readonly data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA);

  protected readonly dialogRef = inject(MatDialogRef<EnclaveConfirmationDialog>);
  protected readonly dialogData = this.data;
}
