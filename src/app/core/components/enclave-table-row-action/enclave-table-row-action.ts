import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { EnsyLabsIcon } from '@enclave/core/icons/ensy-labs-icon/ensy-labs-icon';

@Component({
  selector: 'enclave-table-row-action',
  imports: [EnsyLabsIcon, MatMenuModule, MatButtonModule],
  templateUrl: './enclave-table-row-action.html',
  styleUrl: './enclave-table-row-action.scss',
})
export class EnclaveTableRowAction {
  public readonly elementName = input.required<string>();
}
