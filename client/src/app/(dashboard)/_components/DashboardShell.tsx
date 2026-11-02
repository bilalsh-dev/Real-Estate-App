"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuthUser } from "@/hooks/use-auth-user";
import {
  DASHBOARD_HOME,
  DASHBOARD_PREFIX,
  NAVBAR_HEIGHT_PX,
  REDIRECT_PARAM,
  SIGN_IN_PATH,
} from "@/lib/constants";
import { isWithinPath } from "@/lib/utils";

function DashboardStatus({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center text-muted-foreground" role="status">
      {children}
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const { authStatus, data: authUser, isError, refetch } = useAuthUser();
  const pathname = usePathname();
  const router = useRouter();

  let redirectTo: string | null = null;
  if (authStatus === "unauthenticated") {
    redirectTo = `${SIGN_IN_PATH}?${REDIRECT_PARAM}=${encodeURIComponent(pathname)}`;
  } else if (authUser && !isWithinPath(pathname, DASHBOARD_PREFIX[authUser.userRole])) {
    redirectTo = DASHBOARD_HOME[authUser.userRole];
  }

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo, { scroll: false });
  }, [redirectTo, router]);

  if (isError) {
    return (
      <DashboardStatus>
        <div className="flex flex-col items-center gap-3">
          <p>We couldn&apos;t load your account.</p>
          <Button onClick={() => void refetch()}>Try again</Button>
        </div>
      </DashboardStatus>
    );
  }

  if (!authUser || redirectTo) return <DashboardStatus>Loading…</DashboardStatus>;

  return (
    <SidebarProvider>
      <div className="min-h-svh w-full bg-primary-100">
        <Navbar variant="dashboard" />
        <div className="flex" style={{ paddingTop: `${NAVBAR_HEIGHT_PX}px` }}>
          <AppSidebar userRole={authUser.userRole} />
          <main className="grow transition-all duration-300">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
