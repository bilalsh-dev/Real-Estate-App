import { Router } from "express";
import { createLeaseController } from "../controllers/leaseController.ts";
import type { LeaseService } from "../services/leaseService.ts";

export function createLeaseRouter(service: LeaseService): Router {
  const controller = createLeaseController(service);
  const router = Router();

  router.get("/", controller.list);
  router.get("/:id/payments", controller.listPayments);

  return router;
}
