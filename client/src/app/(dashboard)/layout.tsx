import { Suspense } from "react";
import { Loading } from "@/components/Loading";
import { DashboardShell } from "./_components/DashboardShell";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
