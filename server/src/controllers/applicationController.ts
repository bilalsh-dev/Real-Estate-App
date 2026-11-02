import type { RequestHandler } from "express";
import { requireUser } from "../middleware/auth.ts";
import { withValidation } from "../middleware/validate.ts";
import { createApplicationSchema, reviewApplicationSchema } from "../schemas/application.ts";
import { idParamsSchema } from "../schemas/common.ts";
import type { ApplicationService } from "../services/applicationService.ts";

export function createApplicationController(service: ApplicationService) {
  return {
    list: withValidation({}, async (_input, req, res) => {
      res.json(await service.listForUser(requireUser(req)));
    }),

    create: withValidation({ body: createApplicationSchema }, async ({ body }, req, res) => {
      res.status(201).json(await service.create(requireUser(req).id, body));
    }),

    review: withValidation(
      { params: idParamsSchema, body: reviewApplicationSchema },
      async ({ params, body }, req, res) => {
        res.json(await service.review(params.id, requireUser(req).id, body.status));
      },
    ),
  } satisfies Record<string, RequestHandler>;
}
