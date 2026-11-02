"use client";

import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FiltersState } from "@/state/globalSlice";
import { useLazyGeocodeLocationQuery } from "@/state/api";

type LocationSearchProps = {
  initialValue: string;
  onLocate: (location: Pick<FiltersState, "location" | "coordinates">) => void;
  inputClassName?: string;
};

export function LocationSearch({ initialValue, onLocate, inputClassName }: LocationSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const [geocode, { isFetching }] = useLazyGeocodeLocationQuery();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const location = query.trim();
    if (!location) return;

    const result = await geocode(location, true);
    if (result.error) {
      toast.error("Location search is unavailable right now");
      return;
    }
    if (!result.data) {
      toast.error(`No results for "${location}"`);
      return;
    }
    onLocate({ location, coordinates: result.data });
  };

  return (
    <form
      role="search"
      className="flex items-center"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <Input
        aria-label="Search location"
        placeholder="Search location"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className={cn("rounded-l-xl rounded-r-none border-r-0 border-primary-400", inputClassName)}
      />
      <Button
        type="submit"
        aria-label="Search"
        disabled={isFetching}
        className="rounded-l-none rounded-r-xl border border-primary-400 shadow-none hover:bg-primary-700 hover:text-primary-50"
      >
        <Search className="size-4" aria-hidden />
      </Button>
    </form>
  );
}
