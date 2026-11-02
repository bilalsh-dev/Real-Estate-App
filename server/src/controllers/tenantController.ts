import type { RequestHandler } from "express";
import { z } from "zod";
import { assertSelf } from "../middleware/auth.ts";
import { withValidation } from "../middleware/validate.ts";
import { cognitoIdSchema, idSchema } from "../schemas/common.ts";
import { cognitoIdParamsSchema } from "../schemas/profile.ts";
import type { TenantService } from "../services/tenantService.ts";

const favoriteParamsSchema = z.object({ cognitoId: cognitoIdSchema, propertyId: idSchema });

export function createTenantController(service: TenantService) {
  return {
    listResidences: withValidation(
      { params: cognitoIdParamsSchema },
      async ({ params }, req, res) => {
        assertSelf(req, params.cognitoId);
        res.json(await service.listResidences(params.cognitoId));
      },
    ),

    addFavorite: withValidation({ params: favoriteParamsSchema }, async ({ params }, req, res) => {
      assertSelf(req, params.cognitoId);
      res.json(await service.addFavorite(params.cognitoId, params.propertyId));
    }),

    removeFavorite: withValidation(
      { params: favoriteParamsSchema },
      async ({ params }, req, res) => {
        assertSelf(req, params.cognitoId);
        res.json(await service.removeFavorite(params.cognitoId, params.propertyId));
      },
    ),
  } satisfies Record<string, RequestHandler>;
}
