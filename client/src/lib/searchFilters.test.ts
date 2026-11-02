import { describe, expect, it } from "vitest";
import { filtersFromSearchParams, filtersToSearchParams } from "@/lib/searchFilters";
import { DEFAULT_FILTERS, type FiltersState } from "@/state/globalSlice";

const filters: FiltersState = {
  location: "Berlin",
  coordinates: [13.405, 52.52],
  beds: 2,
  baths: 1.5,
  propertyType: "Villa",
  amenities: ["Pool", "Gym"],
  availableFrom: "2026-06-01",
  priceRange: [1000, null],
  squareFeet: [null, 2000],
};

describe("search filter URL sync", () => {
  it("serializes only set filters", () => {
    expect(Object.fromEntries(filtersToSearchParams(filters))).toEqual({
      location: "Berlin",
      coordinates: "13.405,52.52",
      beds: "2",
      baths: "1.5",
      propertyType: "Villa",
      amenities: "Pool,Gym",
      availableFrom: "2026-06-01",
      priceRange: "1000,",
      squareFeet: ",2000",
    });
    expect(Object.fromEntries(filtersToSearchParams({ ...DEFAULT_FILTERS }))).toEqual({
      location: DEFAULT_FILTERS.location,
      coordinates: DEFAULT_FILTERS.coordinates.join(","),
    });
  });

  it("parses back to the same state", () => {
    expect(filtersFromSearchParams(filtersToSearchParams(filters))).toEqual(filters);
    expect(filtersFromSearchParams(filtersToSearchParams(DEFAULT_FILTERS))).toEqual(
      DEFAULT_FILTERS,
    );
  });

  it("falls back to defaults for missing params", () => {
    expect(filtersFromSearchParams(new URLSearchParams("location=Paris"))).toEqual({
      ...DEFAULT_FILTERS,
      location: "Paris",
    });
  });

  it.each([
    ["beds=many", "beds"],
    ["beds=-1", "beds"],
    ["baths=0", "baths"],
    ["propertyType=Castle", "propertyType"],
    ["amenities=Pool,Helipad", "amenities"],
    ["availableFrom=tomorrow", "availableFrom"],
    ["priceRange=abc,100", "priceRange"],
    ["priceRange=100", "priceRange"],
    ["coordinates=200,10", "coordinates"],
    ["coordinates=1", "coordinates"],
    ["location=%20%20", "location"],
  ] as const)("ignores the invalid param %s", (query, key) => {
    expect(filtersFromSearchParams(new URLSearchParams(query))[key]).toEqual(DEFAULT_FILTERS[key]);
  });
});
