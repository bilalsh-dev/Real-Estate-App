"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import { Loading } from "@/components/Loading";
import { PropertyGrid } from "@/components/PropertyGrid";
import { QueryError } from "@/components/QueryError";
import { useFavorites } from "@/hooks/use-favorites";
import { useGetPropertiesQuery } from "@/state/api";

export function FavoritesList() {
  const { favoriteIds, toggleFavorite, tenantQuery } = useFavorites();
  const ids = [...favoriteIds];
  const propertiesQuery = useGetPropertiesQuery(ids.length > 0 ? { favoriteIds: ids } : skipToken);

  if (tenantQuery.isLoading || propertiesQuery.isLoading) return <Loading />;
  if (tenantQuery.isError || propertiesQuery.isError) {
    return <QueryError message="We couldn't load your favorites." />;
  }

  return (
    <PropertyGrid
      properties={ids.length > 0 ? (propertiesQuery.data ?? []) : []}
      emptyMessage="You don't have any favorited properties yet."
      linkFor={({ id }) => `/search/${id}`}
      favoriteIds={favoriteIds}
      onFavoriteToggle={toggleFavorite}
    />
  );
}
