import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type AppConfig, createApp } from "../app.ts";
import { MAX_PHOTO_SIZE_BYTES } from "../config/constants.ts";
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

const propertyFields: Record<string, string> = {
  name: "Canal View",
  description: "Two rooms",
  pricePerMonth: "1800",
  securityDeposit: "1800",
  applicationFee: "0",
  isPetsAllowed: "true",
  isParkingIncluded: "false",
  amenities: "WasherDryer,Dishwasher",
  highlights: "GreatView",
  beds: "2",
  baths: "1.5",
  squareFeet: "700",
  propertyType: "Apartment",
  address: "Kottbusser Damm 1",
  city: "Berlin",
  state: "Berlin",
  country: "Germany",
  postalCode: "10967",
};

function postProperty(token: string) {
  const req = request(app).post("/properties").auth(token, { type: "bearer" });
  for (const [key, value] of Object.entries(propertyFields)) void req.field(key, value);
  return req;
}

const jpeg = { filename: "a.jpg", contentType: "image/jpeg" };

describe("domain routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("properties", () => {
    it("searches publicly with parsed filters", async () => {
      propertyService.search.mockResolvedValue([]);
      const response = await request(app).get(
        "/properties?priceMin=1000&beds=2&amenities=Pool,Gym&favoriteIds=3,1&latitude=52.5&longitude=13.4&location=Berlin",
      );
      expect(response.status).toBe(200);
      expect(propertyService.search).toHaveBeenCalledWith({
        priceMin: 1000,
        beds: 2,
        amenities: ["Pool", "Gym"],
        favoriteIds: [3, 1],
        latitude: 52.5,
        longitude: 13.4,
      });
    });

    it.each([
      ["latitude without longitude", "latitude=52.5"],
      ["an unknown property type", "propertyType=Castle"],
      ["an unknown amenity", "amenities=Pool,Helipad"],
      ["a non-numeric favorite id", "favoriteIds=1,abc"],
    ])("rejects %s", async (_case, query) => {
      const response = await request(app).get(`/properties?${query}`);
      expect(response.status).toBe(400);
      expect(propertyService.search).not.toHaveBeenCalled();
    });

    it("rejects a non-numeric property id", async () => {
      expect((await request(app).get("/properties/abc")).status).toBe(400);
    });

    it("creates a property for the signed-in manager from multipart data", async () => {
      propertyService.create.mockResolvedValue({ id: 1 });
      const response = await postProperty("manager").attach("photos", Buffer.from("jpg"), jpeg);

      expect(response.status).toBe(201);
      const [managerId, body, photos] = propertyService.create.mock.calls[0] as [
        string,
        Record<string, unknown>,
        { mimetype: string; buffer: Buffer }[],
      ];
      expect(managerId).toBe("manager-1");
      expect(body).toMatchObject({
        amenities: ["WasherDryer", "Dishwasher"],
        isPetsAllowed: true,
        isParkingIncluded: false,
        baths: 1.5,
        pricePerMonth: 1800,
      });
      expect(photos).toHaveLength(1);
      expect(photos[0]?.mimetype).toBe("image/jpeg");
    });

    it("ignores a managerCognitoId sent in the body", async () => {
      propertyService.create.mockResolvedValue({ id: 1 });
      await postProperty("manager")
        .field("managerCognitoId", "someone-else")
        .attach("photos", Buffer.from("jpg"), jpeg);
      expect(propertyService.create.mock.calls[0]?.[0]).toBe("manager-1");
    });

    it("rejects tenants creating properties", async () => {
      const response = await postProperty("tenant").attach("photos", Buffer.from("jpg"), jpeg);
      expect(response.status).toBe(403);
    });

    it("requires at least one photo", async () => {
      const response = await postProperty("manager");
      expect(response.status).toBe(400);
      expect(propertyService.create).not.toHaveBeenCalled();
    });

    it("rejects non-image uploads and oversized photos", async () => {
      const pdf = await postProperty("manager").attach("photos", Buffer.from("%PDF"), {
        filename: "a.pdf",
        contentType: "application/pdf",
      });
      expect(pdf.status).toBe(400);

      const huge = await postProperty("manager").attach(
        "photos",
        Buffer.alloc(MAX_PHOTO_SIZE_BYTES + 1),
        jpeg,
      );
      expect(huge.status).toBe(400);
      expect(propertyService.create).not.toHaveBeenCalled();
    });

    it("rejects an invalid property body", async () => {
      const response = await postProperty("manager")
        .field("baths", "1.25")
        .attach("photos", Buffer.from("jpg"), jpeg);
      expect(response.status).toBe(400);
    });

    it("lists a property's leases for managers only", async () => {
      propertyService.listLeases.mockResolvedValue([]);
      const tenant = await request(app)
        .get("/properties/1/leases")
        .auth("tenant", { type: "bearer" });
      expect(tenant.status).toBe(403);
      const manager = await request(app)
        .get("/properties/1/leases")
        .auth("manager", { type: "bearer" });
      expect(manager.status).toBe(200);
      expect(propertyService.listLeases).toHaveBeenCalledWith(1, "manager-1");
    });
  });

  describe("applications", () => {
    const application = {
      propertyId: 1,
      name: "Ann",
      email: "ann@example.com",
      phoneNumber: "555 0100",
    };

    it("creates an application for the signed-in tenant", async () => {
      applicationService.create.mockResolvedValue({ id: 1 });
      const response = await request(app)
        .post("/applications")
        .auth("tenant", { type: "bearer" })
        .send({ ...application, tenantCognitoId: "someone-else", status: "Approved" });
      expect(response.status).toBe(201);
      expect(applicationService.create).toHaveBeenCalledWith("tenant-1", application);
    });

    it("lets only managers review, and only to Approved or Denied", async () => {
      const asTenant = await request(app)
        .put("/applications/1/status")
        .auth("tenant", { type: "bearer" })
        .send({ status: "Approved" });
      expect(asTenant.status).toBe(403);

      const invalid = await request(app)
        .put("/applications/1/status")
        .auth("manager", { type: "bearer" })
        .send({ status: "Pending" });
      expect(invalid.status).toBe(400);

      applicationService.review.mockResolvedValue({ id: 1 });
      const approved = await request(app)
        .put("/applications/1/status")
        .auth("manager", { type: "bearer" })
        .send({ status: "Approved" });
      expect(approved.status).toBe(200);
      expect(applicationService.review).toHaveBeenCalledWith(1, "manager-1", "Approved");
    });

    it("lists applications for the signed-in user", async () => {
      applicationService.listForUser.mockResolvedValue([]);
      await request(app).get("/applications?userId=other").auth("manager", { type: "bearer" });
      expect(applicationService.listForUser).toHaveBeenCalledWith({
        id: "manager-1",
        role: "manager",
      });
    });
  });

  describe("leases", () => {
    it("requires authentication", async () => {
      expect((await request(app).get("/leases")).status).toBe(401);
    });

    it("lists the user's leases and payments", async () => {
      leaseService.listForUser.mockResolvedValue([]);
      leaseService.listPayments.mockResolvedValue([]);
      await request(app).get("/leases").auth("tenant", { type: "bearer" });
      await request(app).get("/leases/7/payments").auth("tenant", { type: "bearer" });
      const user = { id: "tenant-1", role: "tenant" };
      expect(leaseService.listForUser).toHaveBeenCalledWith(user);
      expect(leaseService.listPayments).toHaveBeenCalledWith(7, user);
    });
  });

  describe("tenant and manager additions", () => {
    it("manages the signed-in tenant's favorites only", async () => {
      tenantService.addFavorite.mockResolvedValue({});
      tenantService.removeFavorite.mockResolvedValue({});
      const own = await request(app)
        .post("/tenants/tenant-1/favorites/5")
        .auth("tenant", { type: "bearer" });
      expect(own.status).toBe(200);
      expect(tenantService.addFavorite).toHaveBeenCalledWith("tenant-1", 5);

      const removed = await request(app)
        .delete("/tenants/tenant-1/favorites/5")
        .auth("tenant", { type: "bearer" });
      expect(removed.status).toBe(200);

      const other = await request(app)
        .post("/tenants/tenant-2/favorites/5")
        .auth("tenant", { type: "bearer" });
      expect(other.status).toBe(403);

      const invalid = await request(app)
        .post("/tenants/tenant-1/favorites/x")
        .auth("tenant", { type: "bearer" });
      expect(invalid.status).toBe(400);
    });

    it("lists residences and managed properties for their owners only", async () => {
      tenantService.listResidences.mockResolvedValue([]);
      propertyService.listByManager.mockResolvedValue([]);
      const residences = await request(app)
        .get("/tenants/tenant-1/current-residences")
        .auth("tenant", { type: "bearer" });
      expect(residences.status).toBe(200);

      const properties = await request(app)
        .get("/managers/manager-1/properties")
        .auth("manager", { type: "bearer" });
      expect(properties.status).toBe(200);
      expect(propertyService.listByManager).toHaveBeenCalledWith("manager-1");

      const others = await request(app)
        .get("/managers/manager-2/properties")
        .auth("manager", { type: "bearer" });
      expect(others.status).toBe(403);
    });
  });
});
