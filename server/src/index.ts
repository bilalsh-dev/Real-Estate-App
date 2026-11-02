import { S3Client } from "@aws-sdk/client-s3";
import { createApp } from "./app.ts";
import { env } from "./config/env.ts";
import { createNominatimGeocoder } from "./lib/geocoder.ts";
import { createS3PhotoStorage } from "./lib/photoStorage.ts";
import { prisma } from "./lib/prisma.ts";
import { createCognitoIdTokenVerifier, createTokenVerifier } from "./lib/tokenVerifier.ts";
import { registerApiRoutes } from "./routes/index.ts";
import { createApplicationService } from "./services/applicationService.ts";
import { createLeaseService } from "./services/leaseService.ts";
import { createManagerService } from "./services/managerService.ts";
import { createPropertyService } from "./services/propertyService.ts";
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
    propertyService: createPropertyService({
      db: prisma,
      geocode: createNominatimGeocoder(),
      storage: createS3PhotoStorage({
        client: new S3Client({ region: env.AWS_REGION }),
        bucket: env.S3_BUCKET_NAME,
      }),
    }),
    leaseService: createLeaseService(prisma),
    applicationService: createApplicationService(prisma),
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
