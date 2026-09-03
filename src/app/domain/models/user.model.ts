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
export type UserStatus = (typeof USER_STATUSES)[number];

export const USER_ROLES = ['Reader', 'Admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];
