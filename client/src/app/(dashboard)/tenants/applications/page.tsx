import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { TenantApplicationsList } from "./TenantApplicationsList";

export const metadata: Metadata = {
  title: "Applications | Rentiful",
};

export default function Page() {
  return (
    <div className="dashboard-container">
      <Header title="Applications" subtitle="Track and manage your property rental applications" />
      <TenantApplicationsList />
    </div>
  );
}
