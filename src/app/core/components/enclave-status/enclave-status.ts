import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { EnsyLabsIcon, IconName } from '@enclave/core/icons';

@Component({
  selector: 'enclave-status',
  imports: [EnsyLabsIcon],
  templateUrl: './enclave-status.html',
  styleUrl: './enclave-status.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnclaveStatus {
  protected readonly iconName = input<IconName>(IconName.Dot);
}
