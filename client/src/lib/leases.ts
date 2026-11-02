import type { PaymentStatus } from "@/lib/constants";
import type { Lease, Payment } from "@/types";

export const NOT_PAID = "Not Paid";

export type MonthPaymentStatus = PaymentStatus | typeof NOT_PAID;

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function addMonths(date: Date, months: number): Date {
  const monthIndex = date.getUTCMonth() + months;
  const year = date.getUTCFullYear() + Math.floor(monthIndex / 12);
  const month = ((monthIndex % 12) + 12) % 12;
  const result = new Date(date);
  result.setUTCFullYear(year, month, Math.min(date.getUTCDate(), daysInMonth(year, month)));
  return result;
}

export function nextPaymentDate(startDate: string | Date, now: Date): Date {
  const start = new Date(startDate);
  if (start > now) return start;
  let months =
    (now.getUTCFullYear() - start.getUTCFullYear()) * 12 + now.getUTCMonth() - start.getUTCMonth();
  months = Math.max(months, 1);
  while (addMonths(start, months) <= now) months += 1;
  return addMonths(start, months);
}

export function currentMonthPaymentStatus(payments: Payment[], now: Date): MonthPaymentStatus {
  const payment = payments.find(({ dueDate }) => {
    const due = new Date(dueDate);
    return due.getUTCFullYear() === now.getUTCFullYear() && due.getUTCMonth() === now.getUTCMonth();
  });
  return payment?.paymentStatus ?? NOT_PAID;
}

export function sortPaymentsNewestFirst(payments: Payment[]): Payment[] {
  return [...payments].sort((a, b) => Date.parse(b.dueDate) - Date.parse(a.dueDate));
}

export function findLatestLease(leases: Lease[], propertyId: number): Lease | undefined {
  return leases
    .filter((lease) => lease.propertyId === propertyId)
    .sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate))[0];
}
