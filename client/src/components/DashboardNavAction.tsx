"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/use-auth-user";
import { UserRole } from "@/lib/constants";

const ACTIONS = {
  manager: { href: "/managers/newproperty", label: "Add New Property", Icon: Plus },
  tenant: { href: "/search", label: "Search Properties", Icon: Search },
} as const;

export function DashboardNavAction() {
  const { data: authUser } = useAuthUser();
  if (!authUser) return null;

  const { href, label, Icon } =
    authUser.userRole === UserRole.Manager ? ACTIONS.manager : ACTIONS.tenant;

  return (
    <Button
      asChild
      variant="secondary"
      className="bg-primary-50 text-primary-700 hover:bg-secondary-500 hover:text-primary-50 md:ml-4"
    >
      <Link href={href} aria-label={label}>
        <Icon className="size-4" aria-hidden />
        <span className="hidden md:inline">{label}</span>
      </Link>
    </Button>
  );
}
