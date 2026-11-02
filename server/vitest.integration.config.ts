import { defineConfig } from "vitest/config";
import { resolveTestDatabaseUrl } from "./src/test-utils/testDatabase.ts";
import { testEnv } from "./vitest.config.ts";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.int.test.ts"],
    globalSetup: ["./src/test-utils/integrationSetup.ts"],
    fileParallelism: false,
    env: { ...testEnv, DATABASE_URL: resolveTestDatabaseUrl() },
  },
});
