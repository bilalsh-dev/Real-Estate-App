import { defineConfig } from "vitest/config";

export const testEnv = {
  NODE_ENV: "test",
  PORT: "3002",
  CORS_ORIGINS: "http://localhost:3000",
  DATABASE_URL: "postgresql://test:test@localhost:5432/test?schema=public",
  COGNITO_USER_POOL_ID: "eu-central-1_TestPool1",
  COGNITO_CLIENT_ID: "testclientid123",
  AWS_REGION: "eu-central-1",
  S3_BUCKET_NAME: "rentiful-test-photos",
};

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "prisma/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/*.int.test.ts"],
    env: testEnv,
  },
});
