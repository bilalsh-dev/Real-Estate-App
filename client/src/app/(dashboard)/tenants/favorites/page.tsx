import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { FavoritesList } from "./FavoritesList";

export const metadata: Metadata = {
  title: "Favorites | Rentiful",
};

export default function Page() {
  return (
    <div className="dashboard-container">
      <Header
        title="Favorited Properties"
        subtitle="Browse and manage your saved property listings"
      />
      <FavoritesList />
    </div>
  );
}
