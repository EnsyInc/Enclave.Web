import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatTabGroup, MatTab } from '@angular/material/tabs';

import {
  EnclaveDetailsHeader,
  EnclaveDetailCard,
  EnclaveDetailList,
  EnclaveDetailRow,
  EnclaveStatus,
} from '@enclave/core/components';
import { EnclavePersistentTab } from '@enclave/core/directives';
import { OrganizationService, UserService } from '@enclave/domain/services';

@Component({
  selector: 'enclave-organization-details',
  imports: [
    EnclaveDetailCard,
    EnclaveDetailList,
    EnclaveDetailRow,
    EnclaveDetailsHeader,
    EnclavePersistentTab,
    EnclaveStatus,
    MatTab,
    MatTabGroup,
  ],
  templateUrl: './organization-details.html',
  styleUrl: './organization-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationDetails {
  private readonly orgService = inject(OrganizationService);
  private readonly userService = inject(UserService);

  protected readonly organizationId = input.required<string>();
  protected readonly org = computed(() => {
    return this.orgService.getOrganizationById(this.organizationId())!;
  });
  protected readonly primaryContact = computed(() => {
    return this.userService.getUserById(this.org().primaryUserId);
  });
}
