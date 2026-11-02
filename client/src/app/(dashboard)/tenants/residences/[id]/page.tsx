import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Loading } from "@/components/Loading";
import { parseIdParam } from "@/lib/utils";
import { ResidenceView } from "./ResidenceView";

export const metadata: Metadata = {
  title: "Residence | Rentiful",
};

async function ResidenceRoute({ params }: Pick<PageProps<"/tenants/residences/[id]">, "params">) {
  const propertyId = parseIdParam((await params).id);
  if (propertyId === null) notFound();
  return <ResidenceView propertyId={propertyId} />;
}

export default function Page({ params }: PageProps<"/tenants/residences/[id]">) {
  return (
    <div className="dashboard-container">
      <Suspense fallback={<Loading />}>
        <ResidenceRoute params={params} />
      </Suspense>
    </div>
  );
}
