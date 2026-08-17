import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EnsyLabsIcon } from "@enclave/core/icons/ensy-labs-icon/ensy-labs-icon";

@Component({
  selector: 'enclave-status',
  imports: [
    EnsyLabsIcon
  ],
  templateUrl: './status.html',
  styleUrl: './status.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnclaveStatus {
}
