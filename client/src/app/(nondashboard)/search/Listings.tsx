"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import { Card } from "@/components/Card";
import { CardCompact } from "@/components/CardCompact";
import { useAuthUser } from "@/hooks/use-auth-user";
import { UserRole, ViewMode } from "@/lib/constants";
import { withToast } from "@/lib/utils";
import {
  useAddFavoritePropertyMutation,
  useGetTenantQuery,
  useRemoveFavoritePropertyMutation,
} from "@/state/api";
import { useAppSelector } from "@/state/store";
import type { Property } from "@/types";

type ListingsProps = {
  properties: Property[];
  location: string;
};

export function Listings({ properties, location }: ListingsProps) {
  const viewMode = useAppSelector((state) => state.global.viewMode);
  const { data: authUser } = useAuthUser();
  const tenantId = authUser?.userRole === UserRole.Tenant ? authUser.cognitoInfo.userId : null;
  const { data: tenant } = useGetTenantQuery(tenantId ?? skipToken);
  const [addFavorite] = useAddFavoritePropertyMutation();
  const [removeFavorite] = useRemoveFavoritePropertyMutation();

  const favoriteIds = new Set(tenant?.favorites?.map(({ id }) => id));

  const toggleFavorite = (propertyId: number) => {
    if (!tenantId) return;
    const args = { cognitoId: tenantId, propertyId };
    const request = favoriteIds.has(propertyId) ? removeFavorite(args) : addFavorite(args);
    withToast(request.unwrap(), { error: "Could not update your favorites" }).catch(() => {});
  };

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
            showFavoriteButton={tenantId !== null}
            propertyLink={`/search/${property.id}`}
          />
        ))}
      </div>
    </div>
  );
}
