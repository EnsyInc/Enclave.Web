import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  viewChild,
} from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { ProductModel } from '@enclave-core/models/product-model';
import { EnsyLabsIcon } from '@enclave/core/icons/ensy-labs-icon/ensy-labs-icon';
import { EnclaveStatus } from '@enclave/core/components/enclave-status/enclave-status';

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
  readonly productsList = input<ProductModel[]>(PRODUCT_SEEDS.map(toProduct));
  readonly productsCount = computed(() => this.productsList().length);
  readonly activeProductsCount = computed(
    () => this.productsList().filter((p) => p.status === 'Active').length,
  );
  readonly productsDataSource = computed(() => new MatTableDataSource(this.productsList()));
  readonly productSort = viewChild(MatSort);
  readonly displayedColumns = ['name', 'description', 'status', 'action'];

  ngAfterViewInit(): void {
    this.productsDataSource().sort = this.productSort();
  }

  protected applyProductFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.productsDataSource().filter = filterValue.trim().toLowerCase();
  }
}
