import { Card } from "@/components/Card";
import type { Property } from "@/types";

type PropertyGridProps = {
  properties: Property[];
  emptyMessage: string;
  linkFor: (property: Property) => string;
  favoriteIds?: Set<number>;
  onFavoriteToggle?: (propertyId: number) => void;
};

export function PropertyGrid({
  properties,
  emptyMessage,
  linkFor,
  favoriteIds,
  onFavoriteToggle,
}: PropertyGridProps) {
  if (properties.length === 0) return <p className="text-gray-600">{emptyMessage}</p>;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {properties.map((property) => (
        <Card
          key={property.id}
          property={property}
          isFavorite={favoriteIds?.has(property.id) ?? false}
          onFavoriteToggle={() => onFavoriteToggle?.(property.id)}
          showFavoriteButton={onFavoriteToggle !== undefined}
          propertyLink={linkFor(property)}
        />
      ))}
    </div>
  );
}
