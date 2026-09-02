import { Component, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'enclave-detail-row',
  imports: [MatTooltipModule],
  templateUrl: './enclave-detail-row.html',
  styleUrl: './enclave-detail-row.scss',
})
export class EnclaveDetailRow {
  public readonly label = input.required<string>();
  public readonly valueTooltip = input<string>();
}
