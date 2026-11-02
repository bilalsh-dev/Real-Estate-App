"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthUser } from "@/hooks/use-auth-user";
import { DASHBOARD_HOME, SEARCH_PATH, UserRole } from "@/lib/constants";
import { isWithinPath } from "@/lib/utils";

function isTenantFacingPath(pathname: string): boolean {
  return pathname === "/" || isWithinPath(pathname, SEARCH_PATH);
}

export function ManagerRedirect() {
  const { data: authUser } = useAuthUser();
  const pathname = usePathname();
  const router = useRouter();
  const shouldRedirect = authUser?.userRole === UserRole.Manager && isTenantFacingPath(pathname);

  useEffect(() => {
    if (shouldRedirect) router.replace(DASHBOARD_HOME[UserRole.Manager], { scroll: false });
  }, [router, shouldRedirect]);

  return null;
}
