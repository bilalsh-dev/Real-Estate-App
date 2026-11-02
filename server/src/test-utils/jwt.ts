import { generateKeyPairSync, sign, type KeyObject } from "node:crypto";
import type { Jwk } from "aws-jwt-verify/jwk";

export const TEST_USER_POOL_ID = "eu-central-1_TestPool1";
export const TEST_CLIENT_ID = "testclientid123";
export const TEST_ISSUER = `https://cognito-idp.eu-central-1.amazonaws.com/${TEST_USER_POOL_ID}`;

const SECONDS_PER_HOUR = 3600;

export type SigningKey = {
  kid: string;
  privateKey: KeyObject;
  jwk: Jwk;
};

export function createSigningKey(kid: string): SigningKey {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const { n, e } = publicKey.export({ format: "jwk" });
  if (!n || !e) throw new Error("RSA public key is missing its modulus or exponent");
  return { kid, privateKey, jwk: { kty: "RSA", n, e, kid, alg: "RS256", use: "sig" } };
}

function encode(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export function signIdToken(
  key: SigningKey,
  claims: Record<string, unknown> = {},
  { kid = key.kid }: { kid?: string } = {},
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: "RS256", typ: "JWT", kid });
  const payload = encode({
    sub: "user-1",
    iss: TEST_ISSUER,
    aud: TEST_CLIENT_ID,
    token_use: "id",
    iat: now,
    auth_time: now,
    exp: now + SECONDS_PER_HOUR,
    ...claims,
  });
  const signature = sign("RSA-SHA256", Buffer.from(`${header}.${payload}`), key.privateKey);
  return `${header}.${payload}.${signature.toString("base64url")}`;
}
