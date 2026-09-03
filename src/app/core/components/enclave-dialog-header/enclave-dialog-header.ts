import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogClose } from '@angular/material/dialog';

import { EnsyLabsIcon } from '@enclave/core/icons';

@Component({
  selector: 'enclave-dialog-header',
  imports: [EnsyLabsIcon, MatButtonModule, MatDialogClose],
  templateUrl: './enclave-dialog-header.html',
  styleUrl: './enclave-dialog-header.scss',
})
export class EnclaveDialogHeader {
  public readonly action = input.required<string>();
  public readonly title = input.required<string>();
}
