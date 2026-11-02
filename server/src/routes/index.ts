import type { Express } from "express";
import { Role } from "../config/constants.ts";
import type { TokenVerifier } from "../lib/tokenVerifier.ts";
import { createAuthMiddleware } from "../middleware/auth.ts";
import type { ManagerService } from "../services/managerService.ts";
import type { TenantService } from "../services/tenantService.ts";
import { createProfileRouter } from "./profileRouter.ts";

export type ApiDependencies = {
  verifyToken: TokenVerifier;
  tenantService: TenantService;
  managerService: ManagerService;
};

export function registerApiRoutes(deps: ApiDependencies): (app: Express) => void {
  const authorize = createAuthMiddleware(deps.verifyToken);

  return (app) => {
    app.use("/tenants", authorize([Role.Tenant]), createProfileRouter(deps.tenantService));
    app.use("/managers", authorize([Role.Manager]), createProfileRouter(deps.managerService));
  };
}
