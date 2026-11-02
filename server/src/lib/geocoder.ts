import { z } from "zod";
import { GEOCODER_USER_AGENT, NOMINATIM_SEARCH_URL } from "../config/constants.ts";

export type Coordinates = {
  longitude: number;
  latitude: number;
};

export type PostalAddress = {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

export type Geocoder = (address: PostalAddress) => Promise<Coordinates | null>;

const nominatimResultsSchema = z.array(
  z.object({
    lat: z.coerce.number().min(-90).max(90),
    lon: z.coerce.number().min(-180).max(180),
  }),
);

export function createNominatimGeocoder(fetchFn: typeof fetch = fetch): Geocoder {
  return async ({ address, city, state, country, postalCode }) => {
    const params = new URLSearchParams({
      street: address,
      city,
      state,
      country,
      postalcode: postalCode,
      format: "jsonv2",
      limit: "1",
    });

    const response = await fetchFn(`${NOMINATIM_SEARCH_URL}?${params.toString()}`, {
      headers: { "User-Agent": GEOCODER_USER_AGENT, Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Geocoding failed with status ${response.status}`);

    const [match] = nominatimResultsSchema.parse(await response.json());
    return match ? { longitude: match.lon, latitude: match.lat } : null;
  };
}
