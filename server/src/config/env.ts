import { z } from "zod";

const corsOrigins = z
  .string()
  .transform((value) => value.split(",").map((origin) => origin.trim()))
  .pipe(z.array(z.url()).min(1));

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.coerce.number().int().min(1).max(65535),
  CORS_ORIGINS: corsOrigins,
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  COGNITO_USER_POOL_ID: z.string().regex(/^[a-z]{2}(-[a-z]+)+-\d_[0-9A-Za-z]+$/),
  COGNITO_CLIENT_ID: z.string().regex(/^[0-9A-Za-z]+$/),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Invalid environment configuration:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const env = parseEnv(process.env);
