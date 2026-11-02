import Image from "next/image";
import Link from "next/link";
import { DashboardNavAction } from "@/components/DashboardNavAction";
import { NavbarUserMenu } from "@/components/NavbarUserMenu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NAVBAR_HEIGHT_PX } from "@/lib/constants";

type NavbarProps = {
  variant?: "public" | "dashboard";
};

export function Navbar({ variant = "public" }: NavbarProps) {
  const isDashboard = variant === "dashboard";

  return (
    <header
      className="fixed top-0 left-0 z-50 w-full shadow-xl"
      style={{ height: `${NAVBAR_HEIGHT_PX}px` }}
    >
      <div className="flex h-full w-full items-center justify-between bg-primary-700 px-8 text-white">
        <div className="flex items-center gap-4 md:gap-6">
          {isDashboard && <SidebarTrigger className="md:hidden" />}
          <Link href="/" className="hover:text-primary-300" scroll={false}>
            <div className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="Rentiful logo"
                width={24}
                height={24}
                className="size-6"
              />
              <span className="text-xl font-bold">
                RENT
                <span className="font-light text-secondary-500">IFUL</span>
              </span>
            </div>
          </Link>
          {isDashboard && <DashboardNavAction />}
        </div>
        {!isDashboard && (
          <p className="hidden text-primary-200 md:block">
            Discover your perfect rental apartment with our advanced search
          </p>
        )}
        <NavbarUserMenu />
      </div>
    </header>
  );
}
