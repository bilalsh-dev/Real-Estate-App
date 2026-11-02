"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import { useAuthUser } from "@/hooks/use-auth-user";
import { UserRole } from "@/lib/constants";
import { withToast } from "@/lib/utils";
import {
  useAddFavoritePropertyMutation,
  useGetTenantQuery,
  useRemoveFavoritePropertyMutation,
} from "@/state/api";

export function useFavorites() {
  const { data: authUser } = useAuthUser();
  const tenantId = authUser?.userRole === UserRole.Tenant ? authUser.cognitoInfo.userId : null;
  const tenantQuery = useGetTenantQuery(tenantId ?? skipToken);
  const [addFavorite] = useAddFavoritePropertyMutation();
  const [removeFavorite] = useRemoveFavoritePropertyMutation();

  const favoriteIds = new Set(tenantQuery.data?.favorites?.map(({ id }) => id));

  const toggleFavorite = (propertyId: number) => {
    if (!tenantId) return;
    const args = { cognitoId: tenantId, propertyId };
    const request = favoriteIds.has(propertyId) ? removeFavorite(args) : addFavorite(args);
    withToast(request.unwrap(), { error: "Could not update your favorites" }).catch(() => {});
  };

  return { canFavorite: tenantId !== null, favoriteIds, toggleFavorite, tenantQuery };
}
