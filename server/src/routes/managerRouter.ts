import type { Router } from "express";
import { createManagerController } from "../controllers/managerController.ts";
import type { ManagerService } from "../services/managerService.ts";
import type { PropertyService } from "../services/propertyService.ts";
import { createProfileRouter } from "./profileRouter.ts";

export function createManagerRouter(
  service: ManagerService,
  propertyService: PropertyService,
): Router {
  const controller = createManagerController(propertyService);
  const router = createProfileRouter(service);

  router.get("/:cognitoId/properties", controller.listProperties);

  return router;
}
