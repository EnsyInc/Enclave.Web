import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'enclave-license-list',
  imports: [],
  templateUrl: './license-list.html',
  styleUrl: './license-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LicenseList {}
