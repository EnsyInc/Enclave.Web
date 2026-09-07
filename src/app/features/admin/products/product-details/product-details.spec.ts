import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ProductModel } from '@enclave/domain/models';
import { ProductService } from '@enclave/domain/services';
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
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    openEdit = vi.fn();
    navigate = vi.fn().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [ProductDetails],
      providers: [
        { provide: ProductService, useValue: { getProductById: () => product } },
        { provide: ProductFormService, useValue: { openCreate: vi.fn(), openEdit } },
        { provide: Router, useValue: { navigate } },
        {
          // enclavePersistentTab, wired to the Info tab in the template, injects this itself.
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({}) },
            queryParamMap: of(convertToParamMap({})),
          },
        },
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

    const nameEl: HTMLElement = fixture.debugElement.nativeElement.querySelector('.title');
    expect(nameEl.textContent?.trim()).toBe('Enclave Core');
  });

  it('opens the product form dialog pre-filled with the resolved product on Edit', () => {
    fixture.detectChanges();

    const editButton: HTMLButtonElement =
      fixture.debugElement.nativeElement.querySelector('.card-action-button');
    editButton.click();

    expect(openEdit).toHaveBeenCalledExactlyOnceWith(product);
  });

  // Full restore/self-heal/debounce coverage lives at the directive level
  // (enclave-persistent-tab.spec.ts) -- this just proves the Info tab is actually wired up with
  // enclavePersistentTab and a reachable Router.navigate.
  it('populates the URL with the Info tab once mounted', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { tab: 'info' },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  });
});
