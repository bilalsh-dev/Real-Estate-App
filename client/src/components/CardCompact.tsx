import { Bath, Bed, House, Star } from "lucide-react";
import { PropertyName, type PropertyCardProps } from "@/components/Card";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PropertyImage } from "@/components/PropertyImage";

const BADGE_CLASS = "w-fit rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-black";

export function CardCompact({
  property,
  isFavorite,
  onFavoriteToggle,
  showFavoriteButton = true,
  propertyLink,
}: PropertyCardProps) {
  return (
    <article className="mb-5 flex h-40 w-full overflow-hidden rounded-xl bg-white shadow-lg">
      <div className="relative w-1/3">
        <PropertyImage
          src={property.photoUrls[0]}
          alt={property.name}
          sizes="(max-width: 768px) 33vw, 15vw"
        />
        <div className="absolute bottom-2 left-2 flex flex-col gap-1">
          {property.isPetsAllowed && <span className={BADGE_CLASS}>Pets</span>}
          {property.isParkingIncluded && <span className={BADGE_CLASS}>Parking</span>}
        </div>
      </div>
      <div className="flex w-2/3 flex-col justify-between p-4">
        <div>
          <div className="flex items-start justify-between">
            <h2 className="mb-1 text-xl font-bold">
              <PropertyName name={property.name} href={propertyLink} />
            </h2>
            {showFavoriteButton && (
              <FavoriteButton
                isFavorite={isFavorite}
                onToggle={onFavoriteToggle}
                className="p-1"
                iconClassName="size-4"
              />
            )}
          </div>
          <p className="mb-1 text-sm text-gray-600">
            {property.location.address}, {property.location.city}
          </p>
          <div className="flex items-center text-sm">
            <Star className="mr-1 size-3 text-yellow-400" aria-hidden />
            <span className="font-semibold">{(property.averageRating ?? 0).toFixed(1)}</span>
            <span className="ml-1 text-gray-600">({property.numberOfReviews ?? 0})</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex gap-2 text-gray-600">
            <span className="flex items-center" aria-label={`${property.beds} beds`}>
              <Bed className="mr-1 size-4" aria-hidden />
              {property.beds}
            </span>
            <span className="flex items-center" aria-label={`${property.baths} baths`}>
              <Bath className="mr-1 size-4" aria-hidden />
              {property.baths}
            </span>
            <span className="flex items-center" aria-label={`${property.squareFeet} square feet`}>
              <House className="mr-1 size-4" aria-hidden />
              {property.squareFeet}
            </span>
          </div>
          <p className="text-base font-bold">
            ${property.pricePerMonth.toFixed(0)}
            <span className="text-xs font-normal text-gray-600"> /mo</span>
          </p>
        </div>
      </div>
    </article>
  );
}
