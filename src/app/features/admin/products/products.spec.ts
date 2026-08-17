import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableDataSource } from '@angular/material/table';
import { ProductModel } from '@enclave-core/models/product-model';

import { Products } from './products';

const customProducts: ProductModel[] = [
  { id: '1', name: 'Alpha', description: 'First product', status: 'Active' },
  { id: '2', name: 'Beta', description: 'Second product', status: 'Retired' },
  { id: '3', name: 'Gamma', status: 'Upcoming' },
];

describe('Products', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Products],
    }).compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('counts every product in the default catalogue', () => {
    expect(component.productsCount()).toBe(6);
  });

  it('counts only the active products in the default catalogue', () => {
    expect(component.activeProductsCount()).toBe(3);
  });

  it('recomputes both counts when the productsList input changes', () => {
    fixture.componentRef.setInput('productsList', customProducts);

    expect(component.productsCount()).toBe(3);
    expect(component.activeProductsCount()).toBe(1);
  });

  it('wraps the current product list in a MatTableDataSource', () => {
    fixture.componentRef.setInput('productsList', customProducts);

    expect(component.productsDataSource()).toBeInstanceOf(MatTableDataSource);
    expect(component.productsDataSource().data).toEqual(customProducts);
  });

  it('wires the table sort into the data source after the view initializes', () => {
    fixture.detectChanges();

    expect(component.productsDataSource().sort).toBe(component.productSort());
  });

  it('renders a table row for every product', async () => {
    fixture.componentRef.setInput('productsList', customProducts);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows: NodeListOf<HTMLElement> =
      fixture.debugElement.nativeElement.querySelectorAll('tr[mat-row]');
    expect(rows.length).toBe(3);
  });

  it('shows a fallback message for a product with no description', async () => {
    fixture.componentRef.setInput('productsList', customProducts);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows: HTMLElement[] = Array.from(
      fixture.debugElement.nativeElement.querySelectorAll('tr[mat-row]'),
    );
    const gammaRow = rows.find((row) => row.textContent?.includes('Gamma'));

    expect(gammaRow?.querySelector('.product-description i')?.textContent?.trim()).toBe(
      'No description',
    );
  });

  it('filters rows to those matching the search term', async () => {
    fixture.componentRef.setInput('productsList', customProducts);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const searchInput: HTMLInputElement =
      fixture.debugElement.nativeElement.querySelector('input[matInput]');
    searchInput.value = 'first product';
    searchInput.dispatchEvent(new Event('keyup'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows: HTMLElement[] = Array.from(
      fixture.debugElement.nativeElement.querySelectorAll('tr[mat-row]'),
    );
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Alpha');
  });

  it('shows a message naming the search term when nothing matches', async () => {
    fixture.componentRef.setInput('productsList', customProducts);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const searchInput: HTMLInputElement =
      fixture.debugElement.nativeElement.querySelector('input[matInput]');
    searchInput.value = 'does-not-exist';
    searchInput.dispatchEvent(new Event('keyup'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const noDataCell: HTMLElement = fixture.debugElement.nativeElement.querySelector('.mat-cell');
    expect(noDataCell.textContent).toContain('No data matching the search term "does-not-exist".');
  });

  it('shows the empty-catalogue message when there are no products and no search term', async () => {
    fixture.componentRef.setInput('productsList', []);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const noDataCell: HTMLElement = fixture.debugElement.nativeElement.querySelector('.mat-cell');
    expect(noDataCell.textContent).toContain(
      'No products yet. Press the "Create Product" button above to add one.',
    );
  });
});
