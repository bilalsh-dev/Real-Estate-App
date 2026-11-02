"use client";

import { useGetPropertyQuery } from "@/state/api";
import { ContactWidget } from "./ContactWidget";
import { ImagePreviews } from "./ImagePreviews";
import { PropertyDetails } from "./PropertyDetails";
import { PropertyLocation } from "./PropertyLocation";
import { PropertyOverview } from "./PropertyOverview";

export function PropertyView({ propertyId }: { propertyId: number }) {
  const { data: property, isLoading, error } = useGetPropertyQuery(propertyId);

  if (isLoading) {
    return (
      <p role="status" className="p-10 text-center text-gray-600">
        Loading property…
      </p>
    );
  }

  if (!property) {
    const notFound = error && "status" in error && error.status === 404;
    return (
      <p role="alert" className="p-10 text-center text-gray-700">
        {notFound ? "This property doesn't exist." : "We couldn't load this property."}
      </p>
    );
  }

  return (
    <div>
      <ImagePreviews images={property.photoUrls} name={property.name} />
      <div className="mx-10 mt-16 mb-8 flex flex-col justify-center gap-10 md:mx-auto md:w-2/3 md:flex-row">
        <div className="order-2 md:order-1">
          <PropertyOverview property={property} />
          <PropertyDetails property={property} />
          <PropertyLocation property={property} />
        </div>
        <div className="order-1 md:order-2">
          <ContactWidget propertyId={property.id} />
        </div>
      </div>
    </div>
  );
}
