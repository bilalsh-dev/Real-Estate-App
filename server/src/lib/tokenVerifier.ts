import { CognitoJwtVerifier } from "aws-jwt-verify";
import { FetchError, JwtBaseError } from "aws-jwt-verify/error";
import { ROLE_CLAIM } from "../config/constants.ts";
import { UnauthorizedError } from "./errors.ts";

export type VerifiedIdentity = {
  sub: string;
  role: unknown;
};

export type TokenVerifier = (token: string) => Promise<VerifiedIdentity>;

export type CognitoIdTokenVerifier = {
  verify(token: string): Promise<{ sub: string; [claim: string]: unknown }>;
};

export function createCognitoIdTokenVerifier(config: {
  userPoolId: string;
  clientId: string;
}): CognitoIdTokenVerifier {
  return CognitoJwtVerifier.create({
    userPoolId: config.userPoolId,
    clientId: config.clientId,
    tokenUse: "id",
  });
}

export function createTokenVerifier(verifier: CognitoIdTokenVerifier): TokenVerifier {
  return async (token) => {
    try {
      const payload = await verifier.verify(token);
      return { sub: payload.sub, role: payload[ROLE_CLAIM] };
    } catch (error) {
      if (error instanceof JwtBaseError && !(error instanceof FetchError)) {
        throw new UnauthorizedError("Invalid or expired token");
      }
      throw error;
    }
  };
}
