import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { vi } from 'vitest';
import { PRODUCT_STATUSES, ProductModel } from '@enclave/core';

import { EnclaveProductForm } from './product-form';

const product: ProductModel = {
  id: '1',
  name: 'Enclave Core',
  description: 'Seat-based license engine.',
  status: 'Active',
};

function createFixture(data: ProductModel | undefined): {
  fixture: ComponentFixture<EnclaveProductForm>;
  close: ReturnType<typeof vi.fn>;
} {
  const close = vi.fn();

  TestBed.configureTestingModule({
    imports: [EnclaveProductForm],
    providers: [
      { provide: MAT_DIALOG_DATA, useValue: data },
      { provide: MatDialogRef, useValue: { close } },
    ],
  });

  return { fixture: TestBed.createComponent(EnclaveProductForm), close };
}

describe('EnclaveProductForm', () => {
  describe('create mode (no dialog data)', () => {
    it('starts with an empty form', () => {
      const { fixture } = createFixture(undefined);

      expect(fixture.componentInstance['form'].getRawValue()).toEqual({
        name: '',
        description: '',
        status: null,
      });
    });

    it('exposes the product statuses from PRODUCT_STATUSES', () => {
      const { fixture } = createFixture(undefined);

      expect(fixture.componentInstance['productStatuses']).toBe(PRODUCT_STATUSES);
    });

    it('blocks save and marks the form touched when required fields are missing', () => {
      const { fixture, close } = createFixture(undefined);

      fixture.componentInstance['save']();

      expect(close).not.toHaveBeenCalled();
      expect(fixture.componentInstance['form'].touched).toBe(true);
    });

    it('closes the dialog with the raw form value once required fields are filled', () => {
      const { fixture, close } = createFixture(undefined);
      fixture.componentInstance['form'].setValue({
        name: 'New Product',
        description: '',
        status: 'Active',
      });

      fixture.componentInstance['save']();

      expect(close).toHaveBeenCalledExactlyOnceWith({
        name: 'New Product',
        description: '',
        status: 'Active',
      });
    });
  });

  describe('edit mode (existing product as dialog data)', () => {
    it('pre-fills the form with the given product', () => {
      const { fixture } = createFixture(product);

      expect(fixture.componentInstance['form'].getRawValue()).toEqual({
        name: product.name,
        description: product.description,
        status: product.status,
      });
    });

    it('closes the dialog with the edited raw form value on save', () => {
      const { fixture, close } = createFixture(product);
      fixture.componentInstance['form'].patchValue({ name: 'Renamed' });

      fixture.componentInstance['save']();

      expect(close).toHaveBeenCalledExactlyOnceWith({
        name: 'Renamed',
        description: product.description,
        status: product.status,
      });
    });
  });
});
