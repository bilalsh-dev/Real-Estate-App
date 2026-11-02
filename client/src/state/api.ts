import { createApi, fetchBaseQuery, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { z } from "zod";
import { UserRole } from "@/lib/constants";
import { env } from "@/lib/env";
import type { SettingsFormData } from "@/lib/schemas";
import { cleanParams } from "@/lib/utils";
import type { FiltersState } from "@/state/globalSlice";
import type { Lease, Manager, Payment, Property, Tenant } from "@/types";

const ROLE_CLAIM = "custom:role";

const PROFILE_API_PATH: Record<UserRole, string> = {
  tenant: "/tenants",
  manager: "/managers",
};

const userRoleSchema = z.enum(UserRole);

export type AuthUser = {
  cognitoInfo: { userId: string; username: string };
  userInfo: Tenant | Manager;
  userRole: UserRole;
};

export type UpdateSettingsArgs = { cognitoId: string } & SettingsFormData;

export type PropertySearchArgs = Partial<FiltersState> & { favoriteIds?: number[] };

export type FavoriteArgs = { cognitoId: string; propertyId: number };

const MAPBOX_GEOCODING_URL = "https://api.mapbox.com/search/geocode/v6/forward";

const geocodingResponseSchema = z.object({
  features: z.array(
    z.object({ geometry: z.object({ coordinates: z.tuple([z.number(), z.number()]) }) }),
  ),
});

export function toPropertyQueryParams(args: PropertySearchArgs): Record<string, string | number> {
  return cleanParams({
    favoriteIds: args.favoriteIds?.join(","),
    priceMin: args.priceRange?.[0],
    priceMax: args.priceRange?.[1],
    beds: args.beds,
    baths: args.baths,
    propertyType: args.propertyType,
    squareFeetMin: args.squareFeet?.[0],
    squareFeetMax: args.squareFeet?.[1],
    amenities: args.amenities?.join(","),
    availableFrom: args.availableFrom,
    longitude: args.coordinates?.[0],
    latitude: args.coordinates?.[1],
  }) as Record<string, string | number>;
}

function customError(message: string): { error: FetchBaseQueryError } {
  return { error: { status: "CUSTOM_ERROR", error: message } };
}

function profilePath(role: UserRole, cognitoId: string): string {
  return `${PROFILE_API_PATH[role]}/${encodeURIComponent(cognitoId)}`;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      const { tokens } = await fetchAuthSession();
      if (tokens?.idToken) headers.set("Authorization", `Bearer ${tokens.idToken.toString()}`);
      return headers;
    },
  }),
  tagTypes: ["AuthUser", "Properties", "PropertyDetails", "Tenants", "Leases", "Payments"],
  endpoints: (build) => ({
    getAuthUser: build.query<AuthUser, void>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBaseQuery) {
        try {
          const [{ tokens }, { userId, username }] = await Promise.all([
            fetchAuthSession(),
            getCurrentUser(),
          ]);
          const idToken = tokens?.idToken;
          const role = userRoleSchema.safeParse(idToken?.payload[ROLE_CLAIM]);
          if (!idToken || !role.success) return customError("Your account has no valid role");

          let profile = await fetchWithBaseQuery(profilePath(role.data, userId));

          if (profile.error?.status === 404) {
            const { email } = idToken.payload;
            if (typeof email !== "string") return customError("Your account has no email address");
            profile = await fetchWithBaseQuery({
              url: PROFILE_API_PATH[role.data],
              method: "POST",
              body: { name: username, email, phoneNumber: "" },
            });
          }

          if (profile.error) return { error: profile.error };

          return {
            data: {
              cognitoInfo: { userId, username },
              userInfo: profile.data as Tenant | Manager,
              userRole: role.data,
            },
          };
        } catch (error) {
          return customError(
            error instanceof Error ? error.message : "Could not load the signed-in user",
          );
        }
      },
      providesTags: ["AuthUser"],
    }),

    updateTenantSettings: build.mutation<Tenant, UpdateSettingsArgs>({
      query: ({ cognitoId, ...body }) => ({
        url: profilePath(UserRole.Tenant, cognitoId),
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AuthUser"],
    }),

    updateManagerSettings: build.mutation<Manager, UpdateSettingsArgs>({
      query: ({ cognitoId, ...body }) => ({
        url: profilePath(UserRole.Manager, cognitoId),
        method: "PUT",
        body,
      }),
      invalidatesTags: ["AuthUser"],
    }),

    getProperties: build.query<Property[], PropertySearchArgs>({
      query: (args) => ({ url: "/properties", params: toPropertyQueryParams(args) }),
      providesTags: (result) => [
        ...(result ?? []).map(({ id }) => ({ type: "Properties" as const, id })),
        { type: "Properties", id: "LIST" },
      ],
    }),

    getProperty: build.query<Property, number>({
      query: (id) => `/properties/${id}`,
      providesTags: (_result, _error, id) => [{ type: "PropertyDetails", id }],
    }),

    getTenant: build.query<Tenant, string>({
      query: (cognitoId) => profilePath(UserRole.Tenant, cognitoId),
      providesTags: (_result, _error, cognitoId) => [{ type: "Tenants", id: cognitoId }],
    }),

    addFavoriteProperty: build.mutation<Tenant, FavoriteArgs>({
      query: ({ cognitoId, propertyId }) => ({
        url: `${profilePath(UserRole.Tenant, cognitoId)}/favorites/${propertyId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { cognitoId }) => [
        { type: "Tenants", id: cognitoId },
        { type: "Properties", id: "LIST" },
      ],
    }),

    removeFavoriteProperty: build.mutation<Tenant, FavoriteArgs>({
      query: ({ cognitoId, propertyId }) => ({
        url: `${profilePath(UserRole.Tenant, cognitoId)}/favorites/${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { cognitoId }) => [
        { type: "Tenants", id: cognitoId },
        { type: "Properties", id: "LIST" },
      ],
    }),

    getCurrentResidences: build.query<Property[], string>({
      query: (cognitoId) => `${profilePath(UserRole.Tenant, cognitoId)}/current-residences`,
      providesTags: (result) => [
        ...(result ?? []).map(({ id }) => ({ type: "Properties" as const, id })),
        { type: "Properties", id: "LIST" },
      ],
    }),

    getManagerProperties: build.query<Property[], string>({
      query: (cognitoId) => `${profilePath(UserRole.Manager, cognitoId)}/properties`,
      providesTags: (result) => [
        ...(result ?? []).map(({ id }) => ({ type: "Properties" as const, id })),
        { type: "Properties", id: "LIST" },
      ],
    }),

    createProperty: build.mutation<Property, FormData>({
      query: (body) => ({ url: "/properties", method: "POST", body }),
      invalidatesTags: [{ type: "Properties", id: "LIST" }],
    }),

    getLeases: build.query<Lease[], void>({
      query: () => "/leases",
      providesTags: ["Leases"],
    }),

    getPropertyLeases: build.query<Lease[], number>({
      query: (propertyId) => `/properties/${propertyId}/leases`,
      providesTags: ["Leases", "Payments"],
    }),

    getPayments: build.query<Payment[], number>({
      query: (leaseId) => `/leases/${leaseId}/payments`,
      providesTags: (_result, _error, leaseId) => [{ type: "Payments", id: leaseId }],
    }),

    geocodeLocation: build.query<FiltersState["coordinates"] | null, string>({
      async queryFn(query) {
        try {
          const params = new URLSearchParams({
            q: query,
            limit: "1",
            access_token: env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
          });
          const response = await fetch(`${MAPBOX_GEOCODING_URL}?${params.toString()}`);
          if (!response.ok) return customError(`Location search failed (${response.status})`);
          const { features } = geocodingResponseSchema.parse(await response.json());
          return { data: features[0]?.geometry.coordinates ?? null };
        } catch {
          return customError("Location search failed");
        }
      },
    }),
  }),
});

export const {
  useGetAuthUserQuery,
  useUpdateTenantSettingsMutation,
  useUpdateManagerSettingsMutation,
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useGetTenantQuery,
  useAddFavoritePropertyMutation,
  useRemoveFavoritePropertyMutation,
  useLazyGeocodeLocationQuery,
  useGetCurrentResidencesQuery,
  useGetManagerPropertiesQuery,
  useCreatePropertyMutation,
  useGetLeasesQuery,
  useGetPropertyLeasesQuery,
  useGetPaymentsQuery,
} = api;
