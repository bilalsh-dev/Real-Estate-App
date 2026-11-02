"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useLazyGeocodeLocationQuery } from "@/state/api";
import type { FiltersState } from "@/state/globalSlice";

export type LocatedPlace = Pick<FiltersState, "location" | "coordinates">;

export function useLocate() {
  const [geocode, { isFetching }] = useLazyGeocodeLocationQuery();

  const locate = useCallback(
    async (query: string): Promise<LocatedPlace | null> => {
      const location = query.trim();
      if (!location) return null;

      const result = await geocode(location, true);
      if (result.error) {
        toast.error("Location search is unavailable right now");
        return null;
      }
      if (!result.data) {
        toast.error(`No results for "${location}"`);
        return null;
      }
      return { location, coordinates: result.data };
    },
    [geocode],
  );

  return { locate, isLocating: isFetching };
}
