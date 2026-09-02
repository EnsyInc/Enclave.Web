import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { vi } from 'vitest';
import { ProductModel } from '@enclave/core/models/product.model';
import {
  DIALOG_BACKDROP_CLASS,
  DIALOG_PANEL_CLASS,
} from '@enclave/core/dialog/dialog-panel-classes';

import { ProductFormService } from './product-form.service';
import { EnclaveProductForm } from './product-form';

const product: ProductModel = { id: '1', name: 'Enclave Core', status: 'Active' };

describe('ProductFormService', () => {
  let open: ReturnType<typeof vi.fn>;
  let service: ProductFormService;

  beforeEach(() => {
    open = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: { open } }],
    });
    service = TestBed.inject(ProductFormService);
  });

  it('openCreate opens the form dialog with no data', () => {
    service.openCreate();

    expect(open).toHaveBeenCalledExactlyOnceWith(EnclaveProductForm, {
      ariaLabel: 'Create Product',
      backdropClass: DIALOG_BACKDROP_CLASS,
      panelClass: DIALOG_PANEL_CLASS,
    });
  });

  it('openEdit opens the form dialog pre-filled with the given product', () => {
    service.openEdit(product);

    expect(open).toHaveBeenCalledExactlyOnceWith(EnclaveProductForm, {
      data: product,
      ariaLabel: 'Edit Product',
      backdropClass: DIALOG_BACKDROP_CLASS,
      panelClass: DIALOG_PANEL_CLASS,
    });
  });
});
