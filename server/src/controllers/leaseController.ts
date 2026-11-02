import type { RequestHandler } from "express";
import { requireUser } from "../middleware/auth.ts";
import { withValidation } from "../middleware/validate.ts";
import { idParamsSchema } from "../schemas/common.ts";
import type { LeaseService } from "../services/leaseService.ts";

export function createLeaseController(service: LeaseService) {
  return {
    list: withValidation({}, async (_input, req, res) => {
      res.json(await service.listForUser(requireUser(req)));
    }),

    listPayments: withValidation({ params: idParamsSchema }, async ({ params }, req, res) => {
      res.json(await service.listPayments(params.id, requireUser(req)));
    }),
  } satisfies Record<string, RequestHandler>;
}
