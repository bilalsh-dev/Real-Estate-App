import { Mail, MapPin, PhoneCall } from "lucide-react";
import type { ReactNode } from "react";
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { PropertyImage } from "@/components/PropertyImage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserRole } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ApplicationListItem } from "@/types";

type ApplicationCardProps = {
  application: ApplicationListItem;
  viewerRole: UserRole;
  children: ReactNode;
};

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="whitespace-nowrap text-gray-500">{label}</dt>
      <dd className="whitespace-nowrap">{value}</dd>
    </div>
  );
}

export function ApplicationCard({ application, viewerRole, children }: ApplicationCardProps) {
  const { property, lease } = application;
  const contact = viewerRole === UserRole.Manager ? application.tenant : application.manager;
  const contactLabel = viewerRole === UserRole.Manager ? "Tenant" : "Manager";

  return (
    <article className="mb-4 overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex flex-col items-start justify-between gap-6 px-6 py-6 md:px-4 lg:flex-row lg:items-center lg:gap-4">
        <div className="flex w-full min-w-0 flex-col gap-5 lg:w-auto lg:flex-[1.5] lg:flex-row">
          <div className="relative h-37.5 w-full shrink-0 overflow-hidden rounded-xl lg:w-50">
            <PropertyImage
              src={property.photoUrls[0]}
              alt={property.name}
              sizes="(max-width: 1024px) 100vw, 200px"
            />
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="my-2 text-xl font-bold">{property.name}</h2>
              <div className="mb-2 flex items-center">
                <MapPin className="mr-1 size-5" aria-hidden />
                <span>
                  {property.location.city}, {property.location.country}
                </span>
              </div>
            </div>
            <div className="text-xl font-semibold">
              {formatCurrency(property.pricePerMonth)}{" "}
              <span className="text-sm font-normal">/ month</span>
            </div>
          </div>
        </div>

        <div className="hidden self-stretch border-[0.5px] border-primary-200 lg:block" />

        <div className="flex w-full flex-col gap-3 py-2 lg:w-auto lg:shrink-0 lg:basis-60">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Status:</span>
              <ApplicationStatusBadge status={application.status} />
            </div>
            <hr className="mt-3" />
          </div>
          <dl className="flex flex-col gap-3">
            <Detail label="Applied:" value={formatDate(application.applicationDate)} />
            {lease && <Detail label="Start Date:" value={formatDate(lease.startDate)} />}
            {lease && <Detail label="End Date:" value={formatDate(lease.endDate)} />}
            {lease && (
              <Detail
                label="Next Payment:"
                value={lease.nextPaymentDate ? formatDate(lease.nextPaymentDate) : "None"}
              />
            )}
          </dl>
        </div>

        <div className="hidden self-stretch border-[0.5px] border-primary-200 lg:block" />

        <div className="flex w-full min-w-0 flex-col justify-start gap-5 py-2 lg:w-auto lg:flex-1">
          <div>
            <h3 className="text-lg font-semibold">{contactLabel}</h3>
            <hr className="mt-3" />
          </div>
          <div className="flex gap-4">
            <Avatar className="size-10">
              <AvatarFallback>{contact.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col gap-2">
              <div className="font-semibold">{contact.name}</div>
              {contact.phoneNumber && (
                <a
                  href={`tel:${contact.phoneNumber}`}
                  className="flex items-center text-sm text-primary-600 hover:underline"
                >
                  <PhoneCall className="mr-2 size-5 shrink-0" aria-hidden />
                  {contact.phoneNumber}
                </a>
              )}
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center text-sm text-primary-600 hover:underline"
              >
                <Mail className="mr-2 size-5 shrink-0" aria-hidden />
                <span className="min-w-0 break-all">{contact.email}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <hr className="my-4" />
      {children}
    </article>
  );
}
