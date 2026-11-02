import type { Express } from "express";
import { Role } from "../config/constants.ts";
import type { TokenVerifier } from "../lib/tokenVerifier.ts";
import { createAuthMiddleware } from "../middleware/auth.ts";
import type { ApplicationService } from "../services/applicationService.ts";
import type { LeaseService } from "../services/leaseService.ts";
import type { ManagerService } from "../services/managerService.ts";
import type { PropertyService } from "../services/propertyService.ts";
import type { TenantService } from "../services/tenantService.ts";
import { createApplicationRouter } from "./applicationRouter.ts";
import { createLeaseRouter } from "./leaseRouter.ts";
import { createManagerRouter } from "./managerRouter.ts";
import { createPropertyRouter } from "./propertyRouter.ts";
import { createTenantRouter } from "./tenantRouter.ts";

export type ApiDependencies = {
  verifyToken: TokenVerifier;
  tenantService: TenantService;
  managerService: ManagerService;
  propertyService: PropertyService;
  leaseService: LeaseService;
  applicationService: ApplicationService;
};

export function registerApiRoutes(deps: ApiDependencies): (app: Express) => void {
  const authorize = createAuthMiddleware(deps.verifyToken);

  return (app) => {
    app.use("/properties", createPropertyRouter(deps.propertyService, authorize));
    app.use("/applications", createApplicationRouter(deps.applicationService, authorize));
    app.use(
      "/leases",
      authorize([Role.Tenant, Role.Manager]),
      createLeaseRouter(deps.leaseService),
    );
    app.use("/tenants", authorize([Role.Tenant]), createTenantRouter(deps.tenantService));
    app.use(
      "/managers",
      authorize([Role.Manager]),
      createManagerRouter(deps.managerService, deps.propertyService),
    );
  };
}
