import { Prisma, type Location, type PrismaClient } from "../generated/prisma/client.ts";
import type { Coordinates } from "../lib/geocoder.ts";

type CoordinatesRow = Coordinates & { id: number };

export type LocationWithCoordinates = Location & { coordinates: Coordinates };

export type WithCoordinates<T extends { location: Location }> = Omit<T, "location"> & {
  location: LocationWithCoordinates;
};

export async function attachCoordinates<T extends { location: Location }>(
  db: Pick<PrismaClient, "$queryRaw">,
  properties: T[],
): Promise<WithCoordinates<T>[]> {
  const locationIds = [...new Set(properties.map((property) => property.location.id))];
  if (locationIds.length === 0) return [];

  const rows = await db.$queryRaw<CoordinatesRow[]>`
    SELECT id, ST_X(coordinates::geometry) AS longitude, ST_Y(coordinates::geometry) AS latitude
    FROM "Location"
    WHERE id IN (${Prisma.join(locationIds)})
  `;
  const byId = new Map(rows.map(({ id, longitude, latitude }) => [id, { longitude, latitude }]));

  return properties.map((property) => {
    const coordinates = byId.get(property.location.id);
    if (!coordinates) throw new Error(`Location ${property.location.id} has no coordinates`);
    return { ...property, location: { ...property.location, coordinates } };
  });
}
