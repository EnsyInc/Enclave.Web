import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { EnsyLabsIcon, IconName } from '@enclave/core/icons';

@Component({
  selector: 'enclave-page-header',
  imports: [EnsyLabsIcon, MatButtonModule],
  templateUrl: './enclave-page-header.html',
  styleUrl: './enclave-page-header.scss',
})
export class EnclavePageHeader {
  public readonly title = input.required<string>();
  public readonly subTitle = input.required<string>();
  public readonly actionIcon = input<IconName>();
  public readonly actionText = input<string>();

  public readonly actionButtonClick = output();
}
