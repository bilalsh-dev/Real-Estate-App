import { describe, expect, it } from "vitest";
import { parseEnv } from "./env.ts";

const valid = {
  NODE_ENV: "production",
  PORT: "3002",
  CORS_ORIGINS: "https://app.example.com, https://admin.example.com",
  DATABASE_URL: "postgresql://user:pass@db.example.com:5432/rentiful?schema=public",
  COGNITO_USER_POOL_ID: "eu-central-1_AbCdEf123",
  COGNITO_CLIENT_ID: "1example23456789abcdef",
};

describe("parseEnv", () => {
  it("parses a valid environment", () => {
    expect(parseEnv(valid)).toEqual({
      NODE_ENV: "production",
      PORT: 3002,
      CORS_ORIGINS: ["https://app.example.com", "https://admin.example.com"],
      DATABASE_URL: valid.DATABASE_URL,
      COGNITO_USER_POOL_ID: valid.COGNITO_USER_POOL_ID,
      COGNITO_CLIENT_ID: valid.COGNITO_CLIENT_ID,
    });
  });

  it.each([
    "DATABASE_URL",
    "PORT",
    "NODE_ENV",
    "CORS_ORIGINS",
    "COGNITO_USER_POOL_ID",
    "COGNITO_CLIENT_ID",
  ] as const)("fails clearly when %s is missing", (key) => {
    const { [key]: _removed, ...rest } = valid;
    expect(() => parseEnv(rest)).toThrow(new RegExp(`Invalid environment[\\s\\S]*${key}`));
  });

  it.each([
    ["PORT", "not-a-port"],
    ["PORT", "70000"],
    ["DATABASE_URL", "mysql://user:pass@host/db"],
    ["CORS_ORIGINS", "not a url"],
    ["NODE_ENV", "staging"],
    ["COGNITO_USER_POOL_ID", "not-a-pool"],
    ["COGNITO_CLIENT_ID", "has spaces"],
  ])("rejects an invalid %s (%s)", (key, value) => {
    expect(() => parseEnv({ ...valid, [key]: value })).toThrow(/Invalid environment/);
  });
});
