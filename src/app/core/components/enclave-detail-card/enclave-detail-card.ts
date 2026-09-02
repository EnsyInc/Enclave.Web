import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { EnsyLabsIcon, IconName } from '@enclave/core/icons';

@Component({
  selector: 'enclave-detail-card',
  imports: [MatCardModule, MatButtonModule, EnsyLabsIcon],
  templateUrl: './enclave-detail-card.html',
  styleUrl: './enclave-detail-card.scss',
})
export class EnclaveDetailCard {
  public readonly actionButtonText = input<string>();
  public readonly actionButtonIcon = input<IconName>();
  public readonly actionButtonClicked = output();
}
