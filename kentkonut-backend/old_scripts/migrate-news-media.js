const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');
const { mkdir } = require('fs/promises');

const prisma = new PrismaClient();
const OLD_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const NEW_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'haberler');

async function migrateNewsMedia() {
  try {
    // Create new directory if it doesn't exist
    if (!fs.existsSync(NEW_UPLOAD_DIR)) {
      await mkdir(NEW_UPLOAD_DIR, { recursive: true });
    }

    // Get all news gallery items with their media
    const galleryItems = await prisma.newsGalleryItem.findMany({
      include: {
        media: true
      }
    });

    console.log(`Found ${galleryItems.length} gallery items to migrate`);

    for (const item of galleryItems) {
      const media = item.media;
      if (!media) continue;

      const oldPath = media.path;
      const filename = path.basename(oldPath);
      const newPath = path.join(NEW_UPLOAD_DIR, filename);
      const newUrl = `/uploads/haberler/${filename}`;

      // Move file if it exists
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`Moved file from ${oldPath} to ${newPath}`);

        // Update database
        await prisma.media.update({
          where: { id: media.id },
          data: {
            path: newPath,
            url: newUrl
          }
        });
        console.log(`Updated database record for ${filename}`);
      } else {
        console.log(`File not found: ${oldPath}`);
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateNewsMedia(); 