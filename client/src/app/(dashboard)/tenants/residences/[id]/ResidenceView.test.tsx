import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeProperty } from "@/test-utils/property";
import type { Lease, Payment } from "@/types";
import { ResidenceView } from "./ResidenceView";

let leases: Lease[] = [];
const requestedLeaseIds: unknown[] = [];

function payment(id: number, dueDate: string): Payment {
  return {
    id,
    amountDue: 2100,
    amountPaid: 2100,
    dueDate: `${dueDate}T00:00:00.000Z`,
    paymentDate: `${dueDate}T00:00:00.000Z`,
    paymentStatus: "Paid",
    leaseId: 2,
  };
}

vi.mock("@/state/api", () => ({
  useGetPropertyQuery: () => ({
    data: makeProperty({ id: 5, name: "Canal Loft" }),
    isLoading: false,
  }),
  useGetLeasesQuery: () => ({ data: leases, isLoading: false }),
  useGetPaymentsQuery: (leaseId: unknown) => {
    requestedLeaseIds.push(leaseId);
    return {
      data: [payment(1, "2026-02-15"), payment(3, "2026-04-15"), payment(2, "2026-03-15")],
      isLoading: false,
    };
  },
}));

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

function lease(id: number, propertyId: number, startDate: string): Lease {
  return {
    id,
    propertyId,
    startDate: `${startDate}T00:00:00.000Z`,
    endDate: "2027-01-15T00:00:00.000Z",
    rent: 2100,
    deposit: 1000,
    tenantCognitoId: "tenant-1",
  };
}

describe("ResidenceView", () => {
  beforeEach(() => {
    requestedLeaseIds.length = 0;
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-05-20T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the lease period, next payment and payment history newest first", () => {
    leases = [lease(1, 9, "2025-01-01"), lease(2, 5, "2026-01-15")];
    render(<ResidenceView propertyId={5} />);

    expect(screen.getByRole("heading", { name: "Canal Loft" })).toBeInTheDocument();
    expect(screen.getByText("Active Lease")).toBeInTheDocument();
    expect(screen.getByText("Jan 15, 2026")).toBeInTheDocument();
    expect(screen.getByText("Jan 15, 2027")).toBeInTheDocument();
    expect(screen.getByText("Jun 15, 2026")).toBeInTheDocument();
    expect(screen.getByText("$2,100.00")).toBeInTheDocument();
    expect(requestedLeaseIds).toContain(2);

    const invoices = screen.getAllByText(/^Invoice #/).map((cell) => cell.textContent);
    expect(invoices).toEqual([
      "Invoice #3 - Apr 2026",
      "Invoice #2 - Mar 2026",
      "Invoice #1 - Feb 2026",
    ]);
  });

  it("explains when the tenant has no lease for the property", () => {
    leases = [lease(1, 9, "2025-01-01")];
    render(<ResidenceView propertyId={5} />);
    expect(screen.getByText("You don't have a lease for this property.")).toBeInTheDocument();
  });
});
