"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import { Loading } from "@/components/Loading";
import { PropertyGrid } from "@/components/PropertyGrid";
import { QueryError } from "@/components/QueryError";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useGetManagerPropertiesQuery } from "@/state/api";

export function ManagerPropertiesList() {
  const { data: authUser } = useAuthUser();
  const { data, isLoading, isError } = useGetManagerPropertiesQuery(
    authUser?.cognitoInfo.userId ?? skipToken,
  );

  if (isLoading || !authUser) return <Loading />;
  if (isError) return <QueryError message="We couldn't load your properties." />;

  return (
    <PropertyGrid
      properties={data ?? []}
      emptyMessage="You don't manage any properties yet."
      linkFor={({ id }) => `/managers/properties/${id}`}
    />
  );
}
