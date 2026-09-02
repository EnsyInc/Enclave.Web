import { Component, input, signal } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'enclave-detail-row',
  imports: [MatDividerModule, MatTooltipModule],
  templateUrl: './enclave-detail-row.html',
  styleUrl: './enclave-detail-row.scss',
})
export class EnclaveDetailRow {
  public readonly label = input.required<string>();
  public readonly valueTooltip = input<string>();
  public readonly renderDivider = signal<boolean>(false);
}
