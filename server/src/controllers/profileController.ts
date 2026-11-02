import type { RequestHandler } from "express";
import { assertSelf, requireUser } from "../middleware/auth.ts";
import { withValidation } from "../middleware/validate.ts";
import { cognitoIdParamsSchema, profileInputSchema } from "../schemas/profile.ts";
import type { ProfileService } from "../services/profileService.ts";

export type ProfileController = {
  get: RequestHandler;
  create: RequestHandler;
  update: RequestHandler;
};

export function createProfileController<TProfile>(
  service: ProfileService<TProfile>,
): ProfileController {
  return {
    get: withValidation({ params: cognitoIdParamsSchema }, async ({ params }, req, res) => {
      assertSelf(req, params.cognitoId);
      res.json(await service.get(params.cognitoId));
    }),

    create: withValidation({ body: profileInputSchema }, async ({ body }, req, res) => {
      const user = requireUser(req);
      res.status(201).json(await service.create(user.id, body));
    }),

    update: withValidation(
      { params: cognitoIdParamsSchema, body: profileInputSchema },
      async ({ params, body }, req, res) => {
        assertSelf(req, params.cognitoId);
        res.json(await service.update(params.cognitoId, body));
      },
    ),
  };
}
