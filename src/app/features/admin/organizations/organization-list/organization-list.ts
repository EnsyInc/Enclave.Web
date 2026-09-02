import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'enclave-organization-list',
  imports: [],
  templateUrl: './organization-list.html',
  styleUrl: './organization-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationList {}
