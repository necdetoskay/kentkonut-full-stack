# Hafriyat SEO Link Implementation Plan

## Overview

Add SEO-friendly link fields for each hafriyat site to improve search engine optimization and create user-friendly URLs.

## Requirements Analysis

### Current Structure
```
/dashboard/hafriyat/sahalar/[id]  → Internal admin URLs
```

### Proposed Public SEO Structure
```
/hafriyat/projeler/[seo-link]     → Public SEO-friendly URLs
/hafriyat/[seo-link]              → Alternative shorter format
```

## Database Schema Changes

### Add SEO Fields to Saha Model

```sql
-- Add new columns to saha table
ALTER TABLE saha ADD COLUMN seo_link VARCHAR(255) UNIQUE;
ALTER TABLE saha ADD COLUMN seo_title VARCHAR(255);
ALTER TABLE saha ADD COLUMN seo_description TEXT;
ALTER TABLE saha ADD COLUMN seo_keywords VARCHAR(500);
ALTER TABLE saha ADD COLUMN seo_canonical_url VARCHAR(255);
```

### Prisma Schema Update

```prisma
model Saha {
  id                    String   @id @default(cuid())
  ad                    String
  konumAdi              String
  durum                 SahaDurum
  // ...existing fields...
  
  // SEO Fields
  seoLink               String?  @unique @map("seo_link")
  seoTitle              String?  @map("seo_title")
  seoDescription        String?  @map("seo_description") 
  seoKeywords           String?  @map("seo_keywords")
  seoCanonicalUrl       String?  @map("seo_canonical_url")
  
  @@map("saha")
}
```

## Implementation Plan

### Phase 1: Backend Changes
1. **Database Migration**
   - Add SEO fields to saha table
   - Update Prisma schema
   - Create migration script

2. **API Endpoints**
   - Update saha CRUD operations to include SEO fields
   - Add SEO link validation (unique, URL-safe)
   - Add SEO link generation utility

3. **SEO Utilities**
   - URL slug generation from saha name
   - SEO link validation
   - Duplicate checking

### Phase 2: Admin Interface Updates
1. **Form Fields**
   - Add SEO tab to saha edit/new forms
   - Real-time URL preview
   - SEO link auto-generation from title
   - SEO validation feedback

2. **List View**
   - Show SEO status in saha list
   - Quick SEO link copy functionality

### Phase 3: Public Frontend
1. **Public Routes**
   - Create public saha detail pages
   - SEO-optimized meta tags
   - Structured data (JSON-LD)

2. **URL Handling**
   - SEO-friendly URL routing
   - 301 redirects from old URLs
   - Canonical URL implementation

## Form Design

### SEO Tab in Saha Forms

```tsx
// SEO Card in Edit/New Forms
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Search className="h-5 w-5" />
      SEO Optimizasyonu
    </CardTitle>
    <CardDescription>
      Arama motoru optimizasyonu için site bilgileri
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* SEO Link */}
    <div className="space-y-2">
      <Label htmlFor="seoLink">SEO Linki</Label>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">
          /hafriyat/
        </span>
        <Input
          id="seoLink"
          value={formData.seoLink}
          onChange={handleSeoLinkChange}
          placeholder="korrez-tasocagi-rehabilitasyon"
          pattern="[a-z0-9-]+"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Sadece küçük harf, rakam ve tire (-) kullanın
      </p>
      {/* Live Preview */}
      <div className="p-2 bg-muted rounded text-sm">
        <strong>Önizleme:</strong> https://kentkonut.com/hafriyat/{formData.seoLink || 'ornek-proje'}
      </div>
    </div>

    {/* SEO Title */}
    <div className="space-y-2">
      <Label htmlFor="seoTitle">SEO Başlığı (60 karakter)</Label>
      <Input
        id="seoTitle"
        value={formData.seoTitle}
        onChange={(e) => handleInputChange('seoTitle', e.target.value)}
        placeholder="Körfez Taşocağı Rehabilitasyon Projesi | KentKonut"
        maxLength={60}
      />
      <div className="text-xs text-muted-foreground">
        {formData.seoTitle?.length || 0}/60 karakter
      </div>
    </div>

    {/* SEO Description */}
    <div className="space-y-2">
      <Label htmlFor="seoDescription">SEO Açıklaması (160 karakter)</Label>
      <Textarea
        id="seoDescription"
        value={formData.seoDescription}
        onChange={(e) => handleInputChange('seoDescription', e.target.value)}
        placeholder="Körfez ilçesinde bulunan eski taş ocağının çevresel rehabilitasyonu ve peyzaj düzenlemesi projesi hakkında detaylar."
        maxLength={160}
        rows={3}
      />
      <div className="text-xs text-muted-foreground">
        {formData.seoDescription?.length || 0}/160 karakter
      </div>
    </div>

    {/* SEO Keywords */}
    <div className="space-y-2">
      <Label htmlFor="seoKeywords">Anahtar Kelimeler</Label>
      <Input
        id="seoKeywords"
        value={formData.seoKeywords}
        onChange={(e) => handleInputChange('seoKeywords', e.target.value)}
        placeholder="hafriyat, rehabilitasyon, çevre, taş ocağı, körfez"
      />
      <p className="text-xs text-muted-foreground">
        Kelimeleri virgül ile ayırın
      </p>
    </div>

    {/* Auto-generate Button */}
    <Button 
      type="button" 
      variant="outline" 
      onClick={generateSeoFromTitle}
      className="w-full"
    >
      <Wand2 className="w-4 h-4 mr-2" />
      SEO Bilgilerini Otomatik Oluştur
    </Button>
  </CardContent>
</Card>
```

## SEO Utilities

### URL Slug Generation

```typescript
// lib/seo-utils.ts
export function generateSeoLink(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')      // Replace spaces with dashes
    .replace(/-+/g, '-')       // Replace multiple dashes with single
    .trim()
    .replace(/^-|-$/g, '');    // Remove leading/trailing dashes
}

export function validateSeoLink(link: string): boolean {
  const pattern = /^[a-z0-9-]+$/;
  return pattern.test(link) && link.length >= 3 && link.length <= 100;
}

export function generateSeoTitle(sahaName: string): string {
  return `${sahaName} | Hafriyat Rehabilitasyon Projesi | KentKonut`;
}

export function generateSeoDescription(saha: any): string {
  return `${saha.konumAdi} bölgesinde ${saha.toplamTon} ton kapasiteli hafriyat rehabilitasyon projesi. ${saha.durum} durumunda olan proje hakkında detaylar.`;
}
```

## Implementation Files

### 1. Database Migration
- `prisma/migrations/add_seo_fields_to_saha.sql`

### 2. Updated Mock Data
- Add SEO fields to `mockSahalar` data

### 3. Form Updates
- `app/dashboard/hafriyat/sahalar/[id]/duzenle/page.tsx`
- `app/dashboard/hafriyat/sahalar/yeni/page.tsx`

### 4. API Updates
- Update saha CRUD endpoints

### 5. Public Pages (Future)
- `app/hafriyat/[seoLink]/page.tsx`
- SEO meta tags implementation

## Benefits

1. **SEO Optimization**
   - Better search engine rankings
   - User-friendly URLs
   - Improved click-through rates

2. **Branding**
   - Professional URL structure
   - Consistent SEO patterns
   - Better social media sharing

3. **User Experience**
   - Memorable URLs
   - Descriptive page titles
   - Better navigation

## Next Steps

1. ✅ Plan SEO fields and structure
2. ✅ **Update mock data with SEO fields**
3. ✅ **Add SEO card to edit/new forms**
4. ✅ **Implement SEO utilities**
5. ✅ **Add form validation**
6. ✅ **Test SEO link generation**
7. ✅ **Add SEO display to detail view**
8. 🔄 Create public page structure (future)

---

**Status**: 🎉 **IMPLEMENTED** - SEO fields successfully added to hafriyat module

## Implementation Complete

### ✅ Completed Features:

1. **SEO Utilities (`lib/seo-utils.ts`)**
   - URL slug generation with Turkish character support
   - SEO validation functions
   - Auto-generation of titles, descriptions, and keywords
   - Canonical URL generation

2. **SEO Card Component (`components/ui/seo-card.tsx`)**
   - Real-time URL preview
   - Character count validation
   - Auto-generation functionality
   - Copy to clipboard features
   - Live validation feedback

3. **Updated Mock Data**
   - All saha records now include SEO fields
   - Consistent SEO patterns across all entries
   - Example data for testing

4. **Form Integration**
   - Edit form: `/dashboard/hafriyat/sahalar/[id]/duzenle`
   - New form: `/dashboard/hafriyat/sahalar/yeni`
   - Real-time validation and preview

5. **Detail View Enhancement**
   - SEO information card in detail view
   - Copy functionality for URLs
   - Visual keyword display
   - Character count indicators

### 🔧 Technical Implementation:

**Files Modified:**
- `lib/seo-utils.ts` - SEO utility functions
- `components/ui/seo-card.tsx` - Reusable SEO form component
- `app/dashboard/hafriyat/sahalar/page.tsx` - Updated mock data
- `app/dashboard/hafriyat/sahalar/[id]/duzenle/page.tsx` - Edit form with SEO
- `app/dashboard/hafriyat/sahalar/yeni/page.tsx` - New form with SEO
- `app/dashboard/hafriyat/sahalar/[id]/page.tsx` - Detail view with SEO info

**Features Added:**
- Turkish character normalization for URLs
- Real-time URL preview
- Auto-generation from project data
- Form validation with helpful messages
- Copy-to-clipboard functionality
- SEO tips and guidelines
