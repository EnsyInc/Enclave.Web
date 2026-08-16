import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'enclave-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {}
