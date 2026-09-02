import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProductModel } from '@enclave/core/models/product.model';
import {
  DIALOG_BACKDROP_CLASS,
  DIALOG_PANEL_CLASS,
} from '@enclave/core/dialog/dialog-panel-classes';
import { EnclaveProductFormOverlay } from '@enclave/features/admin/product-form-overlay/product-form-overlay';

@Injectable({ providedIn: 'root' })
export class ProductFormOverlayService {
  private readonly dialog = inject(MatDialog);

  public openCreate(): MatDialogRef<EnclaveProductFormOverlay> {
    return this.dialog.open(EnclaveProductFormOverlay, {
      ariaLabel: 'Create Product',
      backdropClass: DIALOG_BACKDROP_CLASS,
      panelClass: DIALOG_PANEL_CLASS,
    });
  }

  public openEdit(product: ProductModel): MatDialogRef<EnclaveProductFormOverlay> {
    return this.dialog.open(EnclaveProductFormOverlay, {
      data: product,
      ariaLabel: 'Edit Product',
      backdropClass: DIALOG_BACKDROP_CLASS,
      panelClass: DIALOG_PANEL_CLASS,
    });
  }
}
