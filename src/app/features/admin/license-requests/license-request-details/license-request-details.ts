import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';

import {
  EnclaveDetailsHeader,
  EnclaveDetailCard,
  EnclaveDetailList,
  EnclaveDetailRow,
  EnclaveStatus,
} from '@enclave/core/components';
import { EnsyLabsIcon } from '@enclave/core/icons';
import {
  LicenseService,
  LicenseRequestService,
  ProductService,
  OrganizationService,
  UserService,
} from '@enclave/domain/services';

@Component({
  selector: 'enclave-license-request-details',
  imports: [
    EnclaveDetailCard,
    EnclaveDetailList,
    EnclaveDetailRow,
    EnclaveDetailsHeader,
    EnclaveStatus,
    EnsyLabsIcon,
    MatButtonModule,
    MatDivider,
    MatTabsModule,
    RouterLink,
  ],
  templateUrl: './license-request-details.html',
  styleUrl: './license-request-details.scss',
})
export class LicenseRequestDetails {
  private readonly licenseService = inject(LicenseService);
  private readonly licenseRequestService = inject(LicenseRequestService);
  private readonly productService = inject(ProductService);
  private readonly orgService = inject(OrganizationService);
  private readonly userService = inject(UserService);

  protected readonly licenseRequestId = input.required<string>();
  protected readonly licenseRequest = computed(() => {
    return this.licenseRequestService.getLicenseRequestById(this.licenseRequestId())!;
  });
  protected readonly product = computed(() => {
    return this.productService.getProductById(this.licenseRequest().productId)!;
  });
  protected readonly org = computed(() => {
    return this.orgService.getOrganizationById(this.licenseRequest().orgId)!;
  });
  protected readonly user = computed(() => {
    return this.userService.getUserById(this.licenseRequest().userId)!;
  });
  protected readonly license = computed(() => {
    const licenseId = this.licenseRequest().existingLicenseId;
    if (!licenseId) {
      return undefined;
    }
    return this.licenseService.getLicenseById(licenseId);
  });
}
