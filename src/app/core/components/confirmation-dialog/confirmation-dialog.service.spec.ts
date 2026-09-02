import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom, of } from 'rxjs';
import { vi } from 'vitest';
import {
  DIALOG_BACKDROP_CLASS,
  DIALOG_PANEL_CLASS,
} from '@enclave/core/dialog/dialog-panel-classes';

import { ConfirmationDialogService } from './confirmation-dialog.service';
import { ConfirmationDialog, ConfirmationDialogData } from './confirmation-dialog';

const data: ConfirmationDialogData = {
  action: 'Delete',
  title: 'Delete "Alpha"',
  message: 'Are you sure?',
  confirmLabel: 'Delete',
};

function createService(afterClosedValue: boolean | undefined): {
  service: ConfirmationDialogService;
  open: ReturnType<typeof vi.fn>;
} {
  const open = vi.fn().mockReturnValue({ afterClosed: () => of(afterClosedValue) });

  TestBed.configureTestingModule({
    providers: [{ provide: MatDialog, useValue: { open } }],
  });

  return { service: TestBed.inject(ConfirmationDialogService), open };
}

describe('ConfirmationDialogService', () => {
  it('opens the confirmation dialog with the given data and the expected config', () => {
    const { service, open } = createService(true);

    service.open(data);

    expect(open).toHaveBeenCalledExactlyOnceWith(ConfirmationDialog, {
      data,
      ariaLabel: data.title,
      backdropClass: DIALOG_BACKDROP_CLASS,
      panelClass: DIALOG_PANEL_CLASS,
      autoFocus: 'dialog',
    });
  });

  it('resolves true when the user confirms', async () => {
    const { service } = createService(true);

    await expect(firstValueFrom(service.open(data))).resolves.toBe(true);
  });

  it('resolves false when the user cancels (dialog closes with no result)', async () => {
    const { service } = createService(undefined);

    await expect(firstValueFrom(service.open(data))).resolves.toBe(false);
  });

  it('resolves false when the dialog closes with an explicit false', async () => {
    const { service } = createService(false);

    await expect(firstValueFrom(service.open(data))).resolves.toBe(false);
  });
});
