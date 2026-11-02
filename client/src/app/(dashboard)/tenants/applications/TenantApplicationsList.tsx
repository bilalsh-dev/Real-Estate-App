"use client";

import { CircleCheckBig, Clock, XCircle, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ApplicationCard } from "@/components/ApplicationCard";
import { Loading } from "@/components/Loading";
import { QueryError } from "@/components/QueryError";
import { Button } from "@/components/ui/button";
import { ApplicationStatus, UserRole } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import { useGetApplicationsQuery } from "@/state/api";
import type { ApplicationListItem } from "@/types";

type StatusNote = { Icon: LucideIcon; className: string; text: string };

function statusNote({ status, lease }: ApplicationListItem, now: Date): StatusNote {
  if (status === ApplicationStatus.Pending) {
    return {
      Icon: Clock,
      className: "bg-yellow-100 text-yellow-700",
      text: "Your application is pending approval",
    };
  }
  if (status === ApplicationStatus.Denied) {
    return {
      Icon: XCircle,
      className: "bg-red-100 text-red-700",
      text: "Your application has been denied",
    };
  }
  const approved = { Icon: CircleCheckBig, className: "bg-green-100 text-green-700" };
  if (!lease) return { ...approved, text: "Your application has been approved" };
  const endDate = formatDate(lease.endDate);
  return {
    ...approved,
    text:
      new Date(lease.endDate) > now
        ? `The property is being rented by you until ${endDate}`
        : `Your lease ended on ${endDate}`,
  };
}

export function TenantApplicationsList() {
  const [now] = useState(() => new Date());
  const { data: applications, isLoading, isError } = useGetApplicationsQuery();

  if (isLoading) return <Loading />;
  if (isError || !applications) return <QueryError message="We couldn't load your applications." />;
  if (applications.length === 0) {
    return <p className="text-gray-500">You haven&apos;t applied to any properties yet.</p>;
  }

  return (
    <div className="w-full">
      {applications.map((application) => {
        const { Icon, className, text } = statusNote(application, now);
        const isApproved = application.status === ApplicationStatus.Approved;
        return (
          <ApplicationCard
            key={application.id}
            application={application}
            viewerRole={UserRole.Tenant}
          >
            <div className="flex w-full flex-col gap-5 px-4 pb-4 sm:flex-row sm:justify-between">
              <div className={cn("flex grow items-center p-4", className)}>
                <Icon className="mr-2 size-5 shrink-0" aria-hidden />
                {text}
              </div>
              <Button asChild variant="outline" className="h-auto">
                <Link
                  href={
                    isApproved
                      ? `/tenants/residences/${application.propertyId}`
                      : `/search/${application.propertyId}`
                  }
                >
                  {isApproved ? "View Residence" : "View Property"}
                </Link>
              </Button>
            </div>
          </ApplicationCard>
        );
      })}
    </div>
  );
}
