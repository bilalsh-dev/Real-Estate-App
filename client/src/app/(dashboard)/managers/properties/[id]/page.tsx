import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/Loading";
import { parseIdParam } from "@/lib/utils";
import { PropertyLeasesView } from "./PropertyLeasesView";

export const metadata: Metadata = {
  title: "Property Tenants | Rentiful",
};

async function PropertyLeasesRoute({
  params,
}: Pick<PageProps<"/managers/properties/[id]">, "params">) {
  const propertyId = parseIdParam((await params).id);
  if (propertyId === null) notFound();
  return <PropertyLeasesView propertyId={propertyId} />;
}

export default function Page({ params }: PageProps<"/managers/properties/[id]">) {
  return (
    <div className="dashboard-container">
      <Suspense fallback={<Loading />}>
        <PropertyLeasesRoute params={params} />
      </Suspense>
    </div>
  );
}
