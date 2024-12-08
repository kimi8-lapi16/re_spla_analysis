import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// NOTE: npm run seedで以下のエラーが表示されてた場合、npx prisma migrate devを叩く
// The table `public.Purpose` does not exist in the current database.
async function main() {}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
