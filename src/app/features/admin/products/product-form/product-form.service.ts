import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DIALOG_BACKDROP_CLASS, DIALOG_PANEL_CLASS } from '@enclave/core';
import { ProductModel } from '@enclave/domain/models';
import { EnclaveProductForm } from '@enclave/features/admin/products/product-form/product-form';

@Injectable({ providedIn: 'root' })
export class ProductFormService {
  private readonly dialog = inject(MatDialog);

  public openCreate(): MatDialogRef<EnclaveProductForm> {
    return this.dialog.open(EnclaveProductForm, {
      ariaLabel: 'Create Product',
      backdropClass: DIALOG_BACKDROP_CLASS,
      panelClass: DIALOG_PANEL_CLASS,
      autoFocus: 'dialog',
    });
  }

  public openEdit(product: ProductModel): MatDialogRef<EnclaveProductForm> {
    return this.dialog.open(EnclaveProductForm, {
      data: product,
      ariaLabel: 'Edit Product',
      backdropClass: DIALOG_BACKDROP_CLASS,
      panelClass: DIALOG_PANEL_CLASS,
      autoFocus: 'dialog',
    });
  }
}
