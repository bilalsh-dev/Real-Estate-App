import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "prisma/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
      PORT: "3002",
      CORS_ORIGINS: "http://localhost:3000",
      DATABASE_URL: "postgresql://test:test@localhost:5432/test?schema=public",
      COGNITO_USER_POOL_ID: "eu-central-1_TestPool1",
      COGNITO_CLIENT_ID: "testclientid123",
    },
  },
});
