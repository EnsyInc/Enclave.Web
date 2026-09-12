import type { ValuesOf } from '@enclave/core';

export interface LicenseModel {
  id: string;
  orgId: string;
  productId: string;
  start: Date;
  end: Date;
  status: LicenseStatus;
}

export const LICENSE_STATUSES = ['Scheduled', 'Active', 'Expired', 'Suspended', 'Revoked'] as const;
export type LicenseStatus = ValuesOf<typeof LICENSE_STATUSES>;
