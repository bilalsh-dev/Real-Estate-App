import { createApp } from "./app.ts";
import { env } from "./config/env.ts";
import { prisma } from "./lib/prisma.ts";
import { createCognitoIdTokenVerifier, createTokenVerifier } from "./lib/tokenVerifier.ts";
import { registerApiRoutes } from "./routes/index.ts";
import { createManagerService } from "./services/managerService.ts";
import { createTenantService } from "./services/tenantService.ts";

const app = createApp(
  env,
  registerApiRoutes({
    verifyToken: createTokenVerifier(
      createCognitoIdTokenVerifier({
        userPoolId: env.COGNITO_USER_POOL_ID,
        clientId: env.COGNITO_CLIENT_ID,
      }),
    ),
    tenantService: createTenantService(prisma),
    managerService: createManagerService(prisma),
  }),
);

const server = app.listen(env.PORT, "0.0.0.0", () => {
  console.warn(`Server running on port ${env.PORT}`);
});

function shutdown(signal: NodeJS.Signals) {
  console.warn(`${signal} received, shutting down`);
  server.close(() => {
    prisma
      .$disconnect()
      .then(() => process.exit(0))
      .catch((error: unknown) => {
        console.error("Failed to disconnect from the database", error);
        process.exit(1);
      });
  });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
