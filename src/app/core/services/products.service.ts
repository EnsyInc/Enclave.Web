import { Service } from '@angular/core';
import { ProductModel } from '@enclave/core/models/product.model';

@Service()
export class ProductsService {
  private readonly PRODUCT_SEEDS: ProductModel[] = [
    {
      id: '1',
      name: 'Enclave Core',
      status: 'Active',
      description: 'Seat-based license engine with entitlement checks and offline grace periods.',
    },
    {
      id: '2',
      name: 'Vault Analytics',
      status: 'Active',
      description: 'Usage telemetry and seat utilization reporting across every organization.',
    },
    {
      id: '3',
      name: 'Perimeter SSO',
      status: 'Active',
      description: 'SAML and OIDC single sign-on for customer workspaces..',
    },
    {
      id: '4',
      name: 'Keyring CLI',
      status: 'Upcoming',
      description: 'Command-line tool for issuing, rotating and revoking license keys in CI.',
    },
    {
      id: '5',
      name: 'Ledger Export',
      status: 'Retired',
      description: 'Scheduled CSV and Parquet exports of license events to object storage..',
    },
    {
      id: '6',
      name: 'Beacon Alerts',
      status: 'Retired',
    },
  ];

  public getProducts(): ProductModel[] {
    return this.PRODUCT_SEEDS.slice();
  }

  public getProductById(id: string): ProductModel | undefined {
    return this.PRODUCT_SEEDS.find((product) => product.id === id);
  }
}
