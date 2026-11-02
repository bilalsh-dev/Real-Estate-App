"use client";

import { skipToken } from "@reduxjs/toolkit/query";
import { FileText, MapPin } from "lucide-react";
import { useState } from "react";
import { Loading } from "@/components/Loading";
import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";
import { PropertyImage } from "@/components/PropertyImage";
import { QueryError } from "@/components/QueryError";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { findLatestLease, nextPaymentDate, sortPaymentsNewestFirst } from "@/lib/leases";
import { formatCurrency, formatDate, formatMonth } from "@/lib/utils";
import { useGetLeasesQuery, useGetPaymentsQuery, useGetPropertyQuery } from "@/state/api";
import type { Lease, Payment, Property } from "@/types";

function ResidenceCard({ property, lease, now }: { property: Property; lease: Lease; now: Date }) {
  const isActive = new Date(lease.startDate) <= now && now < new Date(lease.endDate);
  const dates: [string, string][] = [
    ["Start Date", formatDate(lease.startDate)],
    ["End Date", formatDate(lease.endDate)],
    ["Next Payment", isActive ? formatDate(nextPaymentDate(lease.startDate, now)) : "None"],
  ];

  return (
    <section className="flex flex-col justify-between overflow-hidden rounded-xl bg-white p-6 shadow-md">
      <div className="flex gap-5">
        <div className="relative h-32 w-64 shrink-0 overflow-hidden rounded-xl">
          <PropertyImage src={property.photoUrls[0]} alt={property.name} sizes="16rem" />
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <span
              className={`w-fit rounded-full px-4 py-1 text-sm font-semibold text-white ${isActive ? "bg-green-500" : "bg-gray-500"}`}
            >
              {isActive ? "Active Lease" : "Inactive Lease"}
            </span>
            <h1 className="my-2 text-2xl font-bold">{property.name}</h1>
            <div className="mb-2 flex items-center">
              <MapPin className="mr-1 size-5" aria-hidden />
              <span>
                {property.location.city}, {property.location.country}
              </span>
            </div>
          </div>
          <div className="text-xl font-bold">
            {formatCurrency(lease.rent)}{" "}
            <span className="text-sm font-normal text-gray-500">/ month</span>
          </div>
        </div>
      </div>
      <hr className="my-4" />
      <dl className="flex flex-wrap items-center justify-between gap-4">
        {dates.map(([label, value]) => (
          <div key={label} className="xl:flex">
            <dt className="mr-2 text-gray-500">{label}:</dt>
            <dd className="font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function BillingHistory({ payments }: { payments: Payment[] }) {
  return (
    <section className="mt-8 overflow-hidden rounded-xl bg-white p-6 shadow-md">
      <h2 className="mb-1 text-2xl font-bold">Billing History</h2>
      <p className="text-sm text-gray-500">Your rent payments for this lease, newest first.</p>
      <hr className="mt-4 mb-1" />
      {payments.length === 0 ? (
        <p className="py-6 text-gray-600">No payments recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Paid On</TableHead>
                <TableHead>Amount Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortPaymentsNewestFirst(payments).map((payment) => (
                <TableRow key={payment.id} className="h-16">
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <FileText className="mr-2 size-4" aria-hidden />
                      Invoice #{payment.id} - {formatMonth(payment.dueDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={payment.paymentStatus} />
                  </TableCell>
                  <TableCell>{formatDate(payment.dueDate)}</TableCell>
                  <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                  <TableCell>
                    {formatCurrency(payment.amountPaid)} of {formatCurrency(payment.amountDue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

export function ResidenceView({ propertyId }: { propertyId: number }) {
  const [now] = useState(() => new Date());
  const propertyQuery = useGetPropertyQuery(propertyId);
  const leasesQuery = useGetLeasesQuery();
  const lease = findLatestLease(leasesQuery.data ?? [], propertyId);
  const paymentsQuery = useGetPaymentsQuery(lease?.id ?? skipToken);

  if (propertyQuery.isLoading || leasesQuery.isLoading || paymentsQuery.isLoading) {
    return <Loading />;
  }
  if (!propertyQuery.data || leasesQuery.isError || paymentsQuery.isError) {
    return <QueryError message="We couldn't load this residence." />;
  }
  if (!lease)
    return <p className="text-gray-600">You don&apos;t have a lease for this property.</p>;

  return (
    <div className="mx-auto w-full">
      <ResidenceCard property={propertyQuery.data} lease={lease} now={now} />
      <BillingHistory payments={paymentsQuery.data ?? []} />
    </div>
  );
}
