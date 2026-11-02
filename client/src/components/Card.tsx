import { Bath, Bed, House, Star } from "lucide-react";
import Link from "next/link";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PropertyImage } from "@/components/PropertyImage";
import type { Property } from "@/types";

export type PropertyCardProps = {
  property: Property;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  showFavoriteButton?: boolean;
  propertyLink?: string;
};

const BADGE_CLASS = "rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-black";

export function PropertyName({ name, href }: { name: string; href: string | undefined }) {
  if (!href) return name;
  return (
    <Link href={href} className="hover:text-blue-600 hover:underline" scroll={false}>
      {name}
    </Link>
  );
}

export function Card({
  property,
  isFavorite,
  onFavoriteToggle,
  showFavoriteButton = true,
  propertyLink,
}: PropertyCardProps) {
  return (
    <article className="mb-5 w-full overflow-hidden rounded-xl bg-white shadow-lg">
      <div className="relative h-48 w-full">
        <PropertyImage
          src={property.photoUrls[0]}
          alt={property.name}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute bottom-4 left-4 flex gap-2">
          {property.isPetsAllowed && <span className={BADGE_CLASS}>Pets Allowed</span>}
          {property.isParkingIncluded && <span className={BADGE_CLASS}>Parking Included</span>}
        </div>
        {showFavoriteButton && (
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={onFavoriteToggle}
            className="absolute right-4 bottom-4"
          />
        )}
      </div>
      <div className="p-4">
        <h2 className="mb-1 text-xl font-bold">
          <PropertyName name={property.name} href={propertyLink} />
        </h2>
        <p className="mb-2 text-gray-600">
          {property.location.address}, {property.location.city}
        </p>
        <div className="flex items-center justify-between">
          <div className="mb-2 flex items-center">
            <Star className="mr-1 size-4 text-yellow-400" aria-hidden />
            <span className="font-semibold">{(property.averageRating ?? 0).toFixed(1)}</span>
            <span className="ml-1 text-gray-600">({property.numberOfReviews ?? 0} Reviews)</span>
          </div>
          <p className="mb-3 text-lg font-bold">
            ${property.pricePerMonth.toFixed(0)}{" "}
            <span className="text-base font-normal text-gray-600">/month</span>
          </p>
        </div>
        <hr />
        <div className="mt-5 flex items-center justify-between gap-4 text-gray-600">
          <span className="flex items-center">
            <Bed className="mr-2 size-5" aria-hidden />
            {property.beds} Bed
          </span>
          <span className="flex items-center">
            <Bath className="mr-2 size-5" aria-hidden />
            {property.baths} Bath
          </span>
          <span className="flex items-center">
            <House className="mr-2 size-5" aria-hidden />
            {property.squareFeet} sq ft
          </span>
        </div>
      </div>
    </article>
  );
}
