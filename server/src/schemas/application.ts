import { z } from "zod";
import { ApplicationStatus } from "../generated/prisma/enums.ts";
import { idSchema, phoneNumberSchema } from "./common.ts";

const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 2000;

export const createApplicationSchema = z.object({
  propertyId: idSchema,
  name: z.string().trim().min(1, "Name is required").max(MAX_NAME_LENGTH),
  email: z.email("Invalid email address"),
  phoneNumber: phoneNumberSchema.pipe(z.string().min(1, "Phone number is required")),
  message: z.string().trim().max(MAX_MESSAGE_LENGTH).optional(),
});

export type CreateApplicationInput = z.output<typeof createApplicationSchema>;

export const reviewApplicationSchema = z.object({
  status: z.enum([ApplicationStatus.Approved, ApplicationStatus.Denied]),
});

export type ReviewDecision = z.output<typeof reviewApplicationSchema>["status"];
