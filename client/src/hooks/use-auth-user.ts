"use client";

import { useAuthenticator } from "@aws-amplify/ui-react";
import { useGetAuthUserQuery } from "@/state/api";

export function useAuthUser() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const query = useGetAuthUserQuery(undefined, { skip: authStatus !== "authenticated" });
  return { authStatus, ...query };
}
