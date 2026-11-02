import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    env: {
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:3002",
      NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID: "eu-central-1_TestPool1",
      NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID: "testclientid123",
    },
  },
});
