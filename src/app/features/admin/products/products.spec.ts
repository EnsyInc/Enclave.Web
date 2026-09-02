import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { MatSortHeader } from '@angular/material/sort';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ProductModel } from '@enclave/core/models/product.model';
import { EnclavePageHeader } from '@enclave/core/components/enclave-page-header/enclave-page-header';
import { ProductsService } from '@enclave/core/services/products.service';
import { ProductFormOverlayService } from '@enclave/features/admin/product-form-overlay/product-form-overlay.service';
import { ConfirmationDialogService } from '@enclave/core/components/confirmation-dialog/confirmation-dialog.service';

import { Products } from './products';

const customProducts: ProductModel[] = [
  { id: '1', name: 'Alpha', description: 'First product', status: 'Active' },
  { id: '2', name: 'Beta', description: 'Second product', status: 'Retired' },
  { id: '3', name: 'Gamma', status: 'Upcoming' },
];

// Deliberately NOT alphabetical, and its name-order differs from its status-order.
// customProducts (Alpha/Beta/Gamma) is already alphabetical by insertion order, so
// asserting row order against it can't distinguish "actually sorted" from "coincidentally
// already in order" -- exactly the gap that let a disconnected MatTableDataSource.sort
// ship without a failing unit test (only caught by e2e, which uses real, unordered seed data).
const unsortedProducts: ProductModel[] = [
  { id: '1', name: 'Zeta', status: 'Retired' },
  { id: '2', name: 'Mu', status: 'Upcoming' },
  { id: '3', name: 'Alpha', status: 'Active' },
];

function rowNames(fixture: ComponentFixture<Products>): (string | undefined)[] {
  return Array.from(
    fixture.debugElement.nativeElement.querySelectorAll('tr[mat-row] .product-name a'),
  ).map((el) => (el as HTMLElement).textContent?.trim());
}

interface FixtureOptions {
  products?: ProductModel[];
  queryParams?: Record<string, string>;
  router?: { navigate: ReturnType<typeof vi.fn> };
  productFormOverlay?: Pick<ProductFormOverlayService, 'openCreate' | 'openEdit'>;
  confirmDialog?: Pick<ConfirmationDialogService, 'open'>;
}

function createFixture(options: FixtureOptions = {}): ComponentFixture<Products> {
  TestBed.configureTestingModule({
    imports: [Products],
    providers: [
      options.router ? { provide: Router, useValue: options.router } : provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { queryParamMap: convertToParamMap(options.queryParams ?? {}) },
          // EnclaveSearchBarFilter, nested in the template, subscribes to this stream directly.
          queryParamMap: of(convertToParamMap({})),
        },
      },
      {
        provide: ProductsService,
        useValue: { getProducts: () => options.products ?? customProducts },
      },
      {
        provide: ProductFormOverlayService,
        useValue: options.productFormOverlay ?? { openCreate: vi.fn(), openEdit: vi.fn() },
      },
      {
        provide: ConfirmationDialogService,
        useValue: options.confirmDialog ?? { open: vi.fn().mockReturnValue(of(false)) },
      },
    ],
  });

  return TestBed.createComponent(Products);
}

describe('Products', () => {
  it('should create', async () => {
    const fixture = createFixture();
    await fixture.whenStable();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows the total and active product counts in the page header subtitle', async () => {
    const fixture = createFixture({ products: customProducts });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const header = fixture.debugElement.query(By.directive(EnclavePageHeader))
      .componentInstance as EnclavePageHeader;
    expect(header.subTitle()).toBe('3 in the catalogue - 1 active');
  });

  it('marks the name column as sorted ascending when its header is clicked', async () => {
    const fixture = createFixture();
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

  it('actually reorders the rows alphabetically by name when the header is clicked', async () => {
    // Regression test: the header's aria-sort can flip to "ascending" while the table's
    // MatTableDataSource is a completely different, unconnected instance (happens whenever
    // .sort is assigned before productsList/productsDataSource has its real data) -- so this
    // asserts the rendered row order itself, not just the header's own ARIA state.
    const fixture = createFixture({ products: unsortedProducts });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(rowNames(fixture)).toEqual(['Zeta', 'Mu', 'Alpha']);

    const nameSortHeader = fixture.debugElement.queryAll(By.directive(MatSortHeader))[0];
    nameSortHeader.triggerEventHandler('click', null);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(rowNames(fixture)).toEqual(['Alpha', 'Mu', 'Zeta']);
  });

  it('renders a table row for every product', async () => {
    const fixture = createFixture();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const rows: NodeListOf<HTMLElement> =
      fixture.debugElement.nativeElement.querySelectorAll('tr[mat-row]');
    expect(rows).toHaveLength(3);
  });

  it('shows a fallback message for a product with no description', async () => {
    const fixture = createFixture();
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
    const fixture = createFixture();
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
    const fixture = createFixture();
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
    const fixture = createFixture({ products: [] });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const noDataCell: HTMLElement = fixture.debugElement.nativeElement.querySelector('.mat-cell');
    expect(noDataCell.textContent).toContain(
      'No products yet. Press the "Create Product" button above to add one.',
    );
  });

  describe('Create Product action', () => {
    it('opens the create-product dialog when the header action button is clicked', async () => {
      const openCreate = vi.fn();
      const fixture = createFixture({ productFormOverlay: { openCreate, openEdit: vi.fn() } });
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const createButton: HTMLButtonElement =
        fixture.debugElement.nativeElement.querySelector('.header-right button');
      createButton.click();

      expect(openCreate).toHaveBeenCalledOnce();
    });
  });

  describe('row actions', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('opens the product form dialog pre-filled with the row product on Edit', async () => {
      const openEdit = vi.fn();
      const fixture = createFixture({ productFormOverlay: { openCreate: vi.fn(), openEdit } });
      fixture.detectChanges();
      await fixture.whenStable();

      fixture.componentInstance['openEditProductFormDialog'](customProducts[0]);

      expect(openEdit).toHaveBeenCalledExactlyOnceWith(customProducts[0]);
    });

    it('links the product name to its detail route', async () => {
      const fixture = createFixture();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const nameLink: HTMLAnchorElement =
        fixture.debugElement.nativeElement.querySelector('.product-name a');
      expect(nameLink.getAttribute('href')).toBe('/admin/products/1');
    });

    it('opens the confirmation dialog with the product name on Delete', async () => {
      const open = vi.fn().mockReturnValue(of(false));
      const fixture = createFixture({ confirmDialog: { open } });
      fixture.detectChanges();
      await fixture.whenStable();

      fixture.componentInstance['openDeleteProductDialog'](customProducts[0]);

      expect(open).toHaveBeenCalledExactlyOnceWith({
        action: 'Delete',
        title: 'Delete "Alpha"',
        message:
          'Are you sure you want to delete "<span class="highlight">Alpha</span>"? ' +
          "This can't be undone.",
        confirmLabel: 'Delete',
      });
    });

    it('logs the deletion once the user confirms (stubbed until real delete is wired up)', async () => {
      const open = vi.fn().mockReturnValue(of(true));
      const fixture = createFixture({ confirmDialog: { open } });
      fixture.detectChanges();
      await fixture.whenStable();
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      fixture.componentInstance['openDeleteProductDialog'](customProducts[0]);

      expect(logSpy).toHaveBeenCalledWith('Product deleted');
    });

    it('does nothing when the user cancels the confirmation dialog', async () => {
      const open = vi.fn().mockReturnValue(of(false));
      const fixture = createFixture({ confirmDialog: { open } });
      fixture.detectChanges();
      await fixture.whenStable();
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      fixture.componentInstance['openDeleteProductDialog'](customProducts[0]);

      expect(logSpy).not.toHaveBeenCalled();
    });
  });
});

describe('Products sort query param persistence', () => {
  let navigateSpy: ReturnType<typeof vi.fn>;

  function createComponent(
    initialQueryParams: Record<string, string> = {},
  ): ComponentFixture<Products> {
    navigateSpy = vi.fn().mockResolvedValue(true);

    return createFixture({
      products: unsortedProducts,
      queryParams: initialQueryParams,
      router: { navigate: navigateSpy },
    });
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
    expect(rowNames(fixture)).toEqual(['Alpha', 'Mu', 'Zeta']);
  });

  it('restores descending sort on the status column from the sort query param', async () => {
    const fixture = createComponent({ sort: 'status:desc' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const statusHeader: HTMLElement =
      fixture.debugElement.nativeElement.querySelector('.mat-column-status');
    expect(statusHeader.getAttribute('aria-sort')).toBe('descending');
    expect(rowNames(fixture)).toEqual(['Mu', 'Zeta', 'Alpha']);
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
