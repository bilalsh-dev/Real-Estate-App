import type { Router } from "express";
import { createTenantController } from "../controllers/tenantController.ts";
import type { TenantService } from "../services/tenantService.ts";
import { createProfileRouter } from "./profileRouter.ts";

export function createTenantRouter(service: TenantService): Router {
  const controller = createTenantController(service);
  const router = createProfileRouter(service);

  router.get("/:cognitoId/current-residences", controller.listResidences);
  router.post("/:cognitoId/favorites/:propertyId", controller.addFavorite);
  router.delete("/:cognitoId/favorites/:propertyId", controller.removeFavorite);

  return router;
}
