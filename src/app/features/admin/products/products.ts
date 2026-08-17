import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { ProductModel } from '@enclave-core/models/product-model';
import { EnsyLabsIcon } from '@enclave/core/icons/ensy-labs-icon/ensy-labs-icon';
import { EnclaveStatus } from '@enclave/core/components/status/status';

@Component({
  selector: 'enclave-products',
  imports: [
    MatButtonModule, 
    MatInputModule,
    MatTableModule, 
    EnsyLabsIcon,
    EnclaveStatus,
  ],
  templateUrl: './products.html',
  styleUrl: './products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  readonly productsList = input<ProductModel[]>([
    {
      id: crypto.randomUUID(),
      name: 'Enclave Core',
      description: 'Seat-based license engine with entitlement checks and offline grace periods.',
      status: 'Active',
    },
    {
      id: crypto.randomUUID(),
      name: 'Vault Analytics',
      description: 'Usage telemetry and seat utilization reporting across every organization.',
      status: 'Active',
    },
    {
      id: crypto.randomUUID(),
      name: 'Perimeter SSO',
      description: 'SAML and OIDC single sign-on for customer workspaces..',
      status: 'Active',
    },
    {
      id: crypto.randomUUID(),
      name: 'Keyring CLI',
      description: 'Command-line tool for issuing, rotating and revoking license keys in CI.',
      status: 'Upcoming',
    },
    {
      id: crypto.randomUUID(),
      name: 'Ledger Export',
      description: 'Scheduled CSV and Parquet exports of license events to object storage..',
      status: 'Retired',
    },
    {
      id: crypto.randomUUID(),
      name: 'Beacon Alerts',
      status: 'Retired',
    },
  ]);
  readonly productsCount = computed(() => this.productsList().length);
  readonly activeProductsCount = computed(
    () => this.productsList().filter((p) => p.status === 'Active').length,
  );
  readonly displayedColumns = ['name', 'description', 'status', 'action']
}
