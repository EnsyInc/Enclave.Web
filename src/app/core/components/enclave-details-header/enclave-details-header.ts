import { Component, input } from '@angular/core';

import { EnclaveAvatar } from '@enclave/core/components/enclave-avatar/enclave-avatar';
import {
  EnclaveStatus,
  EnclaveStatusValues,
} from '@enclave/core/components/enclave-status/enclave-status';

@Component({
  selector: 'enclave-details-header',
  imports: [EnclaveAvatar, EnclaveStatus],
  templateUrl: './enclave-details-header.html',
  styleUrl: './enclave-details-header.scss',
})
export class EnclaveDetailsHeader {
  public readonly title = input.required<string>();
  public readonly showTitleAvatar = input<boolean>(false);
  public readonly status = input<EnclaveStatusValues>();
  public readonly subTitle = input<string>();
}
