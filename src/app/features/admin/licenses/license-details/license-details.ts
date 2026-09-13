import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

import {
  EnclaveDetailsHeader,
  EnclaveDetailCard,
  EnclaveDetailList,
  EnclaveDetailRow,
  EnclaveStatus,
  EnclaveTimeLeft,
} from '@enclave/core/components';
import { EnclavePersistentTab } from '@enclave/core/directives';
import { EnsyLabsIcon } from '@enclave/core/icons';
import { LicenseService, OrganizationService, ProductService } from '@enclave/domain/services';

@Component({
  selector: 'enclave-license-details',
  imports: [
    DatePipe,
    EnclaveDetailCard,
    EnclaveDetailList,
    EnclaveDetailRow,
    EnclaveDetailsHeader,
    EnclavePersistentTab,
    EnclaveStatus,
    EnclaveTimeLeft,
    EnsyLabsIcon,
    MatButtonModule,
    MatTabsModule,
  ],
  templateUrl: './license-details.html',
  styleUrl: './license-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LicenseDetails {
  private readonly licenseService = inject(LicenseService);
  private readonly productService = inject(ProductService);
  private readonly orgService = inject(OrganizationService);

  protected readonly licenseId = input.required<string>();

  protected readonly license = computed(() => {
    return this.licenseService.getLicenseById(this.licenseId())!;
  });
  protected readonly product = computed(() => {
    return this.productService.getProductById(this.license().productId)!;
  });
  protected readonly org = computed(() => {
    return this.orgService.getOrganizationById(this.license().orgId)!;
  });
}
