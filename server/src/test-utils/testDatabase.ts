import { existsSync } from "node:fs";

const TEST_DATABASE_SUFFIX = "_test";

export function resolveTestDatabaseUrl(): string {
  if (existsSync(".env")) process.loadEnvFile(".env");
  const source = process.env["DATABASE_URL"];
  if (!source) throw new Error("Integration tests need DATABASE_URL (see .env.example)");

  const url = new URL(source);
  const database = url.pathname.slice(1);
  if (!database) throw new Error("DATABASE_URL must name a database");
  url.pathname = `/${database.endsWith(TEST_DATABASE_SUFFIX) ? database : database + TEST_DATABASE_SUFFIX}`;
  return url.toString();
}
