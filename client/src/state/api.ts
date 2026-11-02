import { createApi, fetchBaseQuery, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
import { z } from "zod";
import { UserRole } from "@/lib/constants";
import { env } from "@/lib/env";
import type { SettingsFormData } from "@/lib/schemas";
import type { Manager, Tenant } from "@/types";

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
  tagTypes: ["AuthUser"],
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
  }),
});

export const {
  useGetAuthUserQuery,
  useUpdateTenantSettingsMutation,
  useUpdateManagerSettingsMutation,
} = api;
