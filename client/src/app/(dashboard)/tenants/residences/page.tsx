import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { ResidencesList } from "./ResidencesList";

export const metadata: Metadata = {
  title: "Residences | Rentiful",
};

export default function Page() {
  return (
    <div className="dashboard-container">
      <Header title="Current Residences" subtitle="View and manage your current living spaces" />
      <ResidencesList />
    </div>
  );
}
