"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { NAVBAR_HEIGHT_PX } from "@/lib/constants";
import { filtersFromSearchParams, filtersToSearchParams } from "@/lib/searchFilters";
import { cn } from "@/lib/utils";
import { useGetPropertiesQuery } from "@/state/api";
import { setFilters } from "@/state/globalSlice";
import { useAppDispatch, useAppSelector } from "@/state/store";
import { FiltersBar } from "./FiltersBar";
import { FiltersFull } from "./FiltersFull";
import { Listings } from "./Listings";
import { SearchMap } from "./SearchMap";

export function SearchView() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () => filtersFromSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const isFiltersFullOpen = useAppSelector((state) => state.global.isFiltersFullOpen);
  const { data: properties, isLoading, isError } = useGetPropertiesQuery(filters);

  useEffect(() => {
    dispatch(setFilters(filters));
  }, [dispatch, filters]);

  return (
    <div
      className="mx-auto flex w-full flex-col px-5"
      style={{ height: `calc(100svh - ${NAVBAR_HEIGHT_PX}px)` }}
    >
      <FiltersBar />
      <div className="mb-5 flex flex-1 justify-between gap-3 overflow-hidden">
        <div
          className={cn(
            "h-full overflow-auto transition-all duration-300 ease-in-out",
            isFiltersFullOpen ? "visible w-3/12 opacity-100" : "invisible w-0 opacity-0",
          )}
        >
          {isFiltersFullOpen && <FiltersFull key={filtersToSearchParams(filters).toString()} />}
        </div>
        <SearchMap center={filters.coordinates} properties={properties ?? []} />
        <div className="basis-4/12 overflow-y-auto">
          {isLoading && (
            <p role="status" className="p-4 text-gray-600">
              Loading properties…
            </p>
          )}
          {isError && (
            <p role="alert" className="p-4 text-red-600">
              We couldn&apos;t load properties. Please try again.
            </p>
          )}
          {properties && <Listings properties={properties} location={filters.location} />}
        </div>
      </div>
    </div>
  );
}
