import type { RequestHandler } from "express";
import { assertSelf } from "../middleware/auth.ts";
import { withValidation } from "../middleware/validate.ts";
import { cognitoIdParamsSchema } from "../schemas/profile.ts";
import type { PropertyService } from "../services/propertyService.ts";

export function createManagerController(propertyService: PropertyService) {
  return {
    listProperties: withValidation(
      { params: cognitoIdParamsSchema },
      async ({ params }, req, res) => {
        assertSelf(req, params.cognitoId);
        res.json(await propertyService.listByManager(params.cognitoId));
      },
    ),
  } satisfies Record<string, RequestHandler>;
}
