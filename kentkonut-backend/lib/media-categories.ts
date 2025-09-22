"use client";

// Constants for media categories to ensure consistent usage across the application
export const MEDIA_CATEGORIES = {
  BANNER_IMAGES: {
    id: 1,
    key: 'banner-images',
    name: 'Bannerlar',
    icon: 'Images',
  },
  NEWS_IMAGES: {
    id: 2,
    key: 'news-images',
    name: 'Haberler',
    icon: 'Newspaper',
  },
  PROJECT_IMAGES: {
    id: 3,
    key: 'project-images',
    name: 'Projeler',
    icon: 'Building2',
  },  CONTENT_IMAGES: {
    id: 5, // This will be created by the init script if it doesn't exist
    key: 'content-images',
    name: 'İçerik Resimleri',
    icon: 'FileImage',
  },
  CORPORATE_IMAGES: {
    id: 6,
    key: 'corporate-images',
    name: 'Kurumsal',
    icon: 'UserCheck',
  },
  DEPARTMENT_IMAGES: {
    id: 4,
    key: 'department-images',
    name: 'Birimler',
    icon: 'Building2',
  },
  SERVICE_IMAGES: {
    id: 7,
    key: 'service-images',
    name: 'Hizmetler',
    icon: 'Settings',
  },
};

// Function to get category ID by key
export function getCategoryIdByKey(key: string): number | undefined {
  const category = Object.values(MEDIA_CATEGORIES).find(cat => cat.key === key);
  return category?.id;
}

// Function to get category by ID
export function getCategoryById(id: number): typeof MEDIA_CATEGORIES.CONTENT_IMAGES | undefined {
  return Object.values(MEDIA_CATEGORIES).find(cat => cat.id === id);
}

// Function to check if a category ID exists
export function categoryExists(id: number): boolean {
  return Object.values(MEDIA_CATEGORIES).some(cat => cat.id === id);
}
