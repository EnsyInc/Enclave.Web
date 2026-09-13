import { Component, input } from '@angular/core';

@Component({
  selector: 'enclave-license-request-details',
  imports: [],
  templateUrl: './license-request-details.html',
  styleUrl: './license-request-details.scss',
})
export class LicenseRequestDetails {
  protected readonly licenseRequestsId = input.required<string>();
}
