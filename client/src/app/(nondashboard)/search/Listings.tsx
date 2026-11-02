"use client";

import { Card } from "@/components/Card";
import { CardCompact } from "@/components/CardCompact";
import { useFavorites } from "@/hooks/use-favorites";
import { ViewMode } from "@/lib/constants";
import { useAppSelector } from "@/state/store";
import type { Property } from "@/types";

type ListingsProps = {
  properties: Property[];
  location: string;
};

export function Listings({ properties, location }: ListingsProps) {
  const viewMode = useAppSelector((state) => state.global.viewMode);
  const { canFavorite, favoriteIds, toggleFavorite } = useFavorites();

  const CardComponent = viewMode === ViewMode.Grid ? Card : CardCompact;

  return (
    <div className="w-full">
      <h3 className="px-4 text-sm font-bold">
        {properties.length} <span className="font-normal text-gray-700">Places in {location}</span>
      </h3>
      <div className="w-full p-4" data-view-mode={viewMode}>
        {properties.map((property) => (
          <CardComponent
            key={property.id}
            property={property}
            isFavorite={favoriteIds.has(property.id)}
            onFavoriteToggle={() => toggleFavorite(property.id)}
            showFavoriteButton={canFavorite}
            propertyLink={`/search/${property.id}`}
          />
        ))}
      </div>
    </div>
  );
}
