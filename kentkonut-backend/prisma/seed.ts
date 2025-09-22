import { PrismaClient } from '@prisma/client';
import { seedFooter } from './seeds/footer';
import { seedFooterSections } from './seeds/footer_sections';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');
  await seedFooter(prisma);
  await seedFooterSections(prisma);
  console.log('Seed process finished.');
}

main()
  .catch((e) => {
    console.error('Menü seed işlemi sırasında bir hata oluştu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
