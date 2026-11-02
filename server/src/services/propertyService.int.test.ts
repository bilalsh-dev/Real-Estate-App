import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { Amenity, PropertyType } from "../generated/prisma/enums.ts";
import { ForbiddenError, NotFoundError, ValidationError } from "../lib/errors.ts";
import type { PhotoStorage } from "../lib/photoStorage.ts";
import type { CreatePropertyInput } from "../schemas/property.ts";
import {
  createLease,
  createManager,
  createProperty,
  createTenant,
  prisma,
  resetDatabase,
} from "../test-utils/db.ts";
import { createPropertyService } from "./propertyService.ts";

const BERLIN = { longitude: 13.405, latitude: 52.52 };
const PARIS = { longitude: 2.3522, latitude: 48.8566 };
const NEW_YORK = { longitude: -74.006, latitude: 40.7128 };

const geocode = vi.fn();
const storage = { upload: vi.fn() } satisfies PhotoStorage;
const service = createPropertyService({ db: prisma, geocode, storage });

const createInput: CreatePropertyInput = {
  name: "Canal View",
  description: "Two rooms by the canal",
  pricePerMonth: 1800,
  securityDeposit: 1800,
  applicationFee: 0,
  isPetsAllowed: true,
  isParkingIncluded: false,
  amenities: [Amenity.WasherDryer, Amenity.Dishwasher],
  highlights: ["GreatView"],
  beds: 2,
  baths: 1.5,
  squareFeet: 700,
  propertyType: PropertyType.Apartment,
  address: "Kottbusser Damm 1",
  city: "Berlin",
  state: "Berlin",
  country: "Germany",
  postalCode: "10967",
};

const photo = { buffer: Buffer.from("jpeg"), mimetype: "image/jpeg" };

function ids(properties: { id: number }[]) {
  return properties.map(({ id }) => id);
}

describe("propertyService (database)", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    await resetDatabase();
    await createManager("mgr-1");
    await createManager("mgr-2");
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("search", () => {
    it("returns every property with coordinates when no filter is given", async () => {
      await createProperty({ managerCognitoId: "mgr-1", coordinates: BERLIN });
      const [property] = await service.search({});
      expect(property?.location.coordinates).toEqual(BERLIN);
      expect(property?.location.city).toBe("Los Angeles");
    });

    it("filters by price, rooms, size and type", async () => {
      const match = await createProperty({
        managerCognitoId: "mgr-1",
        pricePerMonth: 1500,
        beds: 3,
        baths: 2,
        squareFeet: 1200,
        propertyType: PropertyType.Villa,
      });
      await createProperty({ managerCognitoId: "mgr-1", pricePerMonth: 900 });
      await createProperty({ managerCognitoId: "mgr-1", pricePerMonth: 1500, beds: 1 });
      await createProperty({
        managerCognitoId: "mgr-1",
        pricePerMonth: 1500,
        beds: 3,
        baths: 2,
        squareFeet: 1200,
        propertyType: PropertyType.Cottage,
      });

      const results = await service.search({
        priceMin: 1000,
        priceMax: 2000,
        beds: 2,
        baths: 1.5,
        squareFeetMin: 1000,
        squareFeetMax: 1500,
        propertyType: PropertyType.Villa,
      });
      expect(ids(results)).toEqual([match.id]);
    });

    it("requires every requested amenity", async () => {
      const both = await createProperty({
        managerCognitoId: "mgr-1",
        amenities: [Amenity.Pool, Amenity.Gym, Amenity.WiFi],
      });
      await createProperty({ managerCognitoId: "mgr-1", amenities: [Amenity.Pool] });
      const results = await service.search({ amenities: [Amenity.Pool, Amenity.Gym] });
      expect(ids(results)).toEqual([both.id]);
    });

    it("limits results to favorite ids", async () => {
      const first = await createProperty({ managerCognitoId: "mgr-1" });
      await createProperty({ managerCognitoId: "mgr-1" });
      const third = await createProperty({ managerCognitoId: "mgr-1" });
      expect(ids(await service.search({ favoriteIds: [third.id, first.id] }))).toEqual([
        first.id,
        third.id,
      ]);
    });

    it("finds properties within 1000 km of a point", async () => {
      const berlin = await createProperty({ managerCognitoId: "mgr-1", coordinates: BERLIN });
      const paris = await createProperty({ managerCognitoId: "mgr-1", coordinates: PARIS });
      await createProperty({ managerCognitoId: "mgr-1", coordinates: NEW_YORK });
      const results = await service.search(BERLIN);
      expect(ids(results)).toEqual([berlin.id, paris.id]);
    });

    it("excludes properties leased on the requested date", async () => {
      await createTenant("tenant-1");
      const leased = await createProperty({ managerCognitoId: "mgr-1" });
      const free = await createProperty({ managerCognitoId: "mgr-1" });
      await createLease({
        propertyId: leased.id,
        tenantCognitoId: "tenant-1",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2027-01-01"),
      });

      expect(ids(await service.search({ availableFrom: new Date("2026-06-01") }))).toEqual([
        free.id,
      ]);
      expect(ids(await service.search({ availableFrom: new Date("2027-02-01") }))).toEqual([
        leased.id,
        free.id,
      ]);
    });
  });

  describe("get", () => {
    it("returns the property with longitude and latitude", async () => {
      const property = await createProperty({ managerCognitoId: "mgr-1", coordinates: PARIS });
      const result = await service.get(property.id);
      expect(result.location.coordinates).toEqual(PARIS);
      expect(result.name).toBe("Sunny Loft");
    });

    it("throws NotFoundError for an unknown id", async () => {
      await expect(service.get(999)).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("create", () => {
    it("uploads every photo, geocodes the address and stores both", async () => {
      geocode.mockResolvedValue(BERLIN);
      storage.upload
        .mockResolvedValueOnce("https://bucket.s3/1.jpg")
        .mockResolvedValueOnce("https://bucket.s3/2.jpg");

      const created = await service.create("mgr-1", createInput, [photo, photo]);

      expect(storage.upload).toHaveBeenCalledTimes(2);
      expect(geocode).toHaveBeenCalledWith({
        address: "Kottbusser Damm 1",
        city: "Berlin",
        state: "Berlin",
        country: "Germany",
        postalCode: "10967",
      });
      const stored = await service.get(created.id);
      expect(stored.photoUrls).toEqual(["https://bucket.s3/1.jpg", "https://bucket.s3/2.jpg"]);
      expect(stored.location.coordinates).toEqual(BERLIN);
      expect(stored).toMatchObject({
        managerCognitoId: "mgr-1",
        amenities: [Amenity.WasherDryer, Amenity.Dishwasher],
        baths: 1.5,
        isPetsAllowed: true,
      });
    });

    it("rejects an address that cannot be located without uploading or saving", async () => {
      geocode.mockResolvedValue(null);
      await expect(service.create("mgr-1", createInput, [photo])).rejects.toBeInstanceOf(
        ValidationError,
      );
      expect(storage.upload).not.toHaveBeenCalled();
      expect(await prisma.property.count()).toBe(0);
      expect(await prisma.location.count()).toBe(0);
    });

    it("saves nothing when the manager profile does not exist", async () => {
      geocode.mockResolvedValue(BERLIN);
      storage.upload.mockResolvedValue("https://bucket.s3/1.jpg");
      await expect(service.create("ghost", createInput, [photo])).rejects.toBeInstanceOf(
        NotFoundError,
      );
      expect(await prisma.location.count()).toBe(0);
    });
  });

  describe("listByManager and listLeases", () => {
    it("lists only the manager's properties", async () => {
      const own = await createProperty({ managerCognitoId: "mgr-1" });
      await createProperty({ managerCognitoId: "mgr-2" });
      expect(ids(await service.listByManager("mgr-1"))).toEqual([own.id]);
    });

    it("lists a property's leases for its manager only", async () => {
      await createTenant("tenant-1");
      const property = await createProperty({ managerCognitoId: "mgr-1" });
      const lease = await createLease({
        propertyId: property.id,
        tenantCognitoId: "tenant-1",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2027-01-01"),
      });
      for (const dueDate of ["2026-03-01", "2026-02-01"]) {
        await prisma.payment.create({
          data: {
            leaseId: lease.id,
            amountDue: 2000,
            amountPaid: 2000,
            dueDate: new Date(dueDate),
            paymentDate: new Date(dueDate),
            paymentStatus: "Paid",
          },
        });
      }

      const leases = await service.listLeases(property.id, "mgr-1");
      expect(leases).toHaveLength(1);
      expect(leases[0]?.tenant.cognitoId).toBe("tenant-1");
      expect(leases[0]?.payments.map(({ dueDate }) => dueDate.toISOString().slice(0, 10))).toEqual([
        "2026-02-01",
        "2026-03-01",
      ]);
      await expect(service.listLeases(property.id, "mgr-2")).rejects.toBeInstanceOf(ForbiddenError);
      await expect(service.listLeases(999, "mgr-1")).rejects.toBeInstanceOf(NotFoundError);
    });
  });
});
