import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favorites | Rentiful",
};

export default function Page() {
  return (
    <div className="dashboard-container">
      <h1 className="text-xl font-semibold">Favorited Properties</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Browse and manage your saved property listings
      </p>
    </div>
  );
}
