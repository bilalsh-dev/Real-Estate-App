"use client";

import { Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BATH_OPTIONS,
  BED_OPTIONS,
  MAX_PRICE_OPTIONS,
  MIN_PRICE_OPTIONS,
  PROPERTY_TYPE_ICONS,
  ViewMode,
  type PropertyType,
} from "@/lib/constants";
import { cn, formatPriceValue } from "@/lib/utils";
import { setViewMode, toggleFiltersFullOpen } from "@/state/globalSlice";
import { useAppDispatch, useAppSelector } from "@/state/store";
import { LocationSearch } from "./LocationSearch";
import { useSearchFilters } from "./use-search-filters";

const ANY = "any";
const TRIGGER_CLASS = "rounded-xl border-primary-400";

function toSelectValue(value: number | string | null): string {
  return value === null ? ANY : String(value);
}

function fromSelectNumber(value: string): number | null {
  return value === ANY ? null : Number(value);
}

export function FiltersBar() {
  const dispatch = useAppDispatch();
  const { filters, applyFilters } = useSearchFilters();
  const isFiltersFullOpen = useAppSelector((state) => state.global.isFiltersFullOpen);
  const viewMode = useAppSelector((state) => state.global.viewMode);
  const [priceMin, priceMax] = filters.priceRange;

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2 py-5">
      <div className="flex flex-wrap items-center gap-4 p-2">
        <Button
          variant="outline"
          aria-pressed={isFiltersFullOpen}
          className={cn(
            "gap-2 rounded-xl border-primary-400 hover:bg-primary-500 hover:text-primary-100",
            isFiltersFullOpen && "bg-primary-700 text-primary-100",
          )}
          onClick={() => dispatch(toggleFiltersFullOpen())}
        >
          <Filter className="size-4" aria-hidden />
          <span>All Filters</span>
        </Button>

        <LocationSearch
          key={filters.location}
          initialValue={filters.location}
          onLocate={applyFilters}
          inputClassName="w-40"
        />

        <div className="flex gap-1">
          <Select
            value={toSelectValue(priceMin)}
            onValueChange={(value) =>
              applyFilters({ priceRange: [fromSelectNumber(value), priceMax] })
            }
          >
            <SelectTrigger className={TRIGGER_CLASS} aria-label="Minimum price">
              <SelectValue>{formatPriceValue(priceMin, true)}</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value={ANY}>Any Min Price</SelectItem>
              {MIN_PRICE_OPTIONS.map((price) => (
                <SelectItem key={price} value={String(price)}>
                  {formatPriceValue(price, true)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={toSelectValue(priceMax)}
            onValueChange={(value) =>
              applyFilters({ priceRange: [priceMin, fromSelectNumber(value)] })
            }
          >
            <SelectTrigger className={TRIGGER_CLASS} aria-label="Maximum price">
              <SelectValue>{formatPriceValue(priceMax, false)}</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value={ANY}>Any Max Price</SelectItem>
              {MAX_PRICE_OPTIONS.map((price) => (
                <SelectItem key={price} value={String(price)}>
                  {formatPriceValue(price, false)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-1">
          <Select
            value={toSelectValue(filters.beds)}
            onValueChange={(value) => applyFilters({ beds: fromSelectNumber(value) })}
          >
            <SelectTrigger className={TRIGGER_CLASS} aria-label="Beds">
              <SelectValue placeholder="Beds" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value={ANY}>Any Beds</SelectItem>
              {BED_OPTIONS.map((beds) => (
                <SelectItem key={beds} value={String(beds)}>
                  {beds}+ {beds === 1 ? "bed" : "beds"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={toSelectValue(filters.baths)}
            onValueChange={(value) => applyFilters({ baths: fromSelectNumber(value) })}
          >
            <SelectTrigger className={TRIGGER_CLASS} aria-label="Baths">
              <SelectValue placeholder="Baths" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value={ANY}>Any Baths</SelectItem>
              {BATH_OPTIONS.map((baths) => (
                <SelectItem key={baths} value={String(baths)}>
                  {baths}+ {baths === 1 ? "bath" : "baths"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select
          value={toSelectValue(filters.propertyType)}
          onValueChange={(value) =>
            applyFilters({ propertyType: value === ANY ? null : (value as PropertyType) })
          }
        >
          <SelectTrigger className={TRIGGER_CLASS} aria-label="Property type">
            <SelectValue placeholder="Home Type" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value={ANY}>Any Property Type</SelectItem>
            {Object.entries(PROPERTY_TYPE_ICONS).map(([type, Icon]) => (
              <SelectItem key={type} value={type}>
                <Icon className="size-4" aria-hidden />
                <span>{type}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex rounded-xl border p-0" role="group" aria-label="View mode">
        <Button
          variant="ghost"
          aria-label="List view"
          aria-pressed={viewMode === ViewMode.List}
          className={cn(
            "rounded-none rounded-l-xl px-3 py-1 hover:bg-primary-600 hover:text-primary-50",
            viewMode === ViewMode.List && "bg-primary-700 text-primary-50",
          )}
          onClick={() => dispatch(setViewMode(ViewMode.List))}
        >
          <List className="size-5" aria-hidden />
        </Button>
        <Button
          variant="ghost"
          aria-label="Grid view"
          aria-pressed={viewMode === ViewMode.Grid}
          className={cn(
            "rounded-none rounded-r-xl px-3 py-1 hover:bg-primary-600 hover:text-primary-50",
            viewMode === ViewMode.Grid && "bg-primary-700 text-primary-50",
          )}
          onClick={() => dispatch(setViewMode(ViewMode.Grid))}
        >
          <Grid className="size-5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
