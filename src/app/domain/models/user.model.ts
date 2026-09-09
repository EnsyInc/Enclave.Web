import type { ValuesOf } from '@enclave/core';

export interface UserModel {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organizationId: string;
  status: UserStatus;
  role: UserRole;
}

export const USER_STATUSES = ['InviteSent', 'Active', 'Deactivated'] as const;
export type UserStatus = ValuesOf<typeof USER_STATUSES>;

export const USER_ROLES = ['Reader', 'Admin'] as const;
export type UserRole = ValuesOf<typeof USER_ROLES>;
