import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { openEnclaveDialog } from '@enclave/core';
import { ProductModel } from '@enclave/domain/models';
import { EnclaveProductForm } from '@enclave/features/admin/products/product-form/product-form';

@Injectable({ providedIn: 'root' })
export class ProductFormService {
  private readonly dialog = inject(MatDialog);

  public openCreate(): MatDialogRef<EnclaveProductForm> {
    return openEnclaveDialog(this.dialog, EnclaveProductForm, {
      ariaLabel: 'Create Product',
    });
  }

  public openEdit(product: ProductModel): MatDialogRef<EnclaveProductForm> {
    return openEnclaveDialog(this.dialog, EnclaveProductForm, {
      data: product,
      ariaLabel: 'Edit Product',
    });
  }
}
