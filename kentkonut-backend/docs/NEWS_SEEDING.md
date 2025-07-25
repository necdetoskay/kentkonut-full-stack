# News Module Database Seeding

## Overview

This document describes the news module database seeding functionality that adds sample news articles, categories, and related data to the kentkonut-backend application.

## Features

### ✅ **Data Preservation**
- **No Data Loss**: Preserves all existing data (banners, pages, users, departments, etc.)
- **Duplicate Prevention**: Checks for existing records before creating new ones
- **Safe Execution**: Can be run multiple times without creating duplicates

### ✅ **Realistic Turkish Content**
- **Municipal Focus**: Content appropriate for a municipal/government website
- **Professional Writing**: Well-structured articles with proper HTML formatting
- **SEO Optimized**: Proper slugs, meta descriptions, and reading time calculations
- **Categorized Content**: Articles organized into relevant categories

### ✅ **Complete Relationships**
- **News Categories**: 5 predefined categories with proper hierarchy
- **Tags System**: Automatic tag creation and linking
- **Author Assignment**: Links to existing or newly created users
- **Media References**: Placeholder for future media integration

## Seeded Data

### News Categories (5 categories)

1. **Kentsel Dönüşüm** (`kentsel-donusum`)
   - Urban transformation projects and developments

2. **Proje Duyuruları** (`proje-duyurulari`)
   - New project announcements and descriptions

3. **Kurumsal Haberler** (`kurumsal-haberler`)
   - Corporate news and institutional announcements

4. **Etkinlikler** (`etkinlikler`)
   - Events and organized activities

5. **Basın Açıklamaları** (`basin-aciklamalari`)
   - Official press releases and announcements

### News Articles (10 articles)

1. **Yeni Kentsel Dönüşüm Projesi Başlatıldı**
   - Category: Kentsel Dönüşüm
   - Tags: kentsel dönüşüm, yenileme, modern yaşam

2. **Kent Park Evleri Projesi Ön Satışa Çıktı**
   - Category: Proje Duyuruları
   - Tags: kent park evleri, ön satış, villa, daire

3. **Sürdürülebilir Kentleşme Konferansı Düzenlendi**
   - Category: Etkinlikler
   - Tags: sürdürülebilirlik, konferans, çevre, teknoloji

4. **Yeni Sosyal Tesis Alanları Hizmete Açıldı**
   - Category: Kurumsal Haberler
   - Tags: sosyal tesis, spor, kültür, hizmet

5. **Akıllı Şehir Teknolojileri Pilot Projesi**
   - Category: Proje Duyuruları
   - Tags: akıllı şehir, teknoloji, pilot proje, IoT

6. **Çevre Dostu Yapı Malzemeleri Semineri**
   - Category: Etkinlikler
   - Tags: çevre dostu, yapı malzemeleri, seminer, sürdürülebilirlik

7. **Kentsel Dönüşümde Yeni Teşvik Paketi Açıklandı**
   - Category: Basın Açıklamaları
   - Tags: teşvik paketi, kentsel dönüşüm, indirim, destek

8. **Yeni Nesil Konut Projeleri Tanıtıldı**
   - Category: Proje Duyuruları
   - Tags: yeni nesil konut, akıllı ev, teknoloji, çevre dostu

9. **Kentsel Tasarım Yarışması Sonuçlandı**
   - Category: Kurumsal Haberler
   - Tags: kentsel tasarım, yarışma, mimari, şehir planlama

10. **Dijital Dönüşüm Hizmetleri Genişletildi**
    - Category: Kurumsal Haberler
    - Tags: dijital dönüşüm, online hizmet, teknoloji, vatandaş

## Usage

### Method 1: Standalone News Seeding

```bash
# Run only news seeding
npm run seed:news

# Or using npx
npx tsx scripts/seed-news.ts
```

### Method 2: Full Database Seeding

```bash
# Run complete database seeding (includes news)
npm run prisma:seed

# Or using Prisma directly
npx prisma db seed
```

### Method 3: Manual Import

```typescript
import { seedNews } from './prisma/seeds/news';

// In your custom script
await seedNews();
```

## Database Schema Requirements

The seeding script requires the following database tables to exist:

### Required Tables
- `news` - Main news articles table
- `news_categories` - News categories table
- `tags` - Tags table
- `news_tags` - News-tag relationship table
- `users` - Users table (for authors)

### Required Fields

**News Table:**
```sql
- id (auto-increment)
- title (string)
- slug (string, unique)
- summary (text, optional)
- content (text)
- categoryId (foreign key)
- authorId (foreign key)
- published (boolean)
- publishedAt (datetime, optional)
- readingTime (integer)
- shareCount (integer, default 0)
- downloadCount (integer, default 0)
- likeCount (integer, default 0)
- hasQuickAccess (boolean, default false)
- createdAt (datetime)
- updatedAt (datetime)
```

## Features and Benefits

### 🔒 **Safety Features**
- **Idempotent**: Can be run multiple times safely
- **Non-destructive**: Never deletes or modifies existing data
- **Validation**: Checks for required dependencies before creating data
- **Error Handling**: Graceful error handling with detailed logging

### 📊 **Data Quality**
- **Realistic Content**: Professional Turkish content suitable for municipal websites
- **SEO Optimized**: Proper slugs, reading times, and metadata
- **Proper Relationships**: Correctly linked categories, tags, and authors
- **Varied Data**: Different publication dates, engagement metrics, and content types

### 🚀 **Development Benefits**
- **Quick Setup**: Instant content for development and testing
- **Demo Ready**: Professional content suitable for demonstrations
- **Testing Data**: Realistic data for testing search, filtering, and pagination
- **API Testing**: Complete data set for testing news APIs

## Customization

### Adding More Articles

Edit `prisma/seeds/news.ts` and add new articles to the `newsArticles` array:

```typescript
{
  title: 'Your Article Title',
  summary: 'Brief summary of the article',
  content: `<div class="news-content">
    <p>Your article content in HTML format</p>
  </div>`,
  categorySlug: 'existing-category-slug',
  tags: ['tag1', 'tag2', 'tag3']
}
```

### Adding New Categories

Add new categories to the `newsCategories` array:

```typescript
{
  name: 'Category Name',
  slug: 'category-slug',
  description: 'Category description',
  order: 6
}
```

### Modifying Content

All content is in Turkish and follows municipal/government website standards. You can modify:
- Article titles and content
- Category names and descriptions
- Tags and metadata
- Publication dates and engagement metrics

## Troubleshooting

### Common Issues

1. **User Not Found Error**
   ```
   Solution: The script automatically creates a seed user if none exists
   ```

2. **Category Creation Failed**
   ```
   Solution: Check for unique constraint violations on category slugs
   ```

3. **Database Connection Error**
   ```
   Solution: Ensure DATABASE_URL is properly configured in .env
   ```

### Verification

After running the seed script, verify the data:

```sql
-- Check news count
SELECT COUNT(*) FROM news;

-- Check categories
SELECT * FROM news_categories;

-- Check news with categories
SELECT n.title, nc.name as category 
FROM news n 
JOIN news_categories nc ON n.categoryId = nc.id;

-- Check tags
SELECT t.name, COUNT(nt.newsId) as usage_count
FROM tags t
LEFT JOIN news_tags nt ON t.id = nt.tagId
GROUP BY t.id, t.name;
```

## Integration

The news seeding integrates seamlessly with:
- **Existing User System**: Uses existing users or creates seed user
- **Media System**: Ready for media attachment (placeholder support)
- **Tag System**: Automatic tag creation and linking
- **Quick Access System**: Some articles have quick access enabled
- **Analytics System**: Includes engagement metrics (shares, likes, downloads)

## Conclusion

The news seeding script provides a complete, production-ready dataset for the news module with:
- ✅ 10 realistic Turkish news articles
- ✅ 5 properly categorized news categories
- ✅ Automatic tag creation and linking
- ✅ SEO-optimized content with proper metadata
- ✅ Safe, idempotent execution
- ✅ Integration with existing systems

This enables immediate development, testing, and demonstration of the news functionality without manual content creation.
