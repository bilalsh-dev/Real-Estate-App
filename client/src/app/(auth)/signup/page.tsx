import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../_components/AuthForm";

export const metadata: Metadata = {
  title: "Sign up | Rentiful",
};

export default function Page() {
  return (
    <Suspense>
      <AuthForm initialState="signUp" />
    </Suspense>
  );
}
