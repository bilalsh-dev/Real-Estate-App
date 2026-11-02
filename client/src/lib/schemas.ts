import { z } from "zod";
import {
  Amenity,
  Highlight,
  MAX_PHOTO_SIZE_BYTES,
  MAX_PHOTOS_PER_PROPERTY,
  PHOTO_MIME_TYPES,
  PropertyType,
} from "@/lib/constants";

const MIN_PHONE_DIGITS = 10;
const MAX_ROOMS = 10;

const requiredString = (label: string) => z.string().trim().min(1, `${label} is required`);

const MAX_PHONE_LENGTH = 32;
const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 2000;

const phoneNumber = z
  .string()
  .trim()
  .min(MIN_PHONE_DIGITS, `Phone number must be at least ${MIN_PHONE_DIGITS} digits`)
  .max(MAX_PHONE_LENGTH)
  .regex(/^[+\d\s().-]*$/, "Phone number may only contain digits, spaces and + ( ) . -");

export const propertySchema = z.object({
  name: requiredString("Name"),
  description: requiredString("Description"),
  pricePerMonth: z.coerce.number<string | number>().int().positive(),
  securityDeposit: z.coerce.number<string | number>().int().nonnegative(),
  applicationFee: z.coerce.number<string | number>().int().nonnegative(),
  isPetsAllowed: z.boolean(),
  isParkingIncluded: z.boolean(),
  photos: z
    .array(
      z
        .instanceof(File)
        .refine((file) => (PHOTO_MIME_TYPES as readonly string[]).includes(file.type), {
          message: "Photos must be JPEG, PNG or WebP",
        })
        .refine((file) => file.size <= MAX_PHOTO_SIZE_BYTES, {
          message: "Each photo must be 5 MB or smaller",
        }),
    )
    .min(1, "At least one photo is required")
    .max(MAX_PHOTOS_PER_PROPERTY, `Up to ${MAX_PHOTOS_PER_PROPERTY} photos are allowed`),
  amenities: z.array(z.enum(Amenity)).min(1, "Select at least one amenity"),
  highlights: z.array(z.enum(Highlight)).min(1, "Select at least one highlight"),
  beds: z.coerce.number<string | number>().int().positive().max(MAX_ROOMS),
  baths: z.coerce.number<string | number>().positive().max(MAX_ROOMS).multipleOf(0.5),
  squareFeet: z.coerce.number<string | number>().int().positive(),
  propertyType: z.enum(PropertyType),
  address: requiredString("Address"),
  city: requiredString("City"),
  state: requiredString("State"),
  country: requiredString("Country"),
  postalCode: requiredString("Postal code"),
});

export type PropertyFormInput = z.input<typeof propertySchema>;
export type PropertyFormData = z.output<typeof propertySchema>;

export const applicationSchema = z.object({
  name: requiredString("Name").max(MAX_NAME_LENGTH),
  email: z.email("Invalid email address"),
  phoneNumber,
  message: z
    .string()
    .trim()
    .max(MAX_MESSAGE_LENGTH)
    .transform((value) => value || undefined)
    .optional(),
});

export type ApplicationFormInput = z.input<typeof applicationSchema>;
export type ApplicationFormData = z.output<typeof applicationSchema>;

export const settingsSchema = z.object({
  name: requiredString("Name"),
  email: z.email("Invalid email address"),
  phoneNumber,
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
