import { Router } from "express";
import { Role } from "../config/constants.ts";
import { createPropertyController } from "../controllers/propertyController.ts";
import type { Authorize } from "../middleware/auth.ts";
import { photoUpload } from "../middleware/upload.ts";
import type { PropertyService } from "../services/propertyService.ts";

export function createPropertyRouter(service: PropertyService, authorize: Authorize): Router {
  const controller = createPropertyController(service);
  const router = Router();

  router.get("/", controller.search);
  router.get("/:id", controller.get);
  router.get("/:id/leases", authorize([Role.Manager]), controller.listLeases);
  router.post("/", authorize([Role.Manager]), photoUpload, controller.create);

  return router;
}
