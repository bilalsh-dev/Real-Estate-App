import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { ManagerPropertiesList } from "./ManagerPropertiesList";

export const metadata: Metadata = {
  title: "My Properties | Rentiful",
};

export default function Page() {
  return (
    <div className="dashboard-container">
      <Header title="My Properties" subtitle="View and manage your property listings" />
      <ManagerPropertiesList />
    </div>
  );
}
