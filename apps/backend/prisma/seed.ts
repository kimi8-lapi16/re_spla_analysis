import { config } from 'dotenv';
import { PrismaClient } from '../generated/prisma/client';
import { seedBaseMasterData } from './seed-base';

config();

const prisma = new PrismaClient();

/**
 * Seed entry point
 *
 * Usage:
 * - pnpm seed              # Seed only base master data
 * - pnpm seed:local        # Seed base + local development data (users + matches)
 * - pnpm seed:local 10000  # Seed with target match count
 */
async function main() {
  await seedBaseMasterData(prisma);
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
