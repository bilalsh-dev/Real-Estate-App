import type { PropertyFormData } from "@/lib/schemas";

export const PHOTOS_FIELD = "photos";

export function toPropertyFormData(data: PropertyFormData): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data) as [string, unknown][]) {
    if (key === PHOTOS_FIELD) {
      for (const photo of value as File[]) formData.append(PHOTOS_FIELD, photo);
    } else if (Array.isArray(value)) {
      formData.append(key, value.join(","));
    } else {
      formData.append(key, String(value));
    }
  }
  return formData;
}
