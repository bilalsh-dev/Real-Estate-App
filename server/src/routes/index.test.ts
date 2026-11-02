import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type AppConfig, createApp } from "../app.ts";
import { NotFoundError } from "../lib/errors.ts";
import type { TokenVerifier } from "../lib/tokenVerifier.ts";
import { registerApiRoutes } from "./index.ts";

const config: AppConfig = { NODE_ENV: "test", CORS_ORIGINS: ["http://localhost:3000"] };

const TOKENS: Record<string, { sub: string; role: string }> = {
  tenant: { sub: "tenant-1", role: "tenant" },
  manager: { sub: "manager-1", role: "manager" },
};

const verifyToken: TokenVerifier = (token) => {
  const identity = TOKENS[token];
  return identity ? Promise.resolve(identity) : Promise.reject(new Error("unknown token"));
};

const validBody = { name: "Ann", email: "ann@example.com", phoneNumber: "+1 555 0100" };

const tenantService = {
  get: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  listResidences: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
};
const managerService = { get: vi.fn(), create: vi.fn(), update: vi.fn() };
const propertyService = {
  search: vi.fn(),
  get: vi.fn(),
  create: vi.fn(),
  listByManager: vi.fn(),
  listLeases: vi.fn(),
};
const leaseService = { listForUser: vi.fn(), listPayments: vi.fn() };
const applicationService = { listForUser: vi.fn(), create: vi.fn(), review: vi.fn() };

const app = createApp(
  config,
  registerApiRoutes({
    verifyToken,
    tenantService,
    managerService,
    propertyService,
    leaseService,
    applicationService,
  }),
);

describe("profile routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns the signed-in tenant's profile", async () => {
    tenantService.get.mockResolvedValue({ cognitoId: "tenant-1", favorites: [] });
    const response = await request(app).get("/tenants/tenant-1").auth("tenant", { type: "bearer" });
    expect(response.status).toBe(200);
    expect(tenantService.get).toHaveBeenCalledWith("tenant-1");
  });

  it("returns 403 for another tenant's profile", async () => {
    const response = await request(app).get("/tenants/tenant-2").auth("tenant", { type: "bearer" });
    expect(response.status).toBe(403);
    expect(tenantService.get).not.toHaveBeenCalled();
  });

  it("returns 403 when updating another manager's profile", async () => {
    const response = await request(app)
      .put("/managers/manager-2")
      .auth("manager", { type: "bearer" })
      .send(validBody);
    expect(response.status).toBe(403);
    expect(managerService.update).not.toHaveBeenCalled();
  });

  it("returns 403 when a tenant calls the manager routes", async () => {
    const response = await request(app)
      .get("/managers/tenant-1")
      .auth("tenant", { type: "bearer" });
    expect(response.status).toBe(403);
  });

  it("maps a missing profile to 404 so the client can create it", async () => {
    tenantService.get.mockRejectedValue(new NotFoundError("Tenant not found"));
    const response = await request(app).get("/tenants/tenant-1").auth("tenant", { type: "bearer" });
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Tenant not found" });
  });

  it("creates the profile for the token's subject, ignoring any cognitoId in the body", async () => {
    managerService.create.mockResolvedValue({ cognitoId: "manager-1", ...validBody });
    const response = await request(app)
      .post("/managers")
      .auth("manager", { type: "bearer" })
      .send({ ...validBody, cognitoId: "someone-else" });
    expect(response.status).toBe(201);
    expect(managerService.create).toHaveBeenCalledWith("manager-1", validBody);
  });

  it("allows an empty phone number on sign-up", async () => {
    tenantService.create.mockResolvedValue({});
    const response = await request(app)
      .post("/tenants")
      .auth("tenant", { type: "bearer" })
      .send({ ...validBody, phoneNumber: "" });
    expect(response.status).toBe(201);
  });

  it("returns 400 with field errors for an invalid body", async () => {
    const response = await request(app)
      .put("/tenants/tenant-1")
      .auth("tenant", { type: "bearer" })
      .send({ name: " ", email: "not-an-email", phoneNumber: "call me" });
    const body = response.body as { message: string; issues: { path: string }[] };
    expect(response.status).toBe(400);
    expect(body.message).toBe("Invalid request");
    expect(body.issues.map((issue) => issue.path)).toEqual([
      "body.name",
      "body.email",
      "body.phoneNumber",
    ]);
    expect(tenantService.update).not.toHaveBeenCalled();
  });

  it("updates the signed-in tenant's profile with the validated fields only", async () => {
    tenantService.update.mockResolvedValue({ cognitoId: "tenant-1", ...validBody });
    const response = await request(app)
      .put("/tenants/tenant-1")
      .auth("tenant", { type: "bearer" })
      .send({ ...validBody, id: 42, name: "  Ann  " });
    expect(response.status).toBe(200);
    expect(tenantService.update).toHaveBeenCalledWith("tenant-1", validBody);
  });
});
