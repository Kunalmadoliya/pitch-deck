import { Prisma, PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * A short "signature" of the generated schema: every model's field list.
 * In dev the client is cached on globalThis so hot reloads don't open new DB pools. After
 * `prisma generate` the signature changes, so we drop the stale client instead of reusing it
 * (otherwise new fields fail with "Unknown argument" until the dev server is restarted).
 */
const schemaSignature = JSON.stringify(
  Object.entries(Prisma)
    .filter(([name]) => name.endsWith("ScalarFieldEnum"))
    .map(([name, fields]) => [name, Object.keys(fields as object)]),
);

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaSignature?: string;
};

function createClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

function getClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (cached && globalForPrisma.prismaSignature === schemaSignature) return cached;
  // Schema changed since the cached client was made: close it in the background and start fresh.
  if (cached) void cached.$disconnect().catch(() => undefined);
  return createClient();
}

export const prisma = getClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSignature = schemaSignature;
}
