import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "./SearchView";

export const metadata: Metadata = {
  title: "Search rentals | Rentiful",
};

export default function Page() {
  return (
    <Suspense>
      <SearchView />
    </Suspense>
  );
}
