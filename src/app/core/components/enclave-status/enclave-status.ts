import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { ValuesOf } from '@enclave/core/types/values-of';

import { EnsyLabsIcon } from '@enclave/core/icons';
import { ORGANIZATION_STATUSES, PRODUCT_STATUSES, USER_STATUSES } from '@enclave/domain/models';

export const ENCLAVE_STATUSES = [
  ...new Set([...ORGANIZATION_STATUSES, ...PRODUCT_STATUSES, ...USER_STATUSES] as const),
] as const;
export type EnclaveStatusValues = ValuesOf<typeof ENCLAVE_STATUSES>;

function assertUnhandledStatus(status: never): never {
  throw new Error(`Unknown status value '${String(status)}'.`);
}

@Component({
  host: { '[class]': 'getStatusCssClass()' },
  selector: 'enclave-status',
  imports: [EnsyLabsIcon],
  templateUrl: './enclave-status.html',
  styleUrl: './enclave-status.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnclaveStatus {
  public readonly status = input.required<EnclaveStatusValues>();

  protected getStatusCssClass(): string {
    const status = this.status();
    switch (status) {
      case 'Active':
        return 'active';
      case 'Deactivated':
        return 'deactivated';
      case 'InviteSent':
        return 'invite-sent';
      case 'Retired':
        return 'retired';
      case 'Upcoming':
        return 'upcoming';
      default:
        return assertUnhandledStatus(status);
    }
  }

  protected getStatusDisplayName(): string {
    const status = this.status();
    switch (status) {
      case 'Active':
        return 'Active';
      case 'Deactivated':
        return 'Deactivated';
      case 'InviteSent':
        return 'Invite Sent';
      case 'Retired':
        return 'Retired';
      case 'Upcoming':
        return 'Upcoming';
      default:
        return assertUnhandledStatus(status);
    }
  }
}
