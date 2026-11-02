"use client";

import { CircleCheckBig, File, Hospital } from "lucide-react";
import Link from "next/link";
import { ApplicationCard } from "@/components/ApplicationCard";
import { Loading } from "@/components/Loading";
import { QueryError } from "@/components/QueryError";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplicationStatus, UserRole } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import { useGetApplicationsQuery } from "@/state/api";
import type { ApplicationListItem } from "@/types";
import { ReviewActions } from "./ReviewActions";

const ALL_TAB = "all";

const TABS = [
  { value: ALL_TAB, label: "All" },
  { value: ApplicationStatus.Pending, label: "Pending" },
  { value: ApplicationStatus.Approved, label: "Approved" },
  { value: ApplicationStatus.Denied, label: "Denied" },
] as const;

const STATUS_NOTE: Record<ApplicationStatus, { className: string; text: string }> = {
  [ApplicationStatus.Pending]: {
    className: "bg-yellow-100 text-yellow-800",
    text: "This application is pending review.",
  },
  [ApplicationStatus.Approved]: {
    className: "bg-green-100 text-green-800",
    text: "This application has been approved.",
  },
  [ApplicationStatus.Denied]: {
    className: "bg-red-100 text-red-800",
    text: "This application has been denied.",
  },
};

function ManagerApplication({ application }: { application: ApplicationListItem }) {
  const note = STATUS_NOTE[application.status];

  return (
    <ApplicationCard application={application} viewerRole={UserRole.Manager}>
      <div className="flex w-full flex-col gap-5 px-4 pb-4 lg:flex-row lg:justify-between">
        <div className={cn("flex grow flex-wrap items-center gap-2 p-4", note.className)}>
          <File className="size-5 shrink-0" aria-hidden />
          <span>Application submitted on {formatDate(application.applicationDate)}.</span>
          <CircleCheckBig className="size-5 shrink-0" aria-hidden />
          <span className="font-semibold">{note.text}</span>
        </div>
        <div className="flex shrink-0 flex-wrap items-start gap-2">
          <Button asChild variant="outline">
            <Link href={`/managers/properties/${application.propertyId}`} scroll={false}>
              <Hospital className="size-5" aria-hidden />
              Property Details
            </Link>
          </Button>
          {application.status === ApplicationStatus.Pending && (
            <ReviewActions application={application} />
          )}
        </div>
      </div>
    </ApplicationCard>
  );
}

export function ManagerApplicationsList() {
  const { data: applications, isLoading, isError } = useGetApplicationsQuery();

  if (isLoading) return <Loading />;
  if (isError || !applications) return <QueryError message="We couldn't load applications." />;

  const tabs = TABS.map((tab) => ({
    ...tab,
    applications:
      tab.value === ALL_TAB
        ? applications
        : applications.filter(({ status }) => status === tab.value),
  }));

  return (
    <Tabs defaultValue={ALL_TAB} className="my-5 w-full">
      <TabsList className="grid w-full grid-cols-4">
        {tabs.map(({ value, label, applications: items }) => (
          <TabsTrigger key={value} value={value}>
            {`${label} (${items.length})`}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(({ value, applications: items }) => (
        <TabsContent key={value} value={value} className="mt-5 w-full">
          {items.length === 0 ? (
            <p className="text-gray-500">No applications here.</p>
          ) : (
            items.map((application) => (
              <ManagerApplication key={application.id} application={application} />
            ))
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
