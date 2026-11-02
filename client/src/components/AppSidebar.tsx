"use client";

import { Building, FileText, Heart, Home, Menu, Settings, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAVBAR_HEIGHT_PX, SETTINGS_PATH, type UserRole } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SidebarLink = {
  icon: LucideIcon;
  label: string;
  href: string;
};

export const SIDEBAR_LINKS: Record<UserRole, SidebarLink[]> = {
  manager: [
    { icon: Building, label: "Properties", href: "/managers/properties" },
    { icon: FileText, label: "Applications", href: "/managers/applications" },
    { icon: Settings, label: "Settings", href: SETTINGS_PATH.manager },
  ],
  tenant: [
    { icon: Heart, label: "Favorites", href: "/tenants/favorites" },
    { icon: FileText, label: "Applications", href: "/tenants/applications" },
    { icon: Home, label: "Residences", href: "/tenants/residences" },
    { icon: Settings, label: "Settings", href: SETTINGS_PATH.tenant },
  ],
};

const ROLE_VIEW_TITLE: Record<UserRole, string> = {
  manager: "Manager View",
  tenant: "Renter View",
};

export function AppSidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname();
  const { toggleSidebar, open } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      className="bg-white shadow-lg"
      style={{ top: `${NAVBAR_HEIGHT_PX}px`, height: `calc(100svh - ${NAVBAR_HEIGHT_PX}px)` }}
    >
      <SidebarHeader>
        <div
          className={cn(
            "mb-3 flex min-h-14 w-full items-center pt-3",
            open ? "justify-between px-6" : "justify-center",
          )}
        >
          {open && <h2 className="text-xl font-bold text-gray-800">{ROLE_VIEW_TITLE[userRole]}</h2>}
          <button
            type="button"
            className="rounded-md p-2 hover:bg-gray-100"
            onClick={toggleSidebar}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          >
            {open ? (
              <X className="size-6 text-gray-600" aria-hidden />
            ) : (
              <Menu className="size-6 text-gray-600" aria-hidden />
            )}
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <nav aria-label="Dashboard">
          <SidebarMenu>
            {SIDEBAR_LINKS[userRole].map(({ icon: Icon, label, href }) => {
              const isActive = pathname === href;
              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={label}
                    className={cn(
                      "flex items-center px-7 py-7",
                      isActive ? "bg-gray-100 text-blue-600" : "text-gray-600 hover:bg-gray-100",
                      !open && "ml-1",
                    )}
                  >
                    <Link href={href} scroll={false} aria-current={isActive ? "page" : undefined}>
                      <Icon className="size-5" aria-hidden />
                      <span className="font-medium">{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}
