import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PropertyView } from "./PropertyView";

export const metadata: Metadata = {
  title: "Property | Rentiful",
};

async function PropertyRoute({ params }: Pick<PageProps<"/search/[id]">, "params">) {
  const { id } = await params;
  const propertyId = Number(id);
  if (!Number.isSafeInteger(propertyId) || propertyId <= 0) notFound();
  return <PropertyView propertyId={propertyId} />;
}

export default function Page({ params }: PageProps<"/search/[id]">) {
  return (
    <Suspense>
      <PropertyRoute params={params} />
    </Suspense>
  );
}
