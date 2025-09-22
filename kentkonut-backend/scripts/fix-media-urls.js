// Fix media URLs in database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. /public/haberler/ -> /haberler/
  const medias0 = await prisma.media.findMany({
    where: {
      url: { contains: '/public/haberler/' }
    }
  });
  let updated0 = 0;
  for (const media of medias0) {
    const newUrl = media.url.replace('/public/haberler/', '/haberler/');
    if (newUrl !== media.url) {
      await prisma.media.update({
        where: { id: media.id },
        data: { url: newUrl }
      });
      updated0++;
    }
  }
  console.log('Updated /public/haberler/ -> /haberler/:', updated0);

  // 2. /uploads/haberler/ -> /haberler/
  const medias1 = await prisma.media.findMany({
    where: {
      url: { contains: '/uploads/haberler/' }
    }
  });
  let updated1 = 0;
  for (const media of medias1) {
    const newUrl = media.url.replace('/uploads/haberler/', '/haberler/');
    if (newUrl !== media.url) {
      await prisma.media.update({
        where: { id: media.id },
        data: { url: newUrl }
      });
      updated1++;
    }
  }
  console.log('Updated /uploads/haberler/ -> /haberler/:', updated1);

  // 3. /uploads/ -> /haberler/ (kalanlar için)
  const medias2 = await prisma.media.findMany({
    where: {
      url: { contains: '/uploads/' }
    }
  });
  let updated2 = 0;
  for (const media of medias2) {
    const newUrl = media.url.replace('/uploads/', '/haberler/');
    if (newUrl !== media.url) {
      await prisma.media.update({
        where: { id: media.id },
        data: { url: newUrl }
      });
      updated2++;
    }
  }
  console.log('Updated /uploads/ -> /haberler/:', updated2);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
