import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { ProductModel } from '@enclave/domain/models';
import { ProductsService } from '@enclave/domain/services';
import { EnsyLabsIcon } from '@enclave/core/icons';
import {
  ConfirmationDialogService,
  EnclaveAvatar,
  EnclaveMoreActionsMenu,
  EnclavePageHeader,
  EnclaveSearchBarFilter,
  EnclaveStatus,
} from '@enclave/core/components';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { ProductFormService } from '@enclave/features/admin/products/product-form/product-form.service';

const SORTABLE_COLUMNS = ['name', 'status'] as const;
type SortableColumns = (typeof SORTABLE_COLUMNS)[number];

const SORT_DIRECTIONS = ['asc', 'desc'] as const;
type SortDirection = (typeof SORT_DIRECTIONS)[number];

@Component({
  selector: 'enclave-product-list',
  imports: [
    MatButtonModule,
    MatInputModule,
    MatMenuModule,
    MatTableModule,
    EnsyLabsIcon,
    EnclavePageHeader,
    EnclaveSearchBarFilter,
    EnclaveStatus,
    EnclaveMoreActionsMenu,
    MatSortModule,
    EnclaveAvatar,
    RouterLink,
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductList implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly productsService = inject(ProductsService);
  private readonly productForm = inject(ProductFormService);
  private readonly confirmDialog = inject(ConfirmationDialogService);

  protected readonly productsList = signal<ProductModel[]>([]);
  protected readonly productsCount = computed(() => this.productsList().length);
  protected readonly activeProductsCount = computed(
    () => this.productsList().filter((p) => p.status === 'Active').length,
  );
  protected readonly productsDataSource = computed(
    () => new MatTableDataSource(this.productsList()),
  );
  protected readonly productSort = viewChild.required(MatSort);
  protected readonly displayedColumns = ['name', 'description', 'status', 'action'];
  protected readonly productSearch = viewChild.required(EnclaveSearchBarFilter);

  constructor() {
    effect(() => {
      this.productsDataSource().filter = this.productSearch().searchText().toLowerCase();
      this.productsDataSource().sort = this.productSort();
    });
  }

  ngAfterViewInit(): void {
    const restoredSort = this.parseSortQueryParam();
    if (restoredSort) {
      queueMicrotask(() => {
        this.productSort().sort({
          id: restoredSort.column,
          start: restoredSort.direction,
          disableClear: false,
        });
      });
    }

    this.productSort()
      .sortChange.pipe(debounceTime(400), takeUntilDestroyed(this.destroyRef))
      .subscribe((sort) => {
        this.router.navigate([], {
          relativeTo: this.activatedRoute,
          queryParams: { sort: this.buildSortQueryParam(sort) },
          queryParamsHandling: 'merge',
        });
      });

    this.populateProducts();
  }

  private populateProducts(): void {
    this.productsList.set(this.productsService.getProducts());
  }

  // e.g. "?sort=name:asc" <-> { column: 'name', direction: 'asc' }
  private parseSortQueryParam(): { column: SortableColumns; direction: SortDirection } | undefined {
    const sortParam = this.activatedRoute.snapshot.queryParamMap.get('sort');
    const [rawColumn, rawDirection, ...extra] = sortParam?.split(':') ?? [];
    if (!rawColumn || !rawDirection || extra.length > 0) {
      return undefined;
    }

    const column = this.parseSortColumn(rawColumn.trim().toLowerCase());
    const direction = this.parseSortDirection(rawDirection.trim().toLowerCase());
    return column && direction ? { column, direction } : undefined;
  }

  private buildSortQueryParam(sort: Sort): string | null {
    return sort.active && sort.direction ? `${sort.active}:${sort.direction}` : null;
  }

  private parseSortColumn(column: string): SortableColumns | undefined {
    return SORTABLE_COLUMNS.find((c) => c === column);
  }

  private parseSortDirection(direction: string): SortDirection | undefined {
    return SORT_DIRECTIONS.find((d) => d === direction);
  }

  protected openCreateProductFormDialog(): void {
    this.productForm.openCreate();
  }

  protected openEditProductFormDialog(product: ProductModel): void {
    this.productForm.openEdit(product);
  }

  protected openDeleteProductDialog(product: ProductModel): void {
    this.confirmDialog
      .open({
        action: 'Delete',
        title: `Delete "${product.name}"`,
        message: `Are you sure you want to delete "<span class="highlight">${product.name}</span>"? This can't be undone.`,
        confirmLabel: 'Delete',
      })
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        console.log('Product deleted');
      });
  }
}
