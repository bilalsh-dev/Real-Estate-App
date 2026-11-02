"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/use-auth-user";
import { REDIRECT_PARAM, SIGN_IN_PATH, UserRole } from "@/lib/constants";

type ContactWidgetProps = {
  propertyId: number;
  onApply?: () => void;
};

export function ContactWidget({ propertyId, onApply }: ContactWidgetProps) {
  const { authStatus, data: authUser } = useAuthUser();
  const signInHref = `${SIGN_IN_PATH}?${REDIRECT_PARAM}=${encodeURIComponent(`/search/${propertyId}`)}`;

  return (
    <aside className="h-fit min-w-75 rounded-2xl border border-primary-200 bg-white p-7">
      <h2 className="mb-4 text-lg font-bold text-primary-800">Interested in this property?</h2>
      {authStatus === "unauthenticated" && (
        <Button asChild className="w-full bg-primary-700 text-white hover:bg-primary-600">
          <Link href={signInHref}>Sign In to Apply</Link>
        </Button>
      )}
      {authUser?.userRole === UserRole.Tenant && onApply && (
        <Button className="w-full bg-primary-700 text-white hover:bg-primary-600" onClick={onApply}>
          Submit Application
        </Button>
      )}
      {authUser?.userRole === UserRole.Manager && (
        <p className="text-sm text-primary-600">Sign in with a tenant account to apply.</p>
      )}
    </aside>
  );
}
