import { db } from "@/lib/db";

/**
 * Ensures that built-in media categories exist in the database
 * This function is called when the application starts
 */
export async function ensureBuiltInCategories() {
  try {
    console.log('DEBUG: DATABASE_URL being used:', process.env.DATABASE_URL);
    console.log('Ensuring built-in media categories exist...');

    // Define all required built-in categories
    const requiredCategories = [
      { id: 1, name: 'Bannerlar', icon: 'Images', order: 0 },
      { id: 2, name: 'Haberler', icon: 'Newspaper', order: 1 },
      { id: 3, name: 'Projeler', icon: 'Building2', order: 2 },
      { id: 4, name: 'Birimler', icon: 'Building2', order: 3 },
      { id: 5, name: 'İçerik Resimleri', icon: 'FileImage', order: 4 },
      { id: 6, name: 'Kurumsal', icon: 'UserCheck', order: 5 },
    ];

    for (const category of requiredCategories) {
      // Check if category exists
      const existing = await db.mediaCategory.findUnique({
        where: { id: category.id },
      });

      if (!existing) {
        // Create category with specific ID
        await db.mediaCategory.create({
          data: {
            id: category.id,
            name: category.name,
            icon: category.icon,
            order: category.order,
            isBuiltIn: true,
          },
        });
        console.log(`Created built-in category: ${category.name} (ID: ${category.id})`);
      } else if (!existing.isBuiltIn) {
        // Update existing category to be built-in
        await db.mediaCategory.update({
          where: { id: category.id },
          data: { isBuiltIn: true },
        });
        console.log(`Updated ${category.name} category to built-in`);
      } else {
        console.log(`Built-in category already exists: ${category.name} (ID: ${category.id})`);
      }
    }

    console.log('Built-in media categories check completed');
  } catch (error) {
    console.error('Error ensuring built-in media categories:', error);
  }
}
