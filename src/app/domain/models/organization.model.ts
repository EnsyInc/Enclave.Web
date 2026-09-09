import type { ValuesOf } from '@enclave/core';

export interface OrganizationModel {
  id: string;
  name: string;
  status: OrganizationStatus;
  primaryUserId: string;
}

export const ORGANIZATION_STATUSES = ['Active', 'Deactivated'] as const;
export type OrganizationStatus = ValuesOf<typeof ORGANIZATION_STATUSES>;
