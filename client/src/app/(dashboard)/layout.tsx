import { DashboardShell } from "./_components/DashboardShell";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return <DashboardShell>{children}</DashboardShell>;
}
