import { z } from "zod";
import { Amenity, Highlight, PropertyType } from "@/lib/constants";

const MIN_PHONE_DIGITS = 10;
const MAX_ROOMS = 10;

const requiredString = (label: string) => z.string().trim().min(1, `${label} is required`);

const MAX_PHONE_LENGTH = 32;

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
  photos: z.array(z.instanceof(File)).min(1, "At least one photo is required"),
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
  name: requiredString("Name"),
  email: z.email("Invalid email address"),
  phoneNumber,
  message: z.string().trim().optional(),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

export const settingsSchema = z.object({
  name: requiredString("Name"),
  email: z.email("Invalid email address"),
  phoneNumber,
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
