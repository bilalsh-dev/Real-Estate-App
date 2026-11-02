import { Check } from "lucide-react";
import { PaymentStatus } from "@/lib/constants";
import type { MonthPaymentStatus } from "@/lib/leases";
import { cn, formatEnumString } from "@/lib/utils";

const STATUS_CLASS: Record<MonthPaymentStatus, string> = {
  [PaymentStatus.Paid]: "border-green-300 bg-green-100 text-green-800",
  [PaymentStatus.Pending]: "border-yellow-300 bg-yellow-100 text-yellow-800",
  [PaymentStatus.PartiallyPaid]: "border-yellow-300 bg-yellow-100 text-yellow-800",
  [PaymentStatus.Overdue]: "border-red-300 bg-red-100 text-red-800",
  "Not Paid": "border-red-300 bg-red-100 text-red-800",
};

export function PaymentStatusBadge({ status }: { status: MonthPaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold",
        STATUS_CLASS[status],
      )}
    >
      {status === PaymentStatus.Paid && <Check className="mr-1 size-4" aria-hidden />}
      {formatEnumString(status)}
    </span>
  );
}
