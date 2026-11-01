import { Navbar } from "@/components/Navbar";
import { NAVBAR_HEIGHT_PX } from "@/lib/constants";

export default function NonDashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="size-full">
      <Navbar />
      <main className="flex size-full flex-col" style={{ paddingTop: `${NAVBAR_HEIGHT_PX}px` }}>
        {children}
      </main>
    </div>
  );
}
