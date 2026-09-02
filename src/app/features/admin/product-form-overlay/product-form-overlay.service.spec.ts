import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { vi } from 'vitest';
import { ProductModel } from '@enclave/core/models/product.model';
import {
  DIALOG_BACKDROP_CLASS,
  DIALOG_PANEL_CLASS,
} from '@enclave/core/dialog/dialog-panel-classes';

import { ProductFormOverlayService } from './product-form-overlay.service';
import { EnclaveProductFormOverlay } from './product-form-overlay';

const product: ProductModel = { id: '1', name: 'Enclave Core', status: 'Active' };

describe('ProductFormOverlayService', () => {
  let open: ReturnType<typeof vi.fn>;
  let service: ProductFormOverlayService;

  beforeEach(() => {
    open = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: { open } }],
    });
    service = TestBed.inject(ProductFormOverlayService);
  });

  it('openCreate opens the form dialog with no data', () => {
    service.openCreate();

    expect(open).toHaveBeenCalledExactlyOnceWith(EnclaveProductFormOverlay, {
      ariaLabel: 'Create Product',
      backdropClass: DIALOG_BACKDROP_CLASS,
      panelClass: DIALOG_PANEL_CLASS,
    });
  });

  it('openEdit opens the form dialog pre-filled with the given product', () => {
    service.openEdit(product);

    expect(open).toHaveBeenCalledExactlyOnceWith(EnclaveProductFormOverlay, {
      data: product,
      ariaLabel: 'Edit Product',
      backdropClass: DIALOG_BACKDROP_CLASS,
      panelClass: DIALOG_PANEL_CLASS,
    });
  });
});
