import Link from "next/link";
import { CurrentYear } from "@/components/CurrentYear";

const FOOTER_LINKS = [
  { href: "/search", label: "Search" },
  { href: "/signin", label: "Sign In" },
  { href: "/signup", label: "Sign Up" },
] as const;

export function FooterSection() {
  return (
    <footer className="border-t border-gray-200 py-20">
      <div className="mx-auto max-w-4xl px-6 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Link href="/" className="text-xl font-bold" scroll={false}>
            RENTIFUL
          </Link>
          <nav aria-label="Footer">
            <ul className="flex gap-6">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-8 text-center text-sm text-gray-500">
          © <CurrentYear /> Rentiful. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
