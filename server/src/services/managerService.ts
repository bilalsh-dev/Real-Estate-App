import type { Manager, PrismaClient } from "../generated/prisma/client.ts";
import { ConflictError, NotFoundError } from "../lib/errors.ts";
import { hasPrismaErrorCode, PrismaErrorCode } from "../lib/prismaErrors.ts";
import type { ProfileService } from "./profileService.ts";

export type ManagerService = ProfileService<Manager>;

const MANAGER_NOT_FOUND = "Manager not found";

export function createManagerService(db: Pick<PrismaClient, "manager">): ManagerService {
  return {
    async get(cognitoId) {
      const manager = await db.manager.findUnique({ where: { cognitoId } });
      if (!manager) throw new NotFoundError(MANAGER_NOT_FOUND);
      return manager;
    },

    async create(cognitoId, input) {
      try {
        return await db.manager.create({ data: { cognitoId, ...input } });
      } catch (error) {
        if (hasPrismaErrorCode(error, PrismaErrorCode.UniqueConstraint)) {
          throw new ConflictError("Manager already exists");
        }
        throw error;
      }
    },

    async update(cognitoId, { name, email, phoneNumber }) {
      try {
        return await db.manager.update({
          where: { cognitoId },
          data: { name, email, phoneNumber },
        });
      } catch (error) {
        if (hasPrismaErrorCode(error, PrismaErrorCode.RecordNotFound)) {
          throw new NotFoundError(MANAGER_NOT_FOUND);
        }
        throw error;
      }
    },
  };
}
