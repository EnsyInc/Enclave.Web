import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { EnsyLabsIcon } from '@enclave/core/icons/ensy-labs-icon/ensy-labs-icon';

export interface ConfirmationDialogData {
  action: string;
  title: string;
  message: string;
  confirmLabel: string;
}

@Component({
  selector: 'enclave-confirmation-dialog',
  imports: [EnsyLabsIcon, MatDividerModule, MatDialogModule, MatButtonModule],
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.scss',
})
export class ConfirmationDialog {
  private readonly data = inject<ConfirmationDialogData>(MAT_DIALOG_DATA);

  protected readonly dialogRef = inject(MatDialogRef<ConfirmationDialog>);
  protected readonly dialogData = this.data;
}
