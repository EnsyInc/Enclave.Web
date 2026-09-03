import { Component, computed, inject, input } from '@angular/core';

import { EnclaveAvatar, EnclaveStatus } from '@enclave/core/components';
import { OrganizationService, UserService } from '@enclave/domain/services';

@Component({
  selector: 'enclave-organization-details',
  imports: [EnclaveAvatar, EnclaveStatus],
  templateUrl: './organization-details.html',
  styleUrl: './organization-details.scss',
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
