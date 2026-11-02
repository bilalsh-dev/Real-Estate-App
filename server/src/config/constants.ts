export const Role = {
  Tenant: "tenant",
  Manager: "manager",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ROLE_CLAIM = "custom:role";
