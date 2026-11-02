import { Router } from "express";
import { Role } from "../config/constants.ts";
import { createApplicationController } from "../controllers/applicationController.ts";
import type { Authorize } from "../middleware/auth.ts";
import type { ApplicationService } from "../services/applicationService.ts";

export function createApplicationRouter(service: ApplicationService, authorize: Authorize): Router {
  const controller = createApplicationController(service);
  const router = Router();

  router.get("/", authorize([Role.Tenant, Role.Manager]), controller.list);
  router.post("/", authorize([Role.Tenant]), controller.create);
  router.put("/:id/status", authorize([Role.Manager]), controller.review);

  return router;
}
