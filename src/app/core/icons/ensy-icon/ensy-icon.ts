import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ensy-icon',
  imports: [MatIconModule],
  templateUrl: './ensy-icon.html',
  styleUrl: './ensy-icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnsyIcon {
  readonly name = input.required<string>();
  readonly color = input<string>();
}
