import { ApplicationStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_CLASS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Approved]: "bg-green-500",
  [ApplicationStatus.Denied]: "bg-red-500",
  [ApplicationStatus.Pending]: "bg-yellow-500",
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={cn("rounded-full px-2 py-1 text-sm text-white", STATUS_CLASS[status])}>
      {status}
    </span>
  );
}
