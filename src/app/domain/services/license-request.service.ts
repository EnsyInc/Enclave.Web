import { Service } from '@angular/core';

import { LicenseRequestModel } from '@enclave/domain/models';

@Service()
export class LicenseRequestService {
  // Org '1' carries a request in every status; org '6' intentionally has none.
  // existingLicenseId seeds line up with LicenseService's seeds for the same org/product
  // pair, representing a renewal/upgrade request against an already-active license.
  private readonly LICENSE_REQUEST_SEEDS: LicenseRequestModel[] = [
    {
      id: '1',
      orgId: '1',
      productId: '2',
      userId: '7',
      existingLicenseId: '2',
      requestNotes: 'Renewing before end of quarter.',
      status: 'Pending',
    },
    {
      id: '2',
      orgId: '1',
      productId: '1',
      userId: '1',
      requestNotes: 'New seat for onboarding cohort.',
      status: 'Approved',
    },
    {
      id: '3',
      orgId: '1',
      productId: '4',
      userId: '8',
      requestNotes: 'Evaluating Keyring CLI for CI rollout.',
      rejectionReason: 'Product still in Upcoming status; not available for general licensing yet.',
      status: 'Rejected',
    },
    {
      id: '4',
      orgId: '2',
      productId: '3',
      userId: '2',
      status: 'Pending',
    },
    {
      id: '5',
      orgId: '2',
      productId: '2',
      userId: '2',
      existingLicenseId: '10',
      requestNotes: 'Upgrade to unlimited seats ahead of renewal.',
      status: 'Approved',
    },
    {
      id: '6',
      orgId: '3',
      productId: '5',
      userId: '3',
      rejectionReason: 'Ledger Export has been retired.',
      status: 'Rejected',
    },
    {
      id: '7',
      orgId: '4',
      productId: '1',
      userId: '4',
      requestNotes: 'First license for new subsidiary team.',
      status: 'Pending',
    },
    {
      id: '8',
      orgId: '5',
      productId: '3',
      userId: '5',
      existingLicenseId: '13',
      status: 'Approved',
    },
  ];

  public getLicenseRequests(): LicenseRequestModel[] {
    return this.LICENSE_REQUEST_SEEDS.slice();
  }

  public getLicenseRequestById(id: string): LicenseRequestModel | undefined {
    return this.LICENSE_REQUEST_SEEDS.find((licenseRequest) => licenseRequest.id === id);
  }

  public getLicenseRequestsForOrg(orgId: string): LicenseRequestModel[] {
    return this.LICENSE_REQUEST_SEEDS.filter((licenseRequest) => licenseRequest.orgId === orgId);
  }
}
