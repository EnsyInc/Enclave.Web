export interface OrganizationModel {
  id: string;
  name: string;
  status: OrganizationStatus;
  primaryUserId: string;
}

export const ORGANIZATION_STATUSES = ['Active', 'Deactivated'] as const;
export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];
