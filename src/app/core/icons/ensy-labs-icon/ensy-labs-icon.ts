import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IconName } from '@enclave/core/icons/icon-registry.service';

@Component({
  selector: 'ensy-labs-icon',
  imports: [MatIconModule],
  templateUrl: './ensy-labs-icon.html',
  styleUrl: './ensy-labs-icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnsyLabsIcon {
  readonly name = input.required<IconName>();
}
