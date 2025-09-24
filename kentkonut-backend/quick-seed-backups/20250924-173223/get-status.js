const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getStatus() {
  const status = {
    users: await prisma.user.count(),
    hafriyatBolgeler: await prisma.hafriyatBolge.count(),
    hafriyatSahalar: await prisma.hafriyatSaha.count(),
    hafriyatBelgeKategorileri: await prisma.hafriyatBelgeKategori.count(),
    newsCategories: await prisma.newsCategory.count(),
    news: await prisma.news.count(),
    projects: await prisma.project.count(),
    departments: await prisma.department.count(),
    executives: await prisma.executive.count(),
    personnel: await prisma.personnel.count(),
    tags: await prisma.tag.count(),
    projectTags: await prisma.projectTag.count(),
    projectRelations: await prisma.projectRelation.count(),
    projectGalleries: await prisma.projectGallery.count(),
    projectGalleryMedia: await prisma.projectGalleryMedia.count(),
    mediaCategories: await prisma.mediaCategory.count(),
    quickAccessLinks: await prisma.quickAccessLink.count(),
    comments: await prisma.comment.count(),
    menuItems: await prisma.menuItem.count()
  };
  
  console.log(JSON.stringify(status, null, 2));
  await prisma.$disconnect();
}

getStatus().catch(console.error);
