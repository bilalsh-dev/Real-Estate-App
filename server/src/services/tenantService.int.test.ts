import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { NotFoundError } from "../lib/errors.ts";
import {
  createManager,
  createProperty,
  createTenant,
  prisma,
  resetDatabase,
} from "../test-utils/db.ts";
import { createTenantService } from "./tenantService.ts";

const service = createTenantService(prisma);

describe("tenantService favorites and residences (database)", () => {
  beforeEach(async () => {
    await resetDatabase();
    await createManager("mgr-1");
    await createTenant("tenant-1");
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("adds a favorite idempotently", async () => {
    const property = await createProperty({ managerCognitoId: "mgr-1" });
    await service.addFavorite("tenant-1", property.id);
    const tenant = await service.addFavorite("tenant-1", property.id);
    expect(tenant.favorites?.map(({ id }) => id)).toEqual([property.id]);
  });

  it("removes a favorite, and removing a missing one is a no-op", async () => {
    const property = await createProperty({ managerCognitoId: "mgr-1" });
    await service.addFavorite("tenant-1", property.id);
    expect((await service.removeFavorite("tenant-1", property.id)).favorites).toEqual([]);
    expect((await service.removeFavorite("tenant-1", property.id)).favorites).toEqual([]);
  });

  it("rejects favoriting an unknown property or for an unknown tenant", async () => {
    const property = await createProperty({ managerCognitoId: "mgr-1" });
    await expect(service.addFavorite("tenant-1", 999)).rejects.toBeInstanceOf(NotFoundError);
    await expect(service.addFavorite("ghost", property.id)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("lists current residences with coordinates", async () => {
    const home = await createProperty({ managerCognitoId: "mgr-1" });
    await createProperty({ managerCognitoId: "mgr-1" });
    await prisma.property.update({
      where: { id: home.id },
      data: { tenants: { connect: { cognitoId: "tenant-1" } } },
    });

    const residences = await service.listResidences("tenant-1");
    expect(residences.map(({ id }) => id)).toEqual([home.id]);
    expect(residences[0]?.location.coordinates).toEqual({ longitude: -118.25, latitude: 34.05 });
  });
});
