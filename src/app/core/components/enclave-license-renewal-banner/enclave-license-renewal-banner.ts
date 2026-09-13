import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

import { EnsyLabsIcon } from '@enclave/core/icons';
import { LicenseRequestModel, UserModel } from '@enclave/domain/models';

@Component({
  selector: 'enclave-license-renewal-banner',
  imports: [EnsyLabsIcon, MatButtonModule, RouterLink],
  templateUrl: './enclave-license-renewal-banner.html',
  styleUrl: './enclave-license-renewal-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnclaveLicenseRenewalBanner {
  public readonly licenseRequest = input.required<LicenseRequestModel>();
  public readonly user = input.required<UserModel>();
}
