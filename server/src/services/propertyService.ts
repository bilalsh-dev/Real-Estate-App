import type { Lease, Payment, PrismaClient, Property, Tenant } from "../generated/prisma/client.ts";
import { ForbiddenError, NotFoundError, ValidationError } from "../lib/errors.ts";
import type { Geocoder } from "../lib/geocoder.ts";
import type { PhotoFile, PhotoStorage } from "../lib/photoStorage.ts";
import { hasPrismaErrorCode, PrismaErrorCode } from "../lib/prismaErrors.ts";
import type { CreatePropertyInput, PropertyFilters } from "../schemas/property.ts";
import { attachCoordinates, type LocationWithCoordinates } from "./locationCoordinates.ts";
import { buildPropertySearchQuery } from "./propertyFilters.ts";

export type PropertyWithLocation = Property & { location: LocationWithCoordinates };

export type PropertyService = {
  search(filters: PropertyFilters): Promise<PropertyWithLocation[]>;
  get(id: number): Promise<PropertyWithLocation>;
  create(
    managerCognitoId: string,
    input: CreatePropertyInput,
    photos: PhotoFile[],
  ): Promise<PropertyWithLocation>;
  listByManager(managerCognitoId: string): Promise<PropertyWithLocation[]>;
  listLeases(
    propertyId: number,
    managerCognitoId: string,
  ): Promise<(Lease & { tenant: Tenant; payments: Payment[] })[]>;
};

type PropertyServiceDependencies = {
  db: PrismaClient;
  geocode: Geocoder;
  storage: PhotoStorage;
};

const PROPERTY_NOT_FOUND = "Property not found";

export function createPropertyService({
  db,
  geocode,
  storage,
}: PropertyServiceDependencies): PropertyService {
  async function withLocations(where: { id?: { in: number[] }; managerCognitoId?: string }) {
    const properties = await db.property.findMany({
      where,
      include: { location: true },
      orderBy: { id: "asc" },
    });
    return attachCoordinates(db, properties);
  }

  return {
    async search(filters) {
      const rows = await db.$queryRaw<{ id: number }[]>(buildPropertySearchQuery(filters));
      if (rows.length === 0) return [];
      return withLocations({ id: { in: rows.map(({ id }) => id) } });
    },

    async get(id) {
      const property = await db.property.findUnique({ where: { id }, include: { location: true } });
      if (!property) throw new NotFoundError(PROPERTY_NOT_FOUND);
      const [withCoordinates] = await attachCoordinates(db, [property]);
      if (!withCoordinates) throw new NotFoundError(PROPERTY_NOT_FOUND);
      return withCoordinates;
    },

    async create(managerCognitoId, input, photos) {
      const { address, city, state, country, postalCode, ...details } = input;

      const coordinates = await geocode({ address, city, state, country, postalCode });
      if (!coordinates) {
        throw new ValidationError([
          { path: "body.address", message: "The address could not be located" },
        ]);
      }

      const photoUrls = await Promise.all(photos.map((photo) => storage.upload(photo)));

      try {
        const property = await db.$transaction(async (tx) => {
          const [location] = await tx.$queryRaw<{ id: number }[]>`
            INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
            VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode},
              ST_SetSRID(ST_MakePoint(${coordinates.longitude}, ${coordinates.latitude}), 4326)::geography)
            RETURNING id
          `;
          if (!location) throw new Error("Location insert returned no row");

          return tx.property.create({
            data: { ...details, photoUrls, locationId: location.id, managerCognitoId },
            include: { location: true },
          });
        });
        return { ...property, location: { ...property.location, coordinates } };
      } catch (error) {
        if (hasPrismaErrorCode(error, PrismaErrorCode.ForeignKeyConstraint)) {
          throw new NotFoundError("Manager not found");
        }
        throw error;
      }
    },

    listByManager(managerCognitoId) {
      return withLocations({ managerCognitoId });
    },

    async listLeases(propertyId, managerCognitoId) {
      const property = await db.property.findUnique({
        where: { id: propertyId },
        select: { managerCognitoId: true },
      });
      if (!property) throw new NotFoundError(PROPERTY_NOT_FOUND);
      if (property.managerCognitoId !== managerCognitoId) {
        throw new ForbiddenError("You can only view leases of your own properties");
      }
      return db.lease.findMany({
        where: { propertyId },
        include: { tenant: true, payments: { orderBy: { dueDate: "asc" } } },
        orderBy: { startDate: "desc" },
      });
    },
  };
}
