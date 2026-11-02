import { describe, expect, it } from "vitest";
import {
  DEFAULT_FILTERS,
  globalSlice,
  resetFilters,
  setFilters,
  setViewMode,
  toggleFiltersFullOpen,
} from "@/state/globalSlice";

const reducer = globalSlice.reducer;
const initial = reducer(undefined, { type: "init" });

describe("globalSlice", () => {
  it("starts with the default filters, the panel closed and grid view", () => {
    expect(initial).toEqual({
      filters: DEFAULT_FILTERS,
      isFiltersFullOpen: false,
      viewMode: "grid",
    });
  });

  it("merges partial filter updates", () => {
    const once = reducer(initial, setFilters({ beds: 2 }));
    const twice = reducer(once, setFilters({ amenities: ["Pool"], priceRange: [1000, null] }));
    expect(twice.filters).toEqual({
      ...DEFAULT_FILTERS,
      beds: 2,
      amenities: ["Pool"],
      priceRange: [1000, null],
    });
    expect(twice.viewMode).toBe(initial.viewMode);
  });

  it("resets filters without touching the view", () => {
    const changed = reducer(reducer(initial, setViewMode("list")), setFilters({ beds: 3 }));
    const reset = reducer(changed, resetFilters());
    expect(reset.filters).toEqual(DEFAULT_FILTERS);
    expect(reset.viewMode).toBe("list");
  });

  it("toggles the full filters panel and sets the view mode only", () => {
    const opened = reducer(initial, toggleFiltersFullOpen());
    expect(opened).toEqual({ ...initial, isFiltersFullOpen: true });
    expect(reducer(opened, toggleFiltersFullOpen()).isFiltersFullOpen).toBe(false);
    expect(reducer(initial, setViewMode("list"))).toEqual({ ...initial, viewMode: "list" });
  });
});
