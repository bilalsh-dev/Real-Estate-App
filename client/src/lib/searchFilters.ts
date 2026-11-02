import { z } from "zod";
import { Amenity, PropertyType } from "@/lib/constants";
import { DEFAULT_FILTERS, type FiltersState, type NumberRange } from "@/state/globalSlice";

const LIST_SEPARATOR = ",";

const nonNegative = z.coerce.number<string>().nonnegative();
const isoDate = z.iso.date();

function parseRange(value: string): NumberRange | undefined {
  const parts = value.split(LIST_SEPARATOR);
  if (parts.length !== 2) return undefined;
  const range = parts.map((part) => (part === "" ? null : nonNegative.safeParse(part).data));
  if (range.some((bound) => bound === undefined)) return undefined;
  return range as NumberRange;
}

function parseCoordinates(value: string): FiltersState["coordinates"] | undefined {
  const parsed = z
    .tuple([
      z.coerce.number<string>().min(-180).max(180),
      z.coerce.number<string>().min(-90).max(90),
    ])
    .safeParse(value.split(LIST_SEPARATOR));
  return parsed.success ? parsed.data : undefined;
}

const PARSERS: { [K in keyof FiltersState]: (value: string) => FiltersState[K] | undefined } = {
  location: (value) => value.trim() || undefined,
  coordinates: parseCoordinates,
  beds: (value) => z.coerce.number<string>().int().positive().safeParse(value).data,
  baths: (value) => z.coerce.number<string>().positive().safeParse(value).data,
  propertyType: (value) => z.enum(PropertyType).safeParse(value).data,
  amenities: (value) => z.array(z.enum(Amenity)).min(1).safeParse(value.split(LIST_SEPARATOR)).data,
  availableFrom: (value) => isoDate.safeParse(value).data,
  priceRange: parseRange,
  squareFeet: parseRange,
};

const FILTER_KEYS = Object.keys(PARSERS) as (keyof FiltersState)[];

function serialize(value: FiltersState[keyof FiltersState]): string | null {
  if (value === null) return null;
  if (Array.isArray(value)) {
    if (value.length === 0 || value.every((item) => item === null)) return null;
    return value.map((item) => (item === null ? "" : String(item))).join(LIST_SEPARATOR);
  }
  return String(value);
}

export function filtersToSearchParams(filters: FiltersState): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = serialize(filters[key]);
    if (value !== null && value !== "") params.set(key, value);
  }
  return params;
}

export function filtersFromSearchParams(params: URLSearchParams): FiltersState {
  const filters: Record<string, unknown> = { ...DEFAULT_FILTERS };
  for (const key of FILTER_KEYS) {
    const raw = params.get(key);
    if (raw === null) continue;
    const parsed = PARSERS[key](raw);
    if (parsed !== undefined) filters[key] = parsed;
  }
  return filters as FiltersState;
}
