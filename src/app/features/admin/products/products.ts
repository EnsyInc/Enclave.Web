import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { ProductModel } from '@enclave-core/models/product-model';
import { EnsyLabsIcon } from '@enclave/core/icons/ensy-labs-icon/ensy-labs-icon';
import { EnclaveStatus } from '@enclave/core/components/enclave-status/enclave-status';
import { EnclavePageHeader } from '@enclave/core/components/enclave-page-header/enclave-page-header';
import { EnclaveMoreActionsMenu } from '@enclave/core/components/enclave-more-actions-menu/enclave-more-actions-menu';
import { EnclaveSearchBarFilter } from '@enclave/core/components/enclave-search-bar-filter/enclave-search-bar-filter';
import { EnclaveAvatar } from '@enclave/core/components/enclave-avatar/enclave-avatar';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';

type ProductSeed = readonly [name: string, status: ProductModel['status'], description?: string];

const SORTABLE_COLUMNS = ['name', 'status'] as const;
type SortableColumns = (typeof SORTABLE_COLUMNS)[number];

const SORT_DIRECTIONS = ['asc', 'desc'] as const;
type SortDirection = (typeof SORT_DIRECTIONS)[number];

const PRODUCT_SEEDS: readonly ProductSeed[] = [
  [
    'Enclave Core',
    'Active',
    'Seat-based license engine with entitlement checks and offline grace periods.',
  ],
  [
    'Vault Analytics',
    'Active',
    'Usage telemetry and seat utilization reporting across every organization.',
  ],
  ['Perimeter SSO', 'Active', 'SAML and OIDC single sign-on for customer workspaces..'],
  [
    'Keyring CLI',
    'Upcoming',
    'Command-line tool for issuing, rotating and revoking license keys in CI.',
  ],
  [
    'Ledger Export',
    'Retired',
    'Scheduled CSV and Parquet exports of license events to object storage..',
  ],
  ['Beacon Alerts', 'Retired'],
];

function toProduct([name, status, description]: ProductSeed): ProductModel {
  return { id: crypto.randomUUID(), name, status, description };
}

@Component({
  selector: 'enclave-products',
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
  ],
  templateUrl: './products.html',
  styleUrl: './products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly productsList = input<ProductModel[]>(PRODUCT_SEEDS.map(toProduct));
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
    // Table filtering
    effect(() => {
      this.productsDataSource().filter = this.productSearch().searchText().toLowerCase();
    });
  }

  ngAfterViewInit(): void {
    this.productsDataSource().sort = this.productSort();
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
}
