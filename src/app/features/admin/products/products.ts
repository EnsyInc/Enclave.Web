import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { ProductModel } from '@enclave-core/models/product-model';
import { EnsyLabsIcon } from '@enclave/core/icons/ensy-labs-icon/ensy-labs-icon';
import { EnclaveStatus } from '@enclave/core/components/enclave-status/enclave-status';
import { EnclavePageHeader } from '@enclave/core/components/enclave-page-header/enclave-page-header';
import { EnclaveTableRowAction } from '@enclave/core/components/enclave-table-row-action/enclave-table-row-action';
import { EnclaveSearchBarFilter } from '@enclave/core/components/enclave-search-bar-filter/enclave-search-bar-filter';
import { EnclaveAvatar } from "@enclave/core/components/enclave-avatar/enclave-avatar";

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
    EnclavePageHeader,
    EnclaveSearchBarFilter,
    EnclaveStatus,
    EnclaveTableRowAction,
    MatSortModule,
    EnclaveAvatar
],
  templateUrl: './products.html',
  styleUrl: './products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products implements AfterViewInit {
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
  protected readonly productSearch = viewChild.required(EnclaveSearchBarFilter);

  constructor() {
    // Table filtering
    effect(() => {
      this.productsDataSource().filter = this.productSearch().searchText().toLowerCase();
    });
  }

  ngAfterViewInit(): void {
    this.productsDataSource().sort = this.productSort();
  }
}
