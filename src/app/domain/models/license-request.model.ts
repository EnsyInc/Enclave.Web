import type { ValuesOf } from '@enclave/core';

export interface LicenseRequestModel {
  id: string;
  orgId: string;
  productId: string;
  userId: string;
  existingLicenseId?: string;
  requestNotes?: string;
  rejectionReason?: string;
  status: LicenseRequestStatus;
}

export const LICENSE_REQUEST_STATUSES = ['Pending', 'Approved', 'Rejected'] as const;
export type LicenseRequestStatus = ValuesOf<typeof LICENSE_REQUEST_STATUSES>;
