import type { PrismaClient, Property, Tenant } from "../generated/prisma/client.ts";
import { ConflictError, NotFoundError } from "../lib/errors.ts";
import { hasPrismaErrorCode, PrismaErrorCode } from "../lib/prismaErrors.ts";
import { attachCoordinates, type LocationWithCoordinates } from "./locationCoordinates.ts";
import type { ProfileService } from "./profileService.ts";

export type TenantProfile = Tenant & { favorites?: Property[] };

export type TenantService = ProfileService<TenantProfile> & {
  listResidences(cognitoId: string): Promise<(Property & { location: LocationWithCoordinates })[]>;
  addFavorite(cognitoId: string, propertyId: number): Promise<TenantProfile>;
  removeFavorite(cognitoId: string, propertyId: number): Promise<TenantProfile>;
};

const TENANT_NOT_FOUND = "Tenant not found";

export function createTenantService(
  db: Pick<PrismaClient, "tenant" | "property" | "$queryRaw">,
): TenantService {
  async function updateFavorites(
    cognitoId: string,
    favorites: { connect: { id: number } } | { disconnect: { id: number } },
  ) {
    try {
      return await db.tenant.update({
        where: { cognitoId },
        data: { favorites },
        include: { favorites: true },
      });
    } catch (error) {
      if (hasPrismaErrorCode(error, PrismaErrorCode.RecordNotFound)) {
        throw new NotFoundError(TENANT_NOT_FOUND);
      }
      throw error;
    }
  }

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

    async listResidences(cognitoId) {
      const properties = await db.property.findMany({
        where: { tenants: { some: { cognitoId } } },
        include: { location: true },
        orderBy: { id: "asc" },
      });
      return attachCoordinates(db, properties);
    },

    async addFavorite(cognitoId, propertyId) {
      const exists = await db.property.count({ where: { id: propertyId } });
      if (exists === 0) throw new NotFoundError("Property not found");
      return updateFavorites(cognitoId, { connect: { id: propertyId } });
    },

    removeFavorite(cognitoId, propertyId) {
      return updateFavorites(cognitoId, { disconnect: { id: propertyId } });
    },
  };
}
