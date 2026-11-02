import { z } from "zod";
import { cognitoIdSchema, phoneNumberSchema } from "./common.ts";

const MAX_NAME_LENGTH = 100;

export const cognitoIdParamsSchema = z.object({
  cognitoId: cognitoIdSchema,
});

export const profileInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(MAX_NAME_LENGTH),
  email: z.email("Invalid email address"),
  phoneNumber: phoneNumberSchema,
});

export type ProfileInput = z.output<typeof profileInputSchema>;
