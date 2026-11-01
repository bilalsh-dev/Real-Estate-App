import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";
import { type Prisma, PrismaClient } from "../src/generated/prisma/client.ts";
import { SEED_ORDER, type SeedModel } from "./seedOrder.ts";

const TRANSACTION_TIMEOUT_MS = 60_000;
const SEED_DATA_DIR = path.join(import.meta.dirname, "seedData");

const databaseUrl = z.url().parse(process.env["DATABASE_URL"]);
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

type Tx = Prisma.TransactionClient;

const locationSchema = z.object({
  id: z.number().int(),
  country: z.string(),
  city: z.string(),
  state: z.string(),
  address: z.string(),
  postalCode: z.string(),
  coordinates: z.string().startsWith("POINT("),
});

async function readSeedFile(model: SeedModel): Promise<unknown[]> {
  const filePath = path.join(SEED_DATA_DIR, `${model.toLowerCase()}.json`);
  return z.array(z.unknown()).parse(JSON.parse(await readFile(filePath, "utf-8")));
}

const insertRecord: Record<SeedModel, (tx: Tx, record: unknown) => Promise<unknown>> = {
  Location: (tx, record) => {
    const location = locationSchema.parse(record);
    return tx.$executeRaw`
      INSERT INTO "Location" ("id", "country", "city", "state", "address", "postalCode", "coordinates")
      VALUES (${location.id}, ${location.country}, ${location.city}, ${location.state},
              ${location.address}, ${location.postalCode},
              ST_GeomFromText(${location.coordinates}, 4326))
    `;
  },
  Manager: (tx, record) => tx.manager.create({ data: record as Prisma.ManagerCreateInput }),
  Property: (tx, record) =>
    tx.property.create({ data: record as Prisma.PropertyUncheckedCreateInput }),
  Tenant: (tx, record) => tx.tenant.create({ data: record as Prisma.TenantCreateInput }),
  Lease: (tx, record) => tx.lease.create({ data: record as Prisma.LeaseUncheckedCreateInput }),
  Application: (tx, record) =>
    tx.application.create({ data: record as Prisma.ApplicationUncheckedCreateInput }),
  Payment: (tx, record) => tx.payment.create({ data: record as Prisma.PaymentCreateInput }),
};

async function clearAll(tx: Tx) {
  for (const model of [...SEED_ORDER].reverse()) {
    await tx.$executeRawUnsafe(`DELETE FROM "${model}"`);
  }
}

async function resetSequence(tx: Tx, model: SeedModel) {
  await tx.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"${model}"', 'id'), COALESCE(MAX("id"), 1), MAX("id") IS NOT NULL) FROM "${model}"`,
  );
}

async function seed() {
  const data = new Map<SeedModel, unknown[]>();
  for (const model of SEED_ORDER) data.set(model, await readSeedFile(model));

  await prisma.$transaction(
    async (tx) => {
      await clearAll(tx);
      for (const model of SEED_ORDER) {
        const records = data.get(model) ?? [];
        for (const record of records) await insertRecord[model](tx, record);
        await resetSequence(tx, model);
        console.warn(`Seeded ${records.length} ${model} records`);
      }
    },
    { timeout: TRANSACTION_TIMEOUT_MS },
  );
}

try {
  await seed();
} catch (error) {
  console.error("Seeding failed, no changes were committed:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
