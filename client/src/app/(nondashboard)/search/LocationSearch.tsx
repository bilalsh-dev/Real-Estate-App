"use client";

import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocate, type LocatedPlace } from "@/hooks/use-locate";
import { cn } from "@/lib/utils";

type LocationSearchProps = {
  initialValue: string;
  onLocate: (place: LocatedPlace) => void;
  inputClassName?: string;
};

export function LocationSearch({ initialValue, onLocate, inputClassName }: LocationSearchProps) {
  const [query, setQuery] = useState(initialValue);
  const { locate, isLocating } = useLocate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const place = await locate(query);
    if (place) onLocate(place);
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
        disabled={isLocating}
        className="rounded-l-none rounded-r-xl border border-primary-400 shadow-none hover:bg-primary-700 hover:text-primary-50"
      >
        <Search className="size-4" aria-hidden />
      </Button>
    </form>
  );
}
