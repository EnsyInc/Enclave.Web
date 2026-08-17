import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { ProductModel } from '@enclave-core/models/product-model';
import { EnsyLabsIcon } from '@enclave/core/icons/ensy-labs-icon/ensy-labs-icon';
import { EnclaveStatus } from '@enclave/core/components/enclave-status/enclave-status';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

type ProductSeed = readonly [name: string, status: ProductModel['status'], description?: string];

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
    EnclaveStatus,
    MatSortModule,
  ],
  templateUrl: './products.html',
  styleUrl: './products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products implements AfterViewInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly productsList = input<ProductModel[]>(PRODUCT_SEEDS.map(toProduct));
  protected readonly productsCount = computed(() => this.productsList().length);
  protected readonly activeProductsCount = computed(
    () => this.productsList().filter((p) => p.status === 'Active').length,
  );
  protected readonly productsDataSource = computed(
    () => new MatTableDataSource(this.productsList()),
  );
  protected readonly productSort = viewChild(MatSort);
  protected readonly displayedColumns = ['name', 'description', 'status', 'action'];
  protected readonly searchTerm = signal('');
  private readonly searchInput$ = new Subject<string>();

  constructor() {
    // Initial state load from URL and responsiveness to url changes
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.searchTerm.set(params.get('search') ?? '');
    });

    // Table filtering
    effect(() => {
      this.productsDataSource().filter = this.searchTerm().trim().toLowerCase();
    });

    // SearchInput => navigation (after debounce)
    this.searchInput$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((search) => {
        if (search !== this.searchTerm()) {
          return;
        }

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            search: search || null,
          },
          queryParamsHandling: 'merge',
        });
      });
  }

  ngAfterViewInit(): void {
    this.productsDataSource().sort = this.productSort();
  }

  protected applyProductFilter(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    this.searchTerm.set(inputValue);
    this.searchInput$.next(inputValue);
  }
}
