import type { Metadata } from "next";
import { ProfileSettings } from "../../_components/ProfileSettings";

export const metadata: Metadata = {
  title: "Settings | Rentiful",
};

export default function Page() {
  return <ProfileSettings userRole="manager" />;
}
