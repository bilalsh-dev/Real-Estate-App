import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma, type PrismaClient } from "../generated/prisma/client.ts";
import { ConflictError, NotFoundError } from "../lib/errors.ts";
import { createManagerService } from "./managerService.ts";

const manager = { id: 1, cognitoId: "mgr", name: "Max", email: "max@example.com", phoneNumber: "" };
const input = { name: "Max M", email: "maxm@example.com", phoneNumber: "+1 555 0101" };

function prismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError("failed", { code, clientVersion: "7" });
}

describe("createManagerService", () => {
  const db = { manager: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() } };
  const service = createManagerService(db as unknown as Pick<PrismaClient, "manager">);

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("gets a manager", async () => {
    db.manager.findUnique.mockResolvedValue(manager);
    await expect(service.get("mgr")).resolves.toEqual(manager);
    expect(db.manager.findUnique).toHaveBeenCalledWith({ where: { cognitoId: "mgr" } });
  });

  it("throws NotFoundError for an unknown manager", async () => {
    db.manager.findUnique.mockResolvedValue(null);
    await expect(service.get("nobody")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("creates a manager for the given Cognito id", async () => {
    db.manager.create.mockResolvedValue({ ...manager, ...input });
    await service.create("mgr", input);
    expect(db.manager.create).toHaveBeenCalledWith({ data: { cognitoId: "mgr", ...input } });
  });

  it("throws ConflictError when the manager already exists", async () => {
    db.manager.create.mockRejectedValue(prismaError("P2002"));
    await expect(service.create("mgr", input)).rejects.toBeInstanceOf(ConflictError);
  });

  it("updates only name, email and phone number", async () => {
    db.manager.update.mockResolvedValue({ ...manager, ...input });
    const withExtras = { ...input, id: 7, cognitoId: "other" };
    await service.update("mgr", withExtras);
    expect(db.manager.update).toHaveBeenCalledWith({ where: { cognitoId: "mgr" }, data: input });
  });

  it("throws NotFoundError when updating an unknown manager", async () => {
    db.manager.update.mockRejectedValue(prismaError("P2025"));
    await expect(service.update("nobody", input)).rejects.toBeInstanceOf(NotFoundError);
  });
});
