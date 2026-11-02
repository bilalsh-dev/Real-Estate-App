import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PaymentStatus } from "../generated/prisma/enums.ts";
import { ForbiddenError, NotFoundError } from "../lib/errors.ts";
import {
  createLease,
  createManager,
  createProperty,
  createTenant,
  prisma,
  resetDatabase,
} from "../test-utils/db.ts";
import { createLeaseService } from "./leaseService.ts";

const service = createLeaseService(prisma);
const term = { startDate: new Date("2026-01-01"), endDate: new Date("2027-01-01") };

describe("leaseService (database)", () => {
  let leaseId: number;

  beforeEach(async () => {
    await resetDatabase();
    await Promise.all([createManager("mgr-1"), createManager("mgr-2")]);
    await Promise.all([createTenant("tenant-1"), createTenant("tenant-2")]);
    const own = await createProperty({ managerCognitoId: "mgr-1" });
    const other = await createProperty({ managerCognitoId: "mgr-2" });
    leaseId = (await createLease({ propertyId: own.id, tenantCognitoId: "tenant-1", ...term })).id;
    await createLease({ propertyId: other.id, tenantCognitoId: "tenant-2", ...term });
    await prisma.payment.create({
      data: {
        leaseId,
        amountDue: 2000,
        amountPaid: 2000,
        dueDate: new Date("2026-02-01"),
        paymentDate: new Date("2026-02-01"),
        paymentStatus: PaymentStatus.Paid,
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("shows a tenant only their leases and a manager only leases on their properties", async () => {
    const tenantLeases = await service.listForUser({ id: "tenant-1", role: "tenant" });
    expect(tenantLeases.map(({ id }) => id)).toEqual([leaseId]);
    expect(tenantLeases[0]?.property.managerCognitoId).toBe("mgr-1");

    const managerLeases = await service.listForUser({ id: "mgr-1", role: "manager" });
    expect(managerLeases.map(({ id }) => id)).toEqual([leaseId]);
  });

  it("returns payments to the lease's tenant and manager only", async () => {
    expect(await service.listPayments(leaseId, { id: "tenant-1", role: "tenant" })).toHaveLength(1);
    expect(await service.listPayments(leaseId, { id: "mgr-1", role: "manager" })).toHaveLength(1);
    await expect(
      service.listPayments(leaseId, { id: "tenant-2", role: "tenant" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(
      service.listPayments(leaseId, { id: "mgr-2", role: "manager" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(
      service.listPayments(999, { id: "tenant-1", role: "tenant" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
