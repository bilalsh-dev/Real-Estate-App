import { Amplify } from "aws-amplify";
import { env } from "@/lib/env";

export function configureAmplify(): void {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID,
        userPoolClientId: env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID,
      },
    },
  });
}
