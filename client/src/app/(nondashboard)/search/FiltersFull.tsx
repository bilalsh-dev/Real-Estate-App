"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  AMENITY_ICONS,
  BATH_OPTIONS,
  BED_OPTIONS,
  PRICE_SLIDER,
  PROPERTY_TYPE_ICONS,
  SQUARE_FEET_SLIDER,
  type Amenity,
  type PropertyType,
} from "@/lib/constants";
import { cn, formatEnumString } from "@/lib/utils";
import type { FiltersState, NumberRange } from "@/state/globalSlice";
import { LocationSearch } from "./LocationSearch";
import { useSearchFilters } from "./use-search-filters";

const ANY = "any";
const OPTION_CLASS = "rounded-xl border cursor-pointer";

function sliderValue(range: NumberRange, bounds: { min: number; max: number }): number[] {
  return [range[0] ?? bounds.min, range[1] ?? bounds.max];
}

function rangeFromSlider(values: number[], bounds: { min: number; max: number }): NumberRange {
  const [min = bounds.min, max = bounds.max] = values;
  return [min === bounds.min ? null : min, max === bounds.max ? null : max];
}

export function FiltersFull() {
  const { filters, applyFilters, resetFilters } = useSearchFilters();
  const [draft, setDraft] = useState<FiltersState>(filters);

  const update = (changes: Partial<FiltersState>) => setDraft((prev) => ({ ...prev, ...changes }));

  const toggleAmenity = (amenity: Amenity) =>
    update({
      amenities: draft.amenities.includes(amenity)
        ? draft.amenities.filter((item) => item !== amenity)
        : [...draft.amenities, amenity],
    });

  const [priceMin, priceMax] = sliderValue(draft.priceRange, PRICE_SLIDER);
  const [sizeMin, sizeMax] = sliderValue(draft.squareFeet, SQUARE_FEET_SLIDER);

  return (
    <section
      aria-label="All filters"
      className="h-full overflow-auto rounded-lg bg-white px-4 pb-10"
    >
      <div className="flex flex-col space-y-6">
        <div>
          <h4 className="mb-2 font-bold">Location</h4>
          <LocationSearch initialValue={draft.location} onLocate={update} />
        </div>

        <fieldset>
          <legend className="mb-2 font-bold">Property Type</legend>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(PROPERTY_TYPE_ICONS).map(([type, Icon]) => (
              <button
                key={type}
                type="button"
                aria-pressed={draft.propertyType === type}
                className={cn(
                  OPTION_CLASS,
                  "flex flex-col items-center justify-center p-4",
                  draft.propertyType === type ? "border-black" : "border-gray-200",
                )}
                onClick={() =>
                  update({
                    propertyType: draft.propertyType === type ? null : (type as PropertyType),
                  })
                }
              >
                <Icon className="mb-2 size-6" aria-hidden />
                <span>{type}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <h4 className="mb-2 font-bold">Price Range (Monthly)</h4>
          <Slider
            aria-label="Price range"
            min={PRICE_SLIDER.min}
            max={PRICE_SLIDER.max}
            step={PRICE_SLIDER.step}
            value={[priceMin, priceMax]}
            onValueChange={(values) =>
              update({ priceRange: rangeFromSlider(values, PRICE_SLIDER) })
            }
          />
          <div className="mt-2 flex justify-between">
            <span>${priceMin}</span>
            <span>${priceMax}</span>
          </div>
        </div>

        <div className="flex gap-4">
          {(
            [
              ["beds", "Beds", BED_OPTIONS, "bed"],
              ["baths", "Baths", BATH_OPTIONS, "bath"],
            ] as const
          ).map(([key, label, options, unit]) => (
            <div key={key} className="flex-1">
              <h4 className="mb-2 font-bold">{label}</h4>
              <Select
                value={draft[key] === null ? ANY : String(draft[key])}
                onValueChange={(value) => update({ [key]: value === ANY ? null : Number(value) })}
              >
                <SelectTrigger className="w-full rounded-xl" aria-label={label}>
                  <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Any {unit}s</SelectItem>
                  {options.map((count) => (
                    <SelectItem key={count} value={String(count)}>
                      {count}+ {count === 1 ? unit : `${unit}s`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div>
          <h4 className="mb-2 font-bold">Square Feet</h4>
          <Slider
            aria-label="Square feet"
            min={SQUARE_FEET_SLIDER.min}
            max={SQUARE_FEET_SLIDER.max}
            step={SQUARE_FEET_SLIDER.step}
            value={[sizeMin, sizeMax]}
            onValueChange={(values) =>
              update({ squareFeet: rangeFromSlider(values, SQUARE_FEET_SLIDER) })
            }
          />
          <div className="mt-2 flex justify-between">
            <span>{sizeMin} sq ft</span>
            <span>{sizeMax} sq ft</span>
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 font-bold">Amenities</legend>
          <div className="flex flex-wrap gap-2">
            {Object.entries(AMENITY_ICONS).map(([amenity, Icon]) => {
              const selected = draft.amenities.includes(amenity as Amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  aria-pressed={selected}
                  className={cn(
                    OPTION_CLASS,
                    "flex items-center gap-2 p-2",
                    selected ? "border-black" : "border-gray-200",
                  )}
                  onClick={() => toggleAmenity(amenity as Amenity)}
                >
                  <Icon className="size-5" aria-hidden />
                  <span className="text-sm">{formatEnumString(amenity)}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="available-from" className="mb-2 block font-bold">
            Available From
          </label>
          <Input
            id="available-from"
            type="date"
            value={draft.availableFrom ?? ""}
            onChange={(event) => update({ availableFrom: event.target.value || null })}
            className="rounded-xl"
          />
        </div>

        <div className="mt-6 flex gap-4">
          <Button
            className="flex-1 rounded-xl bg-primary-700 text-white"
            onClick={() => applyFilters(draft)}
          >
            Apply
          </Button>
          <Button variant="outline" className="flex-1 rounded-xl" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      </div>
    </section>
  );
}
