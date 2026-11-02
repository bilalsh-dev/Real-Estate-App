import { describe, expect, it } from "vitest";
import { SEARCH_RADIUS_METERS } from "../config/constants.ts";
import { buildPropertyFilterConditions, buildPropertySearchQuery } from "./propertyFilters.ts";

describe("buildPropertyFilterConditions", () => {
  it("adds nothing when no filter is given", () => {
    expect(buildPropertyFilterConditions({})).toEqual([]);
    expect(buildPropertySearchQuery({}).sql).not.toContain("WHERE");
  });

  it.each([
    [{ priceMin: 1000 }, 'p."pricePerMonth" >= ?', [1000]],
    [{ priceMax: 3000 }, 'p."pricePerMonth" <= ?', [3000]],
    [{ beds: 2 }, "p.beds >= ?", [2]],
    [{ baths: 1.5 }, "p.baths >= ?", [1.5]],
    [{ propertyType: "Villa" as const }, 'p."propertyType" = ?::"PropertyType"', ["Villa"]],
    [{ squareFeetMin: 500 }, 'p."squareFeet" >= ?', [500]],
    [{ squareFeetMax: 900 }, 'p."squareFeet" <= ?', [900]],
    [{ amenities: ["Pool" as const] }, 'p.amenities @> ?::"Amenity"[]', [["Pool"]]],
    [{ favoriteIds: [3, 4] }, "p.id IN (?,?)", [3, 4]],
  ])("builds a parameterized condition for %o", (filters, sql, values) => {
    const [condition, ...rest] = buildPropertyFilterConditions(filters);
    expect(rest).toEqual([]);
    expect(condition?.sql).toBe(sql);
    expect(condition?.values).toEqual(values);
  });

  it("excludes properties with a lease covering the available-from date", () => {
    const date = new Date("2026-06-01");
    const [condition] = buildPropertyFilterConditions({ availableFrom: date });
    expect(condition?.sql).toContain("NOT EXISTS");
    expect(condition?.values).toEqual([date, date]);
  });

  it("searches within the radius around longitude and latitude", () => {
    const [condition] = buildPropertyFilterConditions({ latitude: 52.5, longitude: 13.4 });
    expect(condition?.sql).toContain("ST_DWithin");
    expect(condition?.values).toEqual([13.4, 52.5, SEARCH_RADIUS_METERS]);
  });

  it("never interpolates values into the SQL text", () => {
    const query = buildPropertySearchQuery({
      priceMin: 1234,
      propertyType: "Villa",
      amenities: ["Pool"],
      favoriteIds: [987],
      latitude: 52.5,
      longitude: 13.4,
    });
    for (const value of ["1234", "Villa", "Pool", "987", "52.5", "13.4"]) {
      expect(query.sql).not.toContain(value);
    }
    expect(query.sql).toContain(" AND ");
  });
});
