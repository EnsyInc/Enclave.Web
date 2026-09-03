import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EnclavePageHeader } from '@enclave/core/components';

@Component({
  selector: 'enclave-organization-list',
  imports: [EnclavePageHeader],
  templateUrl: './organization-list.html',
  styleUrl: './organization-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationList {}
