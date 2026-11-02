"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/use-auth-user";
import {
  ApplicationStatus,
  REDIRECT_PARAM,
  SIGN_IN_PATH,
  TENANT_APPLICATIONS_PATH,
  UserRole,
} from "@/lib/constants";
import { useGetApplicationsQuery } from "@/state/api";
import { ApplicationModal } from "./ApplicationModal";

export function ContactWidget({ propertyId }: { propertyId: number }) {
  const { authStatus, data: authUser } = useAuthUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isTenant = authUser?.userRole === UserRole.Tenant;
  const { data: applications, isLoading } = useGetApplicationsQuery(
    isTenant ? undefined : skipToken,
  );
  const hasPendingApplication = applications?.some(
    (application) =>
      application.propertyId === propertyId && application.status === ApplicationStatus.Pending,
  );
  const signInHref = `${SIGN_IN_PATH}?${REDIRECT_PARAM}=${encodeURIComponent(`/search/${propertyId}`)}`;

  return (
    <aside className="h-fit min-w-75 rounded-2xl border border-primary-200 bg-white p-7">
      <h2 className="mb-4 text-lg font-bold text-primary-800">Interested in this property?</h2>
      {authStatus === "unauthenticated" && (
        <Button asChild className="w-full bg-primary-700 text-white hover:bg-primary-600">
          <Link href={signInHref}>Sign In to Apply</Link>
        </Button>
      )}
      {isTenant && hasPendingApplication && (
        <p className="text-sm text-primary-600">
          Your application is pending review.{" "}
          <Link href={TENANT_APPLICATIONS_PATH} className="font-medium underline">
            View applications
          </Link>
        </p>
      )}
      {isTenant && !isLoading && !hasPendingApplication && (
        <>
          <Button
            className="w-full bg-primary-700 text-white hover:bg-primary-600"
            onClick={() => setIsModalOpen(true)}
          >
            Submit Application
          </Button>
          <ApplicationModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            propertyId={propertyId}
            tenant={authUser.userInfo}
          />
        </>
      )}
    </aside>
  );
}
