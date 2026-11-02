"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { filtersToSearchParams } from "@/lib/searchFilters";
import { DEFAULT_FILTERS, type FiltersState } from "@/state/globalSlice";
import { useAppSelector } from "@/state/store";

export function useSearchFilters() {
  const filters = useAppSelector((state) => state.global.filters);
  const router = useRouter();
  const pathname = usePathname();

  const navigate = useCallback(
    (next: FiltersState) => {
      router.replace(`${pathname}?${filtersToSearchParams(next).toString()}`, { scroll: false });
    },
    [pathname, router],
  );

  const applyFilters = useCallback(
    (changes: Partial<FiltersState>) => navigate({ ...filters, ...changes }),
    [filters, navigate],
  );

  const resetFilters = useCallback(() => navigate(DEFAULT_FILTERS), [navigate]);

  return { filters, applyFilters, resetFilters };
}
