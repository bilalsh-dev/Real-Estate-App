"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import { Loading } from "@/components/Loading";
import { PropertyGrid } from "@/components/PropertyGrid";
import { QueryError } from "@/components/QueryError";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useGetCurrentResidencesQuery } from "@/state/api";

export function ResidencesList() {
  const { data: authUser } = useAuthUser();
  const { data, isLoading, isError } = useGetCurrentResidencesQuery(
    authUser?.cognitoInfo.userId ?? skipToken,
  );

  if (isLoading || !authUser) return <Loading />;
  if (isError) return <QueryError message="We couldn't load your residences." />;

  return (
    <PropertyGrid
      properties={data ?? []}
      emptyMessage="You don't have any current residences."
      linkFor={({ id }) => `/tenants/residences/${id}`}
    />
  );
}
