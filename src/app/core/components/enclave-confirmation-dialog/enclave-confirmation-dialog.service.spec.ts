import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom, of } from 'rxjs';
import { vi } from 'vitest';

import { ConfirmationDialogData } from './enclave-confirmation-dialog';
import { ConfirmationDialogService } from './enclave-confirmation-dialog.service';

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

// Dialog-open wiring (component/ariaLabel/data/backdropClass/panelClass/autoFocus) is
// openEnclaveDialog's own concern, already covered by open-enclave-dialog.spec.ts. These
// tests only cover ConfirmationDialogService's own logic: mapping the dialog's afterClosed()
// result to a plain boolean.
describe('ConfirmationDialogService', () => {
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
