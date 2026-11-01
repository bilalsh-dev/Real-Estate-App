import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { cleanParams, formatEnumString, formatPriceValue, withToast } from "@/lib/utils";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("formatEnumString", () => {
  it("splits PascalCase into words", () => {
    expect(formatEnumString("HighSpeedInternetAccess")).toBe("High Speed Internet Access");
  });

  it("leaves a single word unchanged", () => {
    expect(formatEnumString("Pool")).toBe("Pool");
  });
});

describe("formatPriceValue", () => {
  it.each([
    [null, true, "Any Min Price"],
    [0, false, "Any Max Price"],
    [500, true, "$500+"],
    [500, false, "<$500"],
    [1500, true, "$1.5k+"],
    [2000, false, "<$2k"],
  ])("formats %s (isMin=%s) as %s", (value, isMin, expected) => {
    expect(formatPriceValue(value, isMin)).toBe(expected);
  });
});

describe("cleanParams", () => {
  it("drops empty, any, null and undefined values", () => {
    expect(
      cleanParams({
        location: "",
        propertyType: "any",
        beds: null,
        baths: undefined,
        priceRange: [null, null],
        city: "Austin",
        coordinates: [-97.7, 30.2],
        amenities: [null, 2000],
      }),
    ).toEqual({ city: "Austin", coordinates: [-97.7, 30.2], amenities: [null, 2000] });
  });

  it("keeps zero and false", () => {
    expect(cleanParams({ beds: 0, isPetsAllowed: false })).toEqual({
      beds: 0,
      isPetsAllowed: false,
    });
  });
});

describe("withToast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the result and shows the success message", async () => {
    await expect(withToast(Promise.resolve(42), { success: "Saved" })).resolves.toBe(42);
    expect(toast.success).toHaveBeenCalledWith("Saved");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("rethrows and shows the error message", async () => {
    const failure = new Error("boom");
    await expect(withToast(Promise.reject(failure), { error: "Failed" })).rejects.toBe(failure);
    expect(toast.error).toHaveBeenCalledWith("Failed");
  });

  it("stays silent when no messages are given", async () => {
    await withToast(Promise.resolve("ok"), {});
    expect(toast.success).not.toHaveBeenCalled();
  });
});
