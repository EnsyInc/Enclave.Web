import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';
import {
  EnclaveConfirmationDialog,
  ConfirmationDialogData,
} from '@enclave/core/components/enclave-confirmation-dialog/enclave-confirmation-dialog';
import { openEnclaveDialog } from '@enclave/core';

@Injectable({ providedIn: 'root' })
export class ConfirmationDialogService {
  private readonly dialog = inject(MatDialog);

  public open(data: ConfirmationDialogData): Observable<boolean> {
    return openEnclaveDialog(this.dialog, EnclaveConfirmationDialog, {
      data,
      ariaLabel: data.title,
    })
      .afterClosed()
      .pipe(map((confirmed) => confirmed === true));
  }
}
