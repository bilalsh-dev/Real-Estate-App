import { describe, expect, it } from "vitest";
import {
  currentMonthPaymentStatus,
  findLatestLease,
  nextPaymentDate,
  sortPaymentsNewestFirst,
} from "@/lib/leases";
import type { Lease, Payment } from "@/types";

const utc = (value: string) => new Date(`${value}T00:00:00.000Z`);

function payment(
  id: number,
  dueDate: string,
  paymentStatus: Payment["paymentStatus"] = "Paid",
): Payment {
  return {
    id,
    amountDue: 2000,
    amountPaid: paymentStatus === "Paid" ? 2000 : 0,
    dueDate: `${dueDate}T00:00:00.000Z`,
    paymentDate: `${dueDate}T00:00:00.000Z`,
    paymentStatus,
    leaseId: 1,
  };
}

function lease(id: number, propertyId: number, startDate: string): Lease {
  return {
    id,
    propertyId,
    startDate: `${startDate}T00:00:00.000Z`,
    endDate: "2030-01-01T00:00:00.000Z",
    rent: 2000,
    deposit: 1000,
    tenantCognitoId: "tenant-1",
  };
}

describe("nextPaymentDate", () => {
  it("returns the next monthly anniversary after now", () => {
    expect(nextPaymentDate("2026-01-15T00:00:00.000Z", utc("2026-05-20"))).toEqual(
      utc("2026-06-15"),
    );
    expect(nextPaymentDate("2026-01-15T00:00:00.000Z", utc("2026-05-15"))).toEqual(
      utc("2026-06-15"),
    );
  });

  it("clamps month-end leases and returns future start dates unchanged", () => {
    expect(nextPaymentDate("2026-01-31T00:00:00.000Z", utc("2026-02-10"))).toEqual(
      utc("2026-02-28"),
    );
    expect(nextPaymentDate("2026-09-01T00:00:00.000Z", utc("2026-05-01"))).toEqual(
      utc("2026-09-01"),
    );
  });
});

describe("currentMonthPaymentStatus", () => {
  const payments = [payment(1, "2026-04-01"), payment(2, "2026-05-01", "Overdue")];

  it("returns the status of the payment due this month", () => {
    expect(currentMonthPaymentStatus(payments, utc("2026-05-20"))).toBe("Overdue");
    expect(currentMonthPaymentStatus(payments, utc("2026-04-30"))).toBe("Paid");
  });

  it("reports Not Paid when nothing is due this month", () => {
    expect(currentMonthPaymentStatus(payments, utc("2026-06-02"))).toBe("Not Paid");
    expect(currentMonthPaymentStatus([], utc("2026-06-02"))).toBe("Not Paid");
  });
});

describe("sortPaymentsNewestFirst and findLatestLease", () => {
  it("sorts payments by due date without mutating the input", () => {
    const payments = [payment(1, "2026-02-01"), payment(3, "2026-04-01"), payment(2, "2026-03-01")];
    expect(sortPaymentsNewestFirst(payments).map(({ id }) => id)).toEqual([3, 2, 1]);
    expect(payments.map(({ id }) => id)).toEqual([1, 3, 2]);
  });

  it("picks the most recent lease for the property", () => {
    const leases = [
      lease(1, 5, "2024-01-01"),
      lease(2, 6, "2026-01-01"),
      lease(3, 5, "2025-01-01"),
    ];
    expect(findLatestLease(leases, 5)?.id).toBe(3);
    expect(findLatestLease(leases, 7)).toBeUndefined();
  });
});
