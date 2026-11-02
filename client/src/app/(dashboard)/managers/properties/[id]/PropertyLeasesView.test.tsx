import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeProperty } from "@/test-utils/property";
import type { Lease } from "@/types";
import { PropertyLeasesView } from "./PropertyLeasesView";

let leases: Lease[] = [];

vi.mock("@/state/api", () => ({
  useGetPropertyQuery: () => ({ data: makeProperty({ name: "Canal Loft" }), isLoading: false }),
  useGetPropertyLeasesQuery: () => ({ data: leases, isLoading: false }),
}));

const tenant = {
  id: 1,
  cognitoId: "t1",
  name: "Ann Smith",
  email: "ann@example.com",
  phoneNumber: "+1 555 0100",
};

function lease(id: number, status: "Paid" | "Overdue" | null): Lease {
  return {
    id,
    startDate: "2026-01-15T00:00:00.000Z",
    endDate: "2027-01-15T00:00:00.000Z",
    rent: 2100,
    deposit: 1000,
    propertyId: 1,
    tenantCognitoId: "t1",
    tenant: { ...tenant, name: id === 1 ? "Ann Smith" : "Bob Jones" },
    payments:
      status === null
        ? []
        : [
            {
              id: id * 10,
              amountDue: 2100,
              amountPaid: 2100,
              dueDate: "2026-04-15T00:00:00.000Z",
              paymentDate: "2026-04-15T00:00:00.000Z",
              paymentStatus: "Paid",
              leaseId: id,
            },
            {
              id: id * 10 + 1,
              amountDue: 2100,
              amountPaid: 0,
              dueDate: "2026-05-15T00:00:00.000Z",
              paymentDate: "2026-05-15T00:00:00.000Z",
              paymentStatus: status,
              leaseId: id,
            },
          ],
  };
}

describe("PropertyLeasesView", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-05-20T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows tenant, dates, rent and the current month's payment status", () => {
    leases = [lease(1, "Paid"), lease(2, null)];
    render(<PropertyLeasesView propertyId={1} />);

    expect(screen.getByRole("heading", { name: "Canal Loft" })).toBeInTheDocument();
    const [, first, second] = screen.getAllByRole("row");
    const firstRow = within(first as HTMLElement);
    expect(firstRow.getByText("Ann Smith")).toBeInTheDocument();
    expect(firstRow.getByText("ann@example.com")).toBeInTheDocument();
    expect(firstRow.getByText("Jan 15, 2026 – Jan 15, 2027")).toBeInTheDocument();
    expect(firstRow.getByText("$2,100.00")).toBeInTheDocument();
    expect(firstRow.getByText("Paid")).toBeInTheDocument();
    expect(firstRow.getByText("+1 555 0100")).toBeInTheDocument();
    expect(within(second as HTMLElement).getByText("Not Paid")).toBeInTheDocument();
  });

  it("shows an empty state without leases", () => {
    leases = [];
    render(<PropertyLeasesView propertyId={1} />);
    expect(screen.getByText("This property has no leases yet.")).toBeInTheDocument();
  });
});
