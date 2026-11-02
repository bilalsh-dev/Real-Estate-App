import { z } from "zod";

const MAX_PHONE_LENGTH = 32;

export const idSchema = z.coerce.number().int().positive();

export const idParamsSchema = z.object({ id: idSchema });

export const cognitoIdSchema = z.string().trim().min(1);

export const phoneNumberSchema = z
  .string()
  .trim()
  .max(MAX_PHONE_LENGTH)
  .regex(/^[+\d\s().-]*$/, "Invalid phone number");

export function commaSeparated<T extends z.ZodType>(item: T, minItems = 1) {
  return z.preprocess(
    (value) =>
      typeof value === "string"
        ? value
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean)
        : value,
    z.array(item).min(minItems),
  );
}
