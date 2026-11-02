export const Role = {
  Tenant: "tenant",
  Manager: "manager",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ROLE_CLAIM = "custom:role";

export const SEARCH_RADIUS_METERS = 1_000_000;

export const LEASE_TERM_YEARS = 1;

export const PHOTO_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export const MAX_PHOTOS_PER_PROPERTY = 10;
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
export const PROPERTY_PHOTO_KEY_PREFIX = "properties/";

export const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";
export const GEOCODER_USER_AGENT = "Rentiful/1.0 (+https://github.com/bilalsh-dev/Real-Estate-App)";
