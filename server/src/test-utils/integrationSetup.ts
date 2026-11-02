import { execFileSync } from "node:child_process";
import pg from "pg";
import { resolveTestDatabaseUrl } from "./testDatabase.ts";

async function ensureDatabaseExists(databaseUrl: string): Promise<void> {
  const target = new URL(databaseUrl);
  const database = target.pathname.slice(1);
  const admin = new URL(databaseUrl);
  admin.pathname = "/postgres";
  admin.search = "";

  const client = new pg.Client({ connectionString: admin.toString() });
  await client.connect();
  try {
    const { rowCount } = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [
      database,
    ]);
    if (rowCount === 0) await client.query(`CREATE DATABASE "${database.replaceAll('"', '""')}"`);
  } finally {
    await client.end();
  }
}

export default async function setup(): Promise<void> {
  const databaseUrl = resolveTestDatabaseUrl();
  await ensureDatabaseExists(databaseUrl);
  execFileSync("npx", ["prisma", "migrate", "deploy"], {
    env: { ...process.env, DATABASE_URL: databaseUrl, PRISMA_HIDE_UPDATE_MESSAGE: "1" },
    stdio: "inherit",
  });
}
