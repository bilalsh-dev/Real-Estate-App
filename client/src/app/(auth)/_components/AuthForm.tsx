"use client";

import {
  Authenticator,
  Heading,
  Radio,
  RadioGroupField,
  useAuthenticator,
  View,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { REDIRECT_PARAM, UserRole } from "@/lib/constants";
import { safeRedirectPath } from "@/lib/utils";

const ROLE_ATTRIBUTE = "custom:role";
const ROLE_VALUES: readonly string[] = Object.values(UserRole);

const components = {
  Header() {
    return (
      <View className="mt-4 mb-7">
        <Heading level={3} className="text-2xl! font-bold!">
          RENT
          <span className="font-light text-secondary-500">IFUL</span>
        </Heading>
        <p className="mt-2 text-muted-foreground">
          <span className="font-bold">Welcome!</span> Please sign in to continue
        </p>
      </View>
    );
  },
  SignIn: {
    Footer() {
      const { toSignUp } = useAuthenticator();
      return (
        <View className="mt-4 text-center">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button type="button" onClick={toSignUp} className="text-primary hover:underline">
              Sign up here
            </button>
          </p>
        </View>
      );
    },
  },
  SignUp: {
    FormFields() {
      const { validationErrors } = useAuthenticator();
      const roleError = validationErrors[ROLE_ATTRIBUTE];
      return (
        <>
          <Authenticator.SignUp.FormFields />
          <RadioGroupField
            legend="Role"
            name={ROLE_ATTRIBUTE}
            errorMessage={typeof roleError === "string" ? roleError : roleError?.join(", ")}
            hasError={Boolean(roleError)}
            isRequired
          >
            <Radio value={UserRole.Tenant}>Tenant</Radio>
            <Radio value={UserRole.Manager}>Manager</Radio>
          </RadioGroupField>
        </>
      );
    },
    Footer() {
      const { toSignIn } = useAuthenticator();
      return (
        <View className="mt-4 text-center">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <button type="button" onClick={toSignIn} className="text-primary hover:underline">
              Sign in
            </button>
          </p>
        </View>
      );
    },
  },
};

const formFields = {
  signIn: {
    username: {
      label: "Username or email",
      placeholder: "Enter your username or email",
      isRequired: true,
    },
    password: { label: "Password", placeholder: "Enter your password", isRequired: true },
  },
  signUp: {
    username: { order: 1, label: "Username", placeholder: "Choose a username", isRequired: true },
    email: { order: 2, label: "Email", placeholder: "Enter your email address", isRequired: true },
    password: { order: 3, label: "Password", placeholder: "Create a password", isRequired: true },
    confirm_password: {
      order: 4,
      label: "Confirm Password",
      placeholder: "Confirm your password",
      isRequired: true,
    },
  },
};

const services = {
  validateCustomSignUp(formData: Record<string, string>, touchData: Record<string, boolean>) {
    const role = formData[ROLE_ATTRIBUTE];
    const hasValidRole = Boolean(role && ROLE_VALUES.includes(role));
    const isTouched = Object.values(touchData).some(Boolean);
    return Promise.resolve(
      hasValidRole || !isTouched ? undefined : { [ROLE_ATTRIBUTE]: "Select a role" },
    );
  },
};

type AuthFormProps = {
  initialState: "signIn" | "signUp";
};

export function AuthForm({ initialState }: AuthFormProps) {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get(REDIRECT_PARAM));

  useEffect(() => {
    if (authStatus === "authenticated") router.replace(redirectTo);
  }, [authStatus, redirectTo, router]);

  return (
    <Authenticator
      initialState={initialState}
      components={components}
      formFields={formFields}
      services={services}
    >
      {() => <p className="p-8 text-center text-muted-foreground">Redirecting…</p>}
    </Authenticator>
  );
}
