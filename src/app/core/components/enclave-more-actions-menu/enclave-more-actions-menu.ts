import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { EnsyLabsIcon } from '@enclave/core/icons/ensy-labs-icon/ensy-labs-icon';

@Component({
  selector: 'enclave-more-actions-menu',
  imports: [EnsyLabsIcon, MatMenuModule, MatButtonModule],
  templateUrl: './enclave-more-actions-menu.html',
  styleUrl: './enclave-more-actions-menu.scss',
})
export class EnclaveMoreActionsMenu {
  public readonly elementName = input.required<string>();
}
