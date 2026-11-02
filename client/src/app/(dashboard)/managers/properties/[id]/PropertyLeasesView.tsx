"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Loading } from "@/components/Loading";
import { PaymentStatusBadge } from "@/components/PaymentStatusBadge";
import { QueryError } from "@/components/QueryError";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currentMonthPaymentStatus } from "@/lib/leases";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useGetPropertyLeasesQuery, useGetPropertyQuery } from "@/state/api";

export function PropertyLeasesView({ propertyId }: { propertyId: number }) {
  const [now] = useState(() => new Date());
  const propertyQuery = useGetPropertyQuery(propertyId);
  const leasesQuery = useGetPropertyLeasesQuery(propertyId);

  if (propertyQuery.isLoading || leasesQuery.isLoading) return <Loading />;
  if (!propertyQuery.data || !leasesQuery.data) {
    return <QueryError message="We couldn't load this property's leases." />;
  }

  const leases = leasesQuery.data;

  return (
    <>
      <Link
        href="/managers/properties"
        className="mb-4 flex items-center hover:text-primary-500"
        scroll={false}
      >
        <ArrowLeft className="mr-2 size-4" aria-hidden />
        <span>Back to Properties</span>
      </Link>
      <Header
        title={propertyQuery.data.name}
        subtitle="Manage tenants and leases for this property"
      />
      <section className="mt-8 overflow-hidden rounded-xl bg-white p-6 shadow-md">
        <h2 className="mb-1 text-2xl font-bold">Tenants Overview</h2>
        <p className="text-sm text-gray-500">All leases for this property.</p>
        <hr className="mt-4 mb-1" />
        {leases.length === 0 ? (
          <p className="py-6 text-gray-600">This property has no leases yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Lease Period</TableHead>
                  <TableHead>Monthly Rent</TableHead>
                  <TableHead>Current Month Status</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leases.map((lease) => (
                  <TableRow key={lease.id} className="h-24">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {lease.tenant?.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{lease.tenant?.name}</div>
                          <div className="text-sm text-gray-500">{lease.tenant?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(lease.startDate)} – {formatDate(lease.endDate)}
                    </TableCell>
                    <TableCell>{formatCurrency(lease.rent)}</TableCell>
                    <TableCell>
                      <PaymentStatusBadge
                        status={currentMonthPaymentStatus(lease.payments ?? [], now)}
                      />
                    </TableCell>
                    <TableCell>{lease.tenant?.phoneNumber || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </>
  );
}
