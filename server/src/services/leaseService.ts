import { Role } from "../config/constants.ts";
import type { Lease, Payment, PrismaClient, Property, Tenant } from "../generated/prisma/client.ts";
import { ForbiddenError, NotFoundError } from "../lib/errors.ts";
import type { AuthUser } from "../middleware/auth.ts";

export type LeaseWithParties = Lease & { tenant: Tenant; property: Property };

export type LeaseService = {
  listForUser(user: AuthUser): Promise<LeaseWithParties[]>;
  listPayments(leaseId: number, user: AuthUser): Promise<Payment[]>;
};

export function createLeaseService(db: Pick<PrismaClient, "lease" | "payment">): LeaseService {
  return {
    listForUser(user) {
      return db.lease.findMany({
        where:
          user.role === Role.Tenant
            ? { tenantCognitoId: user.id }
            : { property: { managerCognitoId: user.id } },
        include: { tenant: true, property: true },
        orderBy: { startDate: "desc" },
      });
    },

    async listPayments(leaseId, user) {
      const lease = await db.lease.findUnique({
        where: { id: leaseId },
        select: { tenantCognitoId: true, property: { select: { managerCognitoId: true } } },
      });
      if (!lease) throw new NotFoundError("Lease not found");

      const isParty =
        user.role === Role.Tenant
          ? lease.tenantCognitoId === user.id
          : lease.property.managerCognitoId === user.id;
      if (!isParty) throw new ForbiddenError("You can only view payments of your own leases");

      return db.payment.findMany({ where: { leaseId }, orderBy: { dueDate: "asc" } });
    },
  };
}
