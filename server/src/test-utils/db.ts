import { Amenity, Highlight, PropertyType } from "../generated/prisma/enums.ts";
import type { Property } from "../generated/prisma/client.ts";
import type { Coordinates } from "../lib/geocoder.ts";
import { prisma } from "../lib/prisma.ts";

const TABLES = [
  "Payment",
  "Application",
  "Lease",
  "_TenantFavorites",
  "_TenantProperties",
  "Property",
  "Location",
  "Tenant",
  "Manager",
];

export async function resetDatabase(): Promise<void> {
  const tables = TABLES.map((table) => `"${table}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
}

export function createManager(cognitoId: string) {
  return prisma.manager.create({
    data: { cognitoId, name: cognitoId, email: `${cognitoId}@example.com`, phoneNumber: "" },
  });
}

export function createTenant(cognitoId: string) {
  return prisma.tenant.create({
    data: { cognitoId, name: cognitoId, email: `${cognitoId}@example.com`, phoneNumber: "" },
  });
}

type PropertyFixture = Partial<Omit<Property, "id" | "locationId" | "managerCognitoId">> & {
  managerCognitoId: string;
  coordinates?: Coordinates;
};

const LOS_ANGELES: Coordinates = { longitude: -118.25, latitude: 34.05 };

export async function createProperty({
  managerCognitoId,
  coordinates = LOS_ANGELES,
  ...overrides
}: PropertyFixture): Promise<Property> {
  const [location] = await prisma.$queryRaw<{ id: number }[]>`
    INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
    VALUES ('1 Main St', 'Los Angeles', 'CA', 'United States', '90012',
      ST_SetSRID(ST_MakePoint(${coordinates.longitude}, ${coordinates.latitude}), 4326)::geography)
    RETURNING id
  `;
  if (!location) throw new Error("Location insert returned no row");

  return prisma.property.create({
    data: {
      name: "Sunny Loft",
      description: "Bright loft",
      pricePerMonth: 2000,
      securityDeposit: 1000,
      applicationFee: 50,
      photoUrls: ["https://example.com/a.jpg"],
      amenities: [Amenity.WasherDryer],
      highlights: [Highlight.GreatView],
      beds: 2,
      baths: 1,
      squareFeet: 900,
      propertyType: PropertyType.Apartment,
      locationId: location.id,
      managerCognitoId,
      ...overrides,
    },
  });
}

export function createLease(input: {
  propertyId: number;
  tenantCognitoId: string;
  startDate: Date;
  endDate: Date;
}) {
  return prisma.lease.create({ data: { ...input, rent: 2000, deposit: 1000 } });
}

export { prisma };
