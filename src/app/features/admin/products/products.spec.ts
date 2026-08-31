import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { MatSortHeader } from '@angular/material/sort';
import { ProductModel } from '@enclave-core/models/product-model';
import { EnclavePageHeader } from '@enclave/core/components/enclave-page-header/enclave-page-header';

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
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the total and active product counts in the page header subtitle', () => {
    fixture.detectChanges();

    const header = fixture.debugElement.query(By.directive(EnclavePageHeader))
      .componentInstance as EnclavePageHeader;
    expect(header.subTitle()).toBe('6 in the catalogue - 3 active');
  });

  it('updates the page header subtitle when the productsList input changes', () => {
    fixture.componentRef.setInput('productsList', customProducts);
    fixture.detectChanges();

    const header = fixture.debugElement.query(By.directive(EnclavePageHeader))
      .componentInstance as EnclavePageHeader;
    expect(header.subTitle()).toBe('3 in the catalogue - 1 active');
  });

  it('marks the name column as sorted ascending when its header is clicked', async () => {
    fixture.componentRef.setInput('productsList', customProducts);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const nameHeader: HTMLElement =
      fixture.debugElement.nativeElement.querySelector('.mat-column-name');
    const nameSortHeader = fixture.debugElement.queryAll(By.directive(MatSortHeader))[0];
    nameSortHeader.triggerEventHandler('click', null);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
  });

  it('renders a table row for every product', async () => {
    fixture.componentRef.setInput('productsList', customProducts);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows: NodeListOf<HTMLElement> =
      fixture.debugElement.nativeElement.querySelectorAll('tr[mat-row]');
    expect(rows).toHaveLength(3);
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
    expect(rows).toHaveLength(1);
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
