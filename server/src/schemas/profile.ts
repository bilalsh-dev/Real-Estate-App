import { z } from "zod";

const MAX_NAME_LENGTH = 100;
const MAX_PHONE_LENGTH = 32;

export const cognitoIdParamsSchema = z.object({
  cognitoId: z.string().trim().min(1),
});

export const profileInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(MAX_NAME_LENGTH),
  email: z.email("Invalid email address"),
  phoneNumber: z
    .string()
    .trim()
    .max(MAX_PHONE_LENGTH)
    .regex(/^[+\d\s().-]*$/, "Invalid phone number"),
});

export type ProfileInput = z.output<typeof profileInputSchema>;
