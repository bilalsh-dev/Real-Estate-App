import { MapPin, Star } from "lucide-react";
import type { Property } from "@/types";

const STATS = [
  ["Monthly Rent", (p: Property) => `$${p.pricePerMonth.toLocaleString("en-US")}`],
  ["Bedrooms", (p: Property) => `${p.beds} bd`],
  ["Bathrooms", (p: Property) => `${p.baths} ba`],
  ["Square Feet", (p: Property) => `${p.squareFeet.toLocaleString("en-US")} sq ft`],
] as const;

export function PropertyOverview({ property }: { property: Property }) {
  const { location } = property;

  return (
    <div>
      <div className="mb-4">
        <div className="mb-1 text-sm text-gray-500">
          {location.country} / {location.state} /{" "}
          <span className="font-semibold text-gray-600">{location.city}</span>
        </div>
        <h1 className="my-5 text-3xl font-bold">{property.name}</h1>
        <div className="flex items-center justify-between">
          <span className="flex items-center text-gray-500">
            <MapPin className="mr-1 size-4 text-gray-700" aria-hidden />
            {location.city}, {location.state}, {location.country}
          </span>
          <span className="flex items-center text-yellow-500">
            <Star className="mr-1 size-4 fill-current" aria-hidden />
            {(property.averageRating ?? 0).toFixed(1)} ({property.numberOfReviews ?? 0} Reviews)
          </span>
        </div>
      </div>

      <dl className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-primary-200 p-6 px-11">
        {STATS.map(([label, format], index) => (
          <div key={label} className="flex items-center gap-4">
            {index > 0 && <div className="h-10 border-l border-gray-300" aria-hidden />}
            <div>
              <dt className="text-sm text-gray-500">{label}</dt>
              <dd className="font-semibold">{format(property)}</dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="my-16">
        <h2 className="mb-5 text-xl font-semibold">About {property.name}</h2>
        <p className="leading-7 whitespace-pre-line text-gray-500">{property.description}</p>
      </div>
    </div>
  );
}
