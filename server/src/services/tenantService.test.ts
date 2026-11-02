import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "../generated/prisma/client.ts";
import { ConflictError, NotFoundError } from "../lib/errors.ts";
import { createTenantService } from "./tenantService.ts";

const tenant = { id: 1, cognitoId: "abc", name: "Ann", email: "ann@example.com", phoneNumber: "" };
const input = { name: "Ann B", email: "annb@example.com", phoneNumber: "+1 555 0100" };

function prismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError("failed", { code, clientVersion: "7" });
}

describe("createTenantService", () => {
  const db = { tenant: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() } };
  const service = createTenantService(db as unknown as Parameters<typeof createTenantService>[0]);

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("gets a tenant with favorites", async () => {
    db.tenant.findUnique.mockResolvedValue({ ...tenant, favorites: [] });
    await expect(service.get("abc")).resolves.toEqual({ ...tenant, favorites: [] });
    expect(db.tenant.findUnique).toHaveBeenCalledWith({
      where: { cognitoId: "abc" },
      include: { favorites: true },
    });
  });

  it("throws NotFoundError for an unknown tenant", async () => {
    db.tenant.findUnique.mockResolvedValue(null);
    await expect(service.get("nobody")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("creates a tenant for the given Cognito id", async () => {
    db.tenant.create.mockResolvedValue({ ...tenant, ...input });
    await expect(service.create("abc", input)).resolves.toEqual({ ...tenant, ...input });
    expect(db.tenant.create).toHaveBeenCalledWith({ data: { cognitoId: "abc", ...input } });
  });

  it("throws ConflictError when the tenant already exists", async () => {
    db.tenant.create.mockRejectedValue(prismaError("P2002"));
    await expect(service.create("abc", input)).rejects.toBeInstanceOf(ConflictError);
  });

  it("updates only name, email and phone number", async () => {
    db.tenant.update.mockResolvedValue({ ...tenant, ...input });
    const withExtras = { ...input, id: 99, cognitoId: "someone-else" };
    await service.update("abc", withExtras);
    expect(db.tenant.update).toHaveBeenCalledWith({ where: { cognitoId: "abc" }, data: input });
  });

  it("throws NotFoundError when updating an unknown tenant", async () => {
    db.tenant.update.mockRejectedValue(prismaError("P2025"));
    await expect(service.update("nobody", input)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rethrows unexpected database errors", async () => {
    const failure = new Error("connection lost");
    db.tenant.create.mockRejectedValue(failure);
    await expect(service.create("abc", input)).rejects.toBe(failure);
  });
});
