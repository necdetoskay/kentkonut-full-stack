/**
 * SEO Utilities for various modules
 * Generates SEO-friendly URLs and meta data
 */

import { db } from '@/lib/db';

/**
 * Converts text to SEO-friendly URL slug
 * @param title - The title to convert
 * @returns SEO-friendly slug
 */
export function generateSeoLink(title: string): string {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .replace(/[çğıöşüÇĞIÖŞÜ]/g, (char) => {
      const map: { [key: string]: string } = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'I': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
      };
      return map[char] || char;
    })
    .replace(/[^\w\s-]/g, '')     // Remove special chars except letters, numbers, spaces, and dashes
    .replace(/\s+/g, '-')          // Replace spaces with dashes
    .replace(/-+/g, '-')           // Replace multiple dashes with single
    .trim()
    .replace(/^-|-$/g, '');        // Remove leading/trailing dashes
}

/**
 * Validates SEO link format
 * @param link - The SEO link to validate
 * @returns true if valid, false otherwise
 */
export function validateSeoLink(link: string): boolean {
  if (!link) return false;
  
  const pattern = /^[a-z0-9-]+$/;
  return pattern.test(link) && 
         link.length >= 3 && 
         link.length <= 100 &&
         !link.startsWith('-') &&
         !link.endsWith('-');
}

/**
 * Generates SEO title for a saha
 * @param sahaName - Name of the saha
 * @returns SEO-optimized title
 */
export function generateSeoTitle(sahaName: string): string {
  return `${sahaName} | Hafriyat Rehabilitasyon Projesi | KentKonut`;
}

/**
 * Generates SEO description for a saha
 * @param saha - Saha object with details
 * @returns SEO-optimized description
 */
export function generateSeoDescription(saha: any): string {
  const statusText = saha.durum === 'DEVAM_EDIYOR' ? 'devam eden' : 'tamamlanmış';
  const progressText = saha.ilerlemeyuzdesi ? `%${saha.ilerlemeyuzdesi} tamamlanmış` : '';
  
  return `${saha.konumAdi} bölgesinde ${saha.toplamTon ? `${saha.toplamTon.toLocaleString('tr-TR')} ton kapasiteli` : ''} hafriyat rehabilitasyon projesi. ${statusText} durumunda olan proje ${progressText}. Çevresel rehabilitasyon ve peyzaj düzenlemesi hakkında detaylar.`.trim();
}

/**
 * Generates SEO keywords for a saha
 * @param saha - Saha object with details
 * @returns Comma-separated keywords
 */
export function generateSeoKeywords(saha: any): string {
  const baseKeywords = ['hafriyat', 'rehabilitasyon', 'çevre', 'peyzaj', 'kentkonut'];
  const locationKeywords = saha.konumAdi ? saha.konumAdi.toLowerCase().split(' ').filter((word: string) => word.length > 2) : [];
  const nameKeywords = saha.ad ? saha.ad.toLowerCase().split(' ').filter((word: string) => word.length > 2) : [];
  
  const allKeywords = [...baseKeywords, ...locationKeywords, ...nameKeywords];
  const uniqueKeywords = [...new Set(allKeywords)];
  
  return uniqueKeywords.slice(0, 10).join(', ');
}

/**
 * Generates canonical URL for a saha
 * @param seoLink - SEO link slug
 * @returns Relative canonical URL
 */
export function generateCanonicalUrl(seoLink: string): string {
  return `/hafriyat/${seoLink}`;
}

/**
 * Generates all SEO fields from saha data
 * @param saha - Saha object
 * @returns Complete SEO object
 */
export function generateAllSeoFields(saha: any) {
  const seoLink = generateSeoLink(saha.ad);
  
  return {
    seoLink,
    seoTitle: generateSeoTitle(saha.ad),
    seoDescription: generateSeoDescription(saha),
    seoKeywords: generateSeoKeywords(saha),
    seoCanonicalUrl: generateCanonicalUrl(seoLink)
  };
}

/**
 * Validates complete SEO data
 * @param seoData - SEO data object
 * @returns Validation result with errors
 */
export function validateSeoData(seoData: any) {
  const errors: string[] = [];
  
  if (!validateSeoLink(seoData.seoLink)) {
    errors.push('SEO linki geçersiz format (sadece küçük harf, rakam ve tire kullanın)');
  }
  
  if (seoData.seoTitle && seoData.seoTitle.length > 60) {
    errors.push('SEO başlığı 60 karakterden uzun olamaz');
  }
  
  if (seoData.seoDescription && seoData.seoDescription.length > 160) {
    errors.push('SEO açıklaması 160 karakterden uzun olamaz');
  }
  
  if (seoData.seoKeywords && seoData.seoKeywords.length > 500) {
    errors.push('SEO anahtar kelimeleri 500 karakterden uzun olamaz');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Department-specific slug generation utilities
 */

/**
 * Generates a URL-friendly slug from department name
 * @param name - Department name
 * @returns URL-friendly slug
 */
export function generateDepartmentSlug(name: string): string {
  if (!name) return '';

  return name
    .toLowerCase()
    .replace(/[çğıöşüÇĞIÖŞÜ]/g, (char) => {
      const map: { [key: string]: string } = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
        'Ç': 'c', 'Ğ': 'g', 'I': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
      };
      return map[char] || char;
    })
    .replace(/[^\w\s-]/g, '')     // Remove special chars except letters, numbers, spaces, and dashes
    .replace(/\s+/g, '-')          // Replace spaces with dashes
    .replace(/-+/g, '-')           // Replace multiple dashes with single
    .trim()
    .replace(/^-|-$/g, '');        // Remove leading/trailing dashes
}

/**
 * Generates a unique slug for a department
 * @param name - Department name
 * @param excludeId - Department ID to exclude from uniqueness check (for updates)
 * @returns Promise<string> - Unique slug
 */
export async function generateUniqueDepartmentSlug(name: string, excludeId?: string): Promise<string> {
  let baseSlug = generateDepartmentSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.department.findFirst({
      where: {
        slug: slug,
        ...(excludeId && { id: { not: excludeId } })
      }
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Validates department slug format
 * @param slug - The slug to validate
 * @returns true if valid, false otherwise
 */
export function validateDepartmentSlug(slug: string): boolean {
  if (!slug) return false;

  const pattern = /^[a-z0-9-]+$/;
  return pattern.test(slug) &&
         slug.length >= 2 &&
         slug.length <= 100 &&
         !slug.startsWith('-') &&
         !slug.endsWith('-');
}
