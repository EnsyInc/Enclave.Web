import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';
import {
  ConfirmationDialog,
  ConfirmationDialogData,
} from '@enclave-core/components/confirmation-dialog/confirmation-dialog';
import {
  DIALOG_BACKDROP_CLASS,
  DIALOG_PANEL_CLASS,
} from '@enclave-core/dialog/dialog-panel-classes';

@Injectable({ providedIn: 'root' })
export class ConfirmationDialogService {
  private readonly dialog = inject(MatDialog);

  public open(data: ConfirmationDialogData): Observable<boolean> {
    return this.dialog
      .open(ConfirmationDialog, {
        data,
        ariaLabel: data.title,
        backdropClass: DIALOG_BACKDROP_CLASS,
        panelClass: DIALOG_PANEL_CLASS,
        autoFocus: 'dialog',
      })
      .afterClosed()
      .pipe(map((confirmed) => confirmed === true));
  }
}
