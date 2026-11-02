import { SEARCH_RADIUS_METERS } from "../config/constants.ts";
import { Prisma } from "../generated/prisma/client.ts";
import type { PropertyFilters } from "../schemas/property.ts";

export function buildPropertyFilterConditions(filters: PropertyFilters): Prisma.Sql[] {
  const conditions: Prisma.Sql[] = [];

  if (filters.favoriteIds) {
    conditions.push(Prisma.sql`p.id IN (${Prisma.join(filters.favoriteIds)})`);
  }
  if (filters.priceMin !== undefined) {
    conditions.push(Prisma.sql`p."pricePerMonth" >= ${filters.priceMin}`);
  }
  if (filters.priceMax !== undefined) {
    conditions.push(Prisma.sql`p."pricePerMonth" <= ${filters.priceMax}`);
  }
  if (filters.beds !== undefined) {
    conditions.push(Prisma.sql`p.beds >= ${filters.beds}`);
  }
  if (filters.baths !== undefined) {
    conditions.push(Prisma.sql`p.baths >= ${filters.baths}`);
  }
  if (filters.propertyType) {
    conditions.push(Prisma.sql`p."propertyType" = ${filters.propertyType}::"PropertyType"`);
  }
  if (filters.squareFeetMin !== undefined) {
    conditions.push(Prisma.sql`p."squareFeet" >= ${filters.squareFeetMin}`);
  }
  if (filters.squareFeetMax !== undefined) {
    conditions.push(Prisma.sql`p."squareFeet" <= ${filters.squareFeetMax}`);
  }
  if (filters.amenities) {
    conditions.push(Prisma.sql`p.amenities @> ${filters.amenities}::"Amenity"[]`);
  }
  if (filters.availableFrom) {
    conditions.push(Prisma.sql`NOT EXISTS (
      SELECT 1 FROM "Lease" le
      WHERE le."propertyId" = p.id
        AND le."startDate" <= ${filters.availableFrom}
        AND le."endDate" > ${filters.availableFrom}
    )`);
  }
  if (filters.latitude !== undefined && filters.longitude !== undefined) {
    conditions.push(Prisma.sql`ST_DWithin(
      l.coordinates,
      ST_SetSRID(ST_MakePoint(${filters.longitude}, ${filters.latitude}), 4326)::geography,
      ${SEARCH_RADIUS_METERS}
    )`);
  }

  return conditions;
}

export function buildPropertySearchQuery(filters: PropertyFilters): Prisma.Sql {
  const conditions = buildPropertyFilterConditions(filters);
  const where =
    conditions.length > 0 ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}` : Prisma.empty;
  return Prisma.sql`SELECT p.id FROM "Property" p JOIN "Location" l ON p."locationId" = l.id ${where} ORDER BY p.id`;
}
