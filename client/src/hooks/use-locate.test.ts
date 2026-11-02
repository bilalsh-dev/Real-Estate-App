import { renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocate } from "./use-locate";

const geocode = vi.fn();

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
vi.mock("@/state/api", () => ({
  useLazyGeocodeLocationQuery: () => [geocode, { isFetching: false }],
}));

describe("useLocate", () => {
  beforeEach(() => {
    geocode.mockReset();
    vi.mocked(toast.error).mockClear();
  });

  it("returns the trimmed location with its coordinates", async () => {
    geocode.mockResolvedValue({ data: [-97.74, 30.27] });
    const { result } = renderHook(() => useLocate());
    await expect(result.current.locate("  Austin ")).resolves.toEqual({
      location: "Austin",
      coordinates: [-97.74, 30.27],
    });
    expect(geocode).toHaveBeenCalledWith("Austin", true);
  });

  it("skips blank queries", async () => {
    const { result } = renderHook(() => useLocate());
    await expect(result.current.locate("   ")).resolves.toBeNull();
    expect(geocode).not.toHaveBeenCalled();
  });

  it.each([
    [{ data: null }, 'No results for "Nowhere"'],
    [{ error: { status: "CUSTOM_ERROR" } }, "Location search is unavailable right now"],
  ])("reports %o with a toast", async (response, message) => {
    geocode.mockResolvedValue(response);
    const { result } = renderHook(() => useLocate());
    await expect(result.current.locate("Nowhere")).resolves.toBeNull();
    expect(toast.error).toHaveBeenCalledWith(message);
  });
});
