import { CognitoJwtVerifier } from "aws-jwt-verify";
import { FetchError } from "aws-jwt-verify/error";
import { beforeAll, describe, expect, it } from "vitest";
import {
  createSigningKey,
  signIdToken,
  TEST_CLIENT_ID,
  TEST_USER_POOL_ID,
  type SigningKey,
} from "../test-utils/jwt.ts";
import { UnauthorizedError } from "./errors.ts";
import { createTokenVerifier, type TokenVerifier } from "./tokenVerifier.ts";

describe("createTokenVerifier", () => {
  let trustedKey: SigningKey;
  let verifyToken: TokenVerifier;

  beforeAll(() => {
    trustedKey = createSigningKey("trusted");
    const cognito = CognitoJwtVerifier.create({
      userPoolId: TEST_USER_POOL_ID,
      clientId: TEST_CLIENT_ID,
      tokenUse: "id",
    });
    cognito.cacheJwks({ keys: [trustedKey.jwk] });
    verifyToken = createTokenVerifier(cognito);
  });

  it("returns the subject and role of a valid ID token", async () => {
    const token = signIdToken(trustedKey, { sub: "abc", "custom:role": "tenant" });
    await expect(verifyToken(token)).resolves.toEqual({ sub: "abc", role: "tenant" });
  });

  it("rejects a token signed with another key", async () => {
    const forged = signIdToken(createSigningKey("trusted"), { "custom:role": "manager" });
    await expect(verifyToken(forged)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it.each([
    ["expired", { exp: Math.floor(Date.now() / 1000) - 60 }],
    ["for another client", { aud: "otherclient" }],
    ["from another issuer", { iss: "https://cognito-idp.eu-central-1.amazonaws.com/other" }],
    ["an access token", { token_use: "access" }],
  ])("rejects a token that is %s", async (_case, claims) => {
    await expect(verifyToken(signIdToken(trustedKey, claims))).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it("rejects a malformed token", async () => {
    await expect(verifyToken("not-a-jwt")).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("does not hide JWKS fetch failures behind a 401", async () => {
    const failure = new FetchError("https://example.com/jwks.json", "network down");
    const verify = createTokenVerifier({ verify: () => Promise.reject(failure) });
    await expect(verify("token")).rejects.toBe(failure);
  });
});
