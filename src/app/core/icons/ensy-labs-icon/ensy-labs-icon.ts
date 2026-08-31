import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ensy-labs-icon',
  imports: [MatIconModule],
  templateUrl: './ensy-labs-icon.html',
  styleUrl: './ensy-labs-icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnsyLabsIcon {
  readonly name = input.required<string>();
}
