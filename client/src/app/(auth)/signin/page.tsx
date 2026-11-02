import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../_components/AuthForm";

export const metadata: Metadata = {
  title: "Sign in | Rentiful",
};

export default function Page() {
  return (
    <Suspense>
      <AuthForm initialState="signIn" />
    </Suspense>
  );
}
