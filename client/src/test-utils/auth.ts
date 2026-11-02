import type { useAuthUser } from "@/hooks/use-auth-user";
import type { UserRole } from "@/lib/constants";
import type { AuthUser } from "@/state/api";

type AuthUserState = ReturnType<typeof useAuthUser>;

export function makeAuthUser(userRole: UserRole, name = "Ann Smith"): AuthUser {
  return {
    cognitoInfo: { userId: `${userRole}-1`, username: "ann" },
    userInfo: {
      id: 1,
      cognitoId: `${userRole}-1`,
      name,
      email: "ann@example.com",
      phoneNumber: "+1 555 0100",
    },
    userRole,
  };
}

export function authState(overrides: Partial<AuthUserState>): AuthUserState {
  return {
    authStatus: "configuring",
    data: undefined,
    isError: false,
    refetch: () => Promise.resolve(),
    ...overrides,
  } as unknown as AuthUserState;
}
