import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';

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
import {
  LicenseRequestService,
  LicenseService,
  OrganizationService,
  ProductService,
  UserService,
} from '@enclave/domain/services';

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
    RouterLink,
  ],
  templateUrl: './license-details.html',
  styleUrl: './license-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LicenseDetails {
  private readonly licenseService = inject(LicenseService);
  private readonly licenseRequestService = inject(LicenseRequestService);
  private readonly productService = inject(ProductService);
  private readonly orgService = inject(OrganizationService);
  private readonly userService = inject(UserService);

  protected readonly licenseId = input.required<string>();

  protected readonly license = computed(() => {
    return this.licenseService.getLicenseById(this.licenseId())!;
  });
  protected readonly pendingLicenseRequest = computed(() => {
    const requests = this.licenseRequestService.getLicenseRequestsForLicense(this.licenseId());
    const pendingRequests = requests.filter((request) => request.status === 'Pending');
    if (pendingRequests.length === 0) {
      return undefined;
    }
    const licenseRequest = pendingRequests[0];
    const user = this.userService.getUserById(licenseRequest.userId);
    if (!user) {
      return undefined;
    }

    return {
      ...licenseRequest,
      userEmail: user.email,
    };
  });
  protected readonly product = computed(() => {
    return this.productService.getProductById(this.license().productId)!;
  });
  protected readonly org = computed(() => {
    return this.orgService.getOrganizationById(this.license().orgId)!;
  });
}
