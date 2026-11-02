import { Router } from "express";
import { createProfileController } from "../controllers/profileController.ts";
import type { ProfileService } from "../services/profileService.ts";

export function createProfileRouter<TProfile>(service: ProfileService<TProfile>): Router {
  const controller = createProfileController(service);
  const router = Router();

  router.post("/", controller.create);
  router.get("/:cognitoId", controller.get);
  router.put("/:cognitoId", controller.update);

  return router;
}
