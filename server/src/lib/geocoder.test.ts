import { describe, expect, it, vi } from "vitest";
import { GEOCODER_USER_AGENT, NOMINATIM_SEARCH_URL } from "../config/constants.ts";
import { createNominatimGeocoder } from "./geocoder.ts";

const address = {
  address: "Kottbusser Damm 1",
  city: "Berlin",
  state: "Berlin",
  country: "Germany",
  postalCode: "10967",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("createNominatimGeocoder", () => {
  it("queries Nominatim with the structured address and an identifying User-Agent", async () => {
    const fetchFn = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse([{ lat: "52.49", lon: "13.42" }]));
    const coordinates = await createNominatimGeocoder(fetchFn)(address);

    expect(coordinates).toEqual({ latitude: 52.49, longitude: 13.42 });
    const [url, init] = fetchFn.mock.calls[0] ?? [];
    if (typeof url !== "string") throw new Error("Expected a string URL");
    const requested = new URL(url);
    expect(`${requested.origin}${requested.pathname}`).toBe(NOMINATIM_SEARCH_URL);
    expect(Object.fromEntries(requested.searchParams)).toEqual({
      street: "Kottbusser Damm 1",
      city: "Berlin",
      state: "Berlin",
      country: "Germany",
      postalcode: "10967",
      format: "jsonv2",
      limit: "1",
    });
    expect(init?.headers).toMatchObject({ "User-Agent": GEOCODER_USER_AGENT });
  });

  it("returns null when nothing matches", async () => {
    const fetchFn = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse([]));
    await expect(createNominatimGeocoder(fetchFn)(address)).resolves.toBeNull();
  });

  it("fails on an error response or an unexpected payload", async () => {
    const failing = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}, 503));
    await expect(createNominatimGeocoder(failing)(address)).rejects.toThrow(/503/);

    const malformed = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse([{ lat: "north" }]));
    await expect(createNominatimGeocoder(malformed)(address)).rejects.toThrow();
  });
});
