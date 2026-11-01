export const SEED_ORDER = [
  "Location",
  "Manager",
  "Property",
  "Tenant",
  "Lease",
  "Application",
  "Payment",
] as const;

export type SeedModel = (typeof SEED_ORDER)[number];
