import type { RequestHandler } from "express";
import { ValidationError } from "../lib/errors.ts";
import { requireUser } from "../middleware/auth.ts";
import { PHOTOS_FIELD } from "../middleware/upload.ts";
import { withValidation } from "../middleware/validate.ts";
import { idParamsSchema } from "../schemas/common.ts";
import { createPropertySchema, propertyFiltersSchema } from "../schemas/property.ts";
import type { PropertyService } from "../services/propertyService.ts";

export function createPropertyController(service: PropertyService) {
  return {
    search: withValidation({ query: propertyFiltersSchema }, async ({ query }, _req, res) => {
      res.json(await service.search(query));
    }),

    get: withValidation({ params: idParamsSchema }, async ({ params }, _req, res) => {
      res.json(await service.get(params.id));
    }),

    create: withValidation({ body: createPropertySchema }, async ({ body }, req, res) => {
      const photos = Array.isArray(req.files) ? req.files : [];
      if (photos.length === 0) {
        throw new ValidationError([
          { path: PHOTOS_FIELD, message: "At least one photo is required" },
        ]);
      }
      res.status(201).json(await service.create(requireUser(req).id, body, photos));
    }),

    listLeases: withValidation({ params: idParamsSchema }, async ({ params }, req, res) => {
      res.json(await service.listLeases(params.id, requireUser(req).id));
    }),
  } satisfies Record<string, RequestHandler>;
}
