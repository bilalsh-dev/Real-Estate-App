import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NAVBAR_HEIGHT_PX } from "@/lib/constants";

export function Navbar() {
  return (
    <header
      className="fixed top-0 left-0 z-50 w-full shadow-xl"
      style={{ height: `${NAVBAR_HEIGHT_PX}px` }}
    >
      <div className="flex h-full w-full items-center justify-between bg-primary-700 px-8 text-white">
        <Link href="/" className="hover:text-primary-300" scroll={false}>
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Rentiful logo" width={24} height={24} className="size-6" />
            <span className="text-xl font-bold">
              RENT
              <span className="font-light text-secondary-500">IFUL</span>
            </span>
          </div>
        </Link>
        <p className="hidden text-primary-200 md:block">
          Discover your perfect rental apartment with our advanced search
        </p>
        <nav className="flex items-center gap-5">
          <Button
            asChild
            variant="outline"
            className="rounded-lg border-white bg-transparent text-white hover:bg-white hover:text-primary-700"
          >
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            className="rounded-lg bg-secondary-600 text-white hover:bg-white hover:text-primary-700"
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
