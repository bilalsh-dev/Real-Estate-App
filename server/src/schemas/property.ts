import { z } from "zod";
import { Amenity, Highlight, PropertyType } from "../generated/prisma/enums.ts";
import { commaSeparated, idSchema } from "./common.ts";

const MAX_TEXT_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_ROOMS = 10;

const nonNegativeNumber = z.coerce.number().nonnegative();

export const propertyFiltersSchema = z
  .object({
    favoriteIds: commaSeparated(idSchema).optional(),
    priceMin: nonNegativeNumber.optional(),
    priceMax: nonNegativeNumber.optional(),
    beds: z.coerce.number().int().nonnegative().optional(),
    baths: nonNegativeNumber.optional(),
    propertyType: z.enum(PropertyType).optional(),
    squareFeetMin: nonNegativeNumber.optional(),
    squareFeetMax: nonNegativeNumber.optional(),
    amenities: commaSeparated(z.enum(Amenity)).optional(),
    availableFrom: z.coerce.date().optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
  })
  .refine((filters) => (filters.latitude === undefined) === (filters.longitude === undefined), {
    message: "latitude and longitude must be provided together",
    path: ["latitude"],
  });

export type PropertyFilters = z.output<typeof propertyFiltersSchema>;

const formBoolean = z.enum(["true", "false"]).transform((value) => value === "true");
const requiredText = z.string().trim().min(1).max(MAX_TEXT_LENGTH);

export const createPropertySchema = z.object({
  name: requiredText,
  description: z.string().trim().min(1).max(MAX_DESCRIPTION_LENGTH),
  pricePerMonth: z.coerce.number().int().positive(),
  securityDeposit: z.coerce.number().int().nonnegative(),
  applicationFee: z.coerce.number().int().nonnegative(),
  isPetsAllowed: formBoolean,
  isParkingIncluded: formBoolean,
  amenities: commaSeparated(z.enum(Amenity)),
  highlights: commaSeparated(z.enum(Highlight)),
  beds: z.coerce.number().int().positive().max(MAX_ROOMS),
  baths: z.coerce.number().positive().max(MAX_ROOMS).multipleOf(0.5),
  squareFeet: z.coerce.number().int().positive(),
  propertyType: z.enum(PropertyType),
  address: requiredText,
  city: requiredText,
  state: requiredText,
  country: requiredText,
  postalCode: requiredText,
});

export type CreatePropertyInput = z.output<typeof createPropertySchema>;
