import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ProductModel } from '@enclave/domain/models';
import { ProductsService } from '@enclave/domain/services';
import { ProductFormService } from '@enclave/features/admin/products/product-form/product-form.service';

import { ProductDetails } from './product-details';

const product: ProductModel = {
  id: '1',
  name: 'Enclave Core',
  status: 'Active',
  description: 'Seat-based license engine.',
};

describe('ProductDetails', () => {
  let component: ProductDetails;
  let fixture: ComponentFixture<ProductDetails>;
  let openEdit: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    openEdit = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ProductDetails],
      providers: [
        { provide: ProductsService, useValue: { getProductById: () => product } },
        { provide: ProductFormService, useValue: { openCreate: vi.fn(), openEdit } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetails);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('productId', '1');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('resolves the product for the bound productId', () => {
    expect(component['product']()).toEqual(product);
  });

  it('renders the product name and status from the resolved product', () => {
    fixture.detectChanges();

    const nameEl: HTMLElement = fixture.debugElement.nativeElement.querySelector('.product-name');
    expect(nameEl.textContent?.trim()).toBe('Enclave Core');
  });

  it('opens the product form dialog pre-filled with the resolved product on Edit', () => {
    fixture.detectChanges();

    const editButton: HTMLButtonElement =
      fixture.debugElement.nativeElement.querySelector('.card-action-button');
    editButton.click();

    expect(openEdit).toHaveBeenCalledExactlyOnceWith(product);
  });
});
