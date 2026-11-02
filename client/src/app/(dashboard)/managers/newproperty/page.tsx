import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { NewPropertyForm } from "./NewPropertyForm";

export const metadata: Metadata = {
  title: "Add New Property | Rentiful",
};

export default function Page() {
  return (
    <div className="dashboard-container">
      <Header
        title="Add New Property"
        subtitle="Create a new property listing with detailed information"
      />
      <NewPropertyForm />
    </div>
  );
}
