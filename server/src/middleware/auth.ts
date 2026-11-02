import type { Request, RequestHandler } from "express";
import { Role } from "../config/constants.ts";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.ts";
import type { TokenVerifier } from "../lib/tokenVerifier.ts";

export type AuthUser = {
  id: string;
  role: Role;
};

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

const BEARER_PATTERN = /^Bearer (\S+)$/;
const ROLES: readonly unknown[] = Object.values(Role);

function isRole(value: unknown): value is Role {
  return ROLES.includes(value);
}

function readBearerToken(header: string | undefined): string | undefined {
  return header?.match(BEARER_PATTERN)?.[1];
}

export function createAuthMiddleware(verifyToken: TokenVerifier) {
  return (allowedRoles: readonly Role[]): RequestHandler =>
    async (req, _res, next) => {
      const token = readBearerToken(req.headers.authorization);
      if (!token) throw new UnauthorizedError("Missing bearer token");

      const { sub, role } = await verifyToken(token);
      if (!isRole(role) || !allowedRoles.includes(role)) {
        throw new ForbiddenError("Access denied");
      }

      req.user = { id: sub, role };
      next();
    };
}

export function requireUser(req: Request): AuthUser {
  if (!req.user) throw new UnauthorizedError();
  return req.user;
}

export function assertSelf(req: Request, cognitoId: string): void {
  if (requireUser(req).id !== cognitoId) {
    throw new ForbiddenError("You can only access your own profile");
  }
}
