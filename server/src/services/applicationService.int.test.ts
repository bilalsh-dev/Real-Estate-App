import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { ApplicationStatus } from "../generated/prisma/enums.ts";
import { ConflictError, ForbiddenError, NotFoundError } from "../lib/errors.ts";
import {
  createManager,
  createProperty,
  createTenant,
  prisma,
  resetDatabase,
} from "../test-utils/db.ts";
import { createApplicationService } from "./applicationService.ts";

const NOW = new Date("2026-03-15T10:00:00.000Z");
const service = createApplicationService(prisma, () => NOW);

const contact = { name: "Ann", email: "ann@example.com", phoneNumber: "+1 555 0100" };

describe("applicationService (database)", () => {
  let propertyId: number;

  beforeEach(async () => {
    await resetDatabase();
    await createManager("mgr-1");
    await createManager("mgr-2");
    await createTenant("tenant-1");
    await createTenant("tenant-2");
    propertyId = (
      await createProperty({
        managerCognitoId: "mgr-1",
        pricePerMonth: 2100,
        securityDeposit: 4200,
      })
    ).id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  function apply(tenant = "tenant-1") {
    return service.create(tenant, { propertyId, message: "Hi", ...contact });
  }

  it("creates a pending application without a lease", async () => {
    const application = await apply();
    expect(application).toMatchObject({
      status: ApplicationStatus.Pending,
      tenantCognitoId: "tenant-1",
      leaseId: null,
      applicationDate: NOW,
    });
    expect(await prisma.lease.count()).toBe(0);
  });

  it("rejects a second pending application and an unknown property", async () => {
    await apply();
    await expect(apply()).rejects.toBeInstanceOf(ConflictError);
    await expect(
      service.create("tenant-1", { propertyId: 999, ...contact }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("approval creates exactly one lease, links it and adds the tenant to the property", async () => {
    const { id } = await apply();
    const approved = await service.review(id, "mgr-1", ApplicationStatus.Approved);

    const leases = await prisma.lease.findMany();
    expect(leases).toHaveLength(1);
    expect(leases[0]).toMatchObject({
      propertyId,
      tenantCognitoId: "tenant-1",
      rent: 2100,
      deposit: 4200,
      startDate: NOW,
      endDate: new Date("2027-03-15T10:00:00.000Z"),
    });
    expect(approved.status).toBe(ApplicationStatus.Approved);
    expect(approved.lease?.id).toBe(leases[0]?.id);

    const residents = await prisma.property.findUniqueOrThrow({
      where: { id: propertyId },
      include: { tenants: true },
    });
    expect(residents.tenants.map(({ cognitoId }) => cognitoId)).toEqual(["tenant-1"]);
  });

  it("denial creates no lease and a reviewed application cannot be reviewed again", async () => {
    const { id } = await apply();
    const denied = await service.review(id, "mgr-1", ApplicationStatus.Denied);
    expect(denied.status).toBe(ApplicationStatus.Denied);
    expect(await prisma.lease.count()).toBe(0);
    await expect(service.review(id, "mgr-1", ApplicationStatus.Approved)).rejects.toBeInstanceOf(
      ConflictError,
    );
    expect(await prisma.lease.count()).toBe(0);
  });

  it("only the property's manager can review", async () => {
    const { id } = await apply();
    await expect(service.review(id, "mgr-2", ApplicationStatus.Approved)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    await expect(service.review(999, "mgr-1", ApplicationStatus.Approved)).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(await prisma.lease.count()).toBe(0);
  });

  it("lists applications per role with the manager and next payment date", async () => {
    const { id } = await apply("tenant-1");
    await apply("tenant-2");
    await service.review(id, "mgr-1", ApplicationStatus.Approved);

    const later = createApplicationService(prisma, () => new Date("2026-05-20T00:00:00.000Z"));
    const tenantView = await later.listForUser({ id: "tenant-1", role: "tenant" });
    expect(tenantView).toHaveLength(1);
    expect(tenantView[0]?.manager.cognitoId).toBe("mgr-1");
    expect(tenantView[0]?.lease?.nextPaymentDate).toEqual(new Date("2026-06-15T10:00:00.000Z"));

    expect(await later.listForUser({ id: "mgr-1", role: "manager" })).toHaveLength(2);
    expect(await later.listForUser({ id: "mgr-2", role: "manager" })).toHaveLength(0);
  });
});
