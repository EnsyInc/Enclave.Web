import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { MatSortHeader } from '@angular/material/sort';
import { of } from 'rxjs';
import { vi } from 'vitest';
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

describe('Products sort query param persistence', () => {
  let navigateSpy: ReturnType<typeof vi.fn>;

  function createComponent(
    initialQueryParams: Record<string, string> = {},
  ): ComponentFixture<Products> {
    navigateSpy = vi.fn().mockResolvedValue(true);

    TestBed.configureTestingModule({
      imports: [Products],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap(initialQueryParams) },
            // EnclaveSearchBarFilter, nested in the template, subscribes to this stream directly.
            queryParamMap: of(convertToParamMap({})),
          },
        },
        { provide: Router, useValue: { navigate: navigateSpy } },
      ],
    });

    const fixture = TestBed.createComponent(Products);
    fixture.componentRef.setInput('productsList', customProducts);
    return fixture;
  }

  afterEach(() => {
    vi.useRealTimers();
  });

  it('restores ascending sort on the name column from the sort query param', async () => {
    const fixture = createComponent({ sort: 'name:asc' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const nameHeader: HTMLElement =
      fixture.debugElement.nativeElement.querySelector('.mat-column-name');
    expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
  });

  it('restores descending sort on the status column from the sort query param', async () => {
    const fixture = createComponent({ sort: 'status:desc' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const statusHeader: HTMLElement =
      fixture.debugElement.nativeElement.querySelector('.mat-column-status');
    expect(statusHeader.getAttribute('aria-sort')).toBe('descending');
  });

  it.each([
    ['missing the direction half', 'name'],
    ['naming a non-sortable column', 'description:asc'],
    ['using an unrecognized direction', 'name:sideways'],
    ['with trailing garbage', 'name:asc:extra'],
  ])('ignores a malformed sort query param (%s)', async (_label, sortParam) => {
    const fixture = createComponent({ sort: sortParam });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const nameHeader: HTMLElement =
      fixture.debugElement.nativeElement.querySelector('.mat-column-name');
    expect(nameHeader.getAttribute('aria-sort')).toBe('none');
  });

  it('navigates with the sort query param set once the debounce elapses after a header click', () => {
    vi.useFakeTimers();
    const fixture = createComponent();
    fixture.detectChanges();

    const nameSortHeader = fixture.debugElement.queryAll(By.directive(MatSortHeader))[0];
    nameSortHeader.triggerEventHandler('click', null);

    vi.advanceTimersByTime(400);

    expect(navigateSpy).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { sort: 'name:asc' },
      queryParamsHandling: 'merge',
    });
  });

  it('collapses rapid clicks into a single navigation with the final sort state', () => {
    vi.useFakeTimers();
    const fixture = createComponent();
    fixture.detectChanges();

    const nameSortHeader = fixture.debugElement.queryAll(By.directive(MatSortHeader))[0];
    // Cycles asc -> desc -> none (disableClear defaults to false), all within the debounce window.
    nameSortHeader.triggerEventHandler('click', null);
    nameSortHeader.triggerEventHandler('click', null);
    nameSortHeader.triggerEventHandler('click', null);

    vi.advanceTimersByTime(400);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith([], {
      relativeTo: expect.anything(),
      queryParams: { sort: null },
      queryParamsHandling: 'merge',
    });
  });
});
