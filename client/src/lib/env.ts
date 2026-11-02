import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.url(),
  NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID: z.string().regex(/^[a-z]{2}(-[a-z]+)+-\d_[0-9A-Za-z]+$/),
  NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID: z.string().regex(/^[0-9A-Za-z]+$/),
});

export const env = publicEnvSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID,
  NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID:
    process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID,
});
