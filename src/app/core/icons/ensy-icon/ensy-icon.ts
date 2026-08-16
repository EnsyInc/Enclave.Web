import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ensy-icon',
  imports: [MatIconModule],
  templateUrl: './ensy-icon.html',
  styleUrl: './ensy-icon.scss',
})
export class EnsyIcon {
  @Input({ required: true }) name: string = '';
  @Input() color?: string;
}
