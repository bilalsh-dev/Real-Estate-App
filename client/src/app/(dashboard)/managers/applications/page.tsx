import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { ManagerApplicationsList } from "./ManagerApplicationsList";

export const metadata: Metadata = {
  title: "Applications | Rentiful",
};

export default function Page() {
  return (
    <div className="dashboard-container">
      <Header title="Applications" subtitle="View and manage applications for your properties" />
      <ManagerApplicationsList />
    </div>
  );
}
