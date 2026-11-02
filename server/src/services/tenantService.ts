import type { PrismaClient, Property, Tenant } from "../generated/prisma/client.ts";
import { ConflictError, NotFoundError } from "../lib/errors.ts";
import { hasPrismaErrorCode, PrismaErrorCode } from "../lib/prismaErrors.ts";
import type { ProfileService } from "./profileService.ts";

export type TenantProfile = Tenant & { favorites?: Property[] };

export type TenantService = ProfileService<TenantProfile>;

const TENANT_NOT_FOUND = "Tenant not found";

export function createTenantService(db: Pick<PrismaClient, "tenant">): TenantService {
  return {
    async get(cognitoId) {
      const tenant = await db.tenant.findUnique({
        where: { cognitoId },
        include: { favorites: true },
      });
      if (!tenant) throw new NotFoundError(TENANT_NOT_FOUND);
      return tenant;
    },

    async create(cognitoId, input) {
      try {
        return await db.tenant.create({ data: { cognitoId, ...input } });
      } catch (error) {
        if (hasPrismaErrorCode(error, PrismaErrorCode.UniqueConstraint)) {
          throw new ConflictError("Tenant already exists");
        }
        throw error;
      }
    },

    async update(cognitoId, { name, email, phoneNumber }) {
      try {
        return await db.tenant.update({
          where: { cognitoId },
          data: { name, email, phoneNumber },
        });
      } catch (error) {
        if (hasPrismaErrorCode(error, PrismaErrorCode.RecordNotFound)) {
          throw new NotFoundError(TENANT_NOT_FOUND);
        }
        throw error;
      }
    },
  };
}
