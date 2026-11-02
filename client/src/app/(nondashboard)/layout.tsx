import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { NAVBAR_HEIGHT_PX } from "@/lib/constants";
import { ManagerRedirect } from "./_components/ManagerRedirect";

export default function NonDashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="size-full">
      <Suspense>
        <ManagerRedirect />
      </Suspense>
      <Navbar />
      <main className="flex size-full flex-col" style={{ paddingTop: `${NAVBAR_HEIGHT_PX}px` }}>
        {children}
      </main>
    </div>
  );
}
