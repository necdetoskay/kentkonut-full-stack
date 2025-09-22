import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateHighlightImageUrls() {
  console.log('Starting update of Highlight image URLs...');

  try {
    const highlights = await prisma.highlight.findMany({
      where: {
        imageUrl: {
          startsWith: 'http', // Only target absolute URLs
        },
      },
    });

    if (highlights.length === 0) {
      console.log('No absolute image URLs found in Highlights to update.');
      return;
    }

    console.log(`Found ${highlights.length} Highlight records with absolute image URLs.`);

    for (const highlight of highlights) {
      if (highlight.imageUrl) {
        try {
          const parsedUrl = new URL(highlight.imageUrl);
          // Extract only the pathname (e.g., /media/image.png)
          const relativePath = parsedUrl.pathname + (parsedUrl.search || '');

          // Normalize the path to ensure it starts with /media/ or /uploads/media/
          let normalizedPath = relativePath;
          if (normalizedPath.startsWith('/public/uploads/media/')) {
            normalizedPath = normalizedPath.replace('/public/uploads/media/', '/uploads/media/');
          } else if (normalizedPath.startsWith('/uploads/media/')) {
            // Already in /uploads/media/ format
          } else if (normalizedPath.startsWith('/media/')) {
            // Already in /media/ format
          } else {
            // Fallback for other unexpected absolute paths, try to make it relative to root
            normalizedPath = `/media${normalizedPath}`;
          }

          await prisma.highlight.update({
            where: { id: highlight.id },
            data: { imageUrl: normalizedPath },
          });
          console.log(`Updated Highlight ID: ${highlight.id} - Old URL: ${highlight.imageUrl} -> New URL: ${normalizedPath}`);
        } catch (urlError) {
          console.warn(`Skipping Highlight ID: ${highlight.id} due to URL parsing error:`, urlError);
        }
      }
    }

    console.log('Highlight image URL update completed.');
  } catch (error) {
    console.error('Error updating Highlight image URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateHighlightImageUrls();
