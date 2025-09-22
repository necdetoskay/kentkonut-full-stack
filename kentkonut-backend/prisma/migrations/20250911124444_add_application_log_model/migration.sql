-- CreateEnum
CREATE TYPE "HighlightSourceType" AS ENUM ('PRESIDENT', 'GENERAL_MANAGER', 'DEPARTMENTS', 'MISSION', 'VISION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "HighlightImageMode" AS ENUM ('AUTO', 'CUSTOM');

-- CreateEnum
CREATE TYPE "BannerAnimasyonTipi" AS ENUM ('SOLUKLESTIR', 'KAYDIR', 'YAKINLESTIR', 'CEVIR', 'ZIPLA');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'PDF', 'WORD', 'EMBED');

-- CreateEnum
CREATE TYPE "PersonnelType" AS ENUM ('DIRECTOR', 'CHIEF');

-- CreateEnum
CREATE TYPE "GalleryItemType" AS ENUM ('IMAGE', 'DOCUMENT', 'PDF', 'WORD');

-- CreateEnum
CREATE TYPE "CorporateContentType" AS ENUM ('VISION', 'MISSION', 'STRATEGY', 'GOALS', 'ABOUT');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ONGOING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "hafriyat_saha_durum" AS ENUM ('DEVAM_EDIYOR', 'TAMAMLANDI');

-- CreateTable
CREATE TABLE "application_logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "context" TEXT,
    "details" JSONB,

    CONSTRAINT "application_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("provider","provider_account_id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("session_token")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "media_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "alt" TEXT,
    "caption" TEXT,
    "categoryId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "uploadedBy" TEXT,
    "url" TEXT,
    "embedUrl" TEXT,
    "type" "MediaType" NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeletable" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "imageUrl" TEXT,
    "metaKeywords" TEXT[],
    "hasQuickAccess" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_seo_metrics" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "bounceRate" DOUBLE PRECISION,
    "avgTimeOnPage" INTEGER,
    "googleRanking" INTEGER,
    "organicTraffic" INTEGER NOT NULL DEFAULT 0,
    "clickThroughRate" DOUBLE PRECISION,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "page_seo_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executives" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "biography" TEXT,
    "content" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "linkedIn" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT,
    "pageId" TEXT,
    "quickAccessUrl" TEXT,
    "hasQuickAccessLinks" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "executives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executive_quick_links" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT DEFAULT 'link',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "executiveId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "executive_quick_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "services" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "directorId" TEXT,
    "slug" TEXT,
    "hasQuickAccess" BOOLEAN NOT NULL DEFAULT false,
    "managerId" TEXT,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "phone" TEXT,
    "email" TEXT,
    "imageUrl" TEXT,
    "slug" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "type" "PersonnelType" NOT NULL DEFAULT 'CHIEF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnel_gallery" (
    "id" TEXT NOT NULL,
    "personnelId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "type" "GalleryItemType" NOT NULL DEFAULT 'IMAGE',
    "order" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personnel_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_quick_links" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT DEFAULT 'link',
    "departmentId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_quick_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporate_content" (
    "id" TEXT NOT NULL,
    "type" "CorporateContentType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "mediaId" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "readingTime" INTEGER NOT NULL DEFAULT 3,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "categoryId" INTEGER NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "hasQuickAccess" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_gallery_items" (
    "id" SERIAL NOT NULL,
    "newsId" INTEGER NOT NULL,
    "mediaId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_tags" (
    "newsId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "news_tags_pkey" PRIMARY KEY ("newsId","tagId")
);

-- CreateTable
CREATE TABLE "news_relations" (
    "id" SERIAL NOT NULL,
    "newsId" INTEGER NOT NULL,
    "relatedNewsId" INTEGER NOT NULL,

    CONSTRAINT "news_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "newsId" INTEGER,
    "projectId" INTEGER,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ONGOING',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "locationName" TEXT,
    "province" TEXT,
    "district" TEXT,
    "address" TEXT,
    "mediaId" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "readingTime" INTEGER NOT NULL DEFAULT 3,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hasQuickAccess" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_gallery_items" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "mediaId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_tags" (
    "projectId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "project_tags_pkey" PRIMARY KEY ("projectId","tagId")
);

-- CreateTable
CREATE TABLE "project_relations" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "relatedProjectId" INTEGER NOT NULL,

    CONSTRAINT "project_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hafriyat_bolgeler" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "yetkiliKisi" TEXT NOT NULL,
    "yetkiliTelefon" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellemeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hafriyat_bolgeler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hafriyat_sahalar" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "konumAdi" TEXT NOT NULL,
    "enlem" DOUBLE PRECISION NOT NULL,
    "boylam" DOUBLE PRECISION NOT NULL,
    "anaResimUrl" TEXT,
    "durum" "hafriyat_saha_durum" NOT NULL DEFAULT 'DEVAM_EDIYOR',
    "ilerlemeyuzdesi" INTEGER NOT NULL DEFAULT 0,
    "tonBasiUcret" DECIMAL(65,30) NOT NULL,
    "kdvOrani" INTEGER NOT NULL DEFAULT 20,
    "bolgeId" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellemeTarihi" TIMESTAMP(3) NOT NULL,
    "aciklama" TEXT,
    "baslangicTarihi" TIMESTAMP(3),
    "tahminibitisTarihi" TIMESTAMP(3),
    "tamamlananTon" DECIMAL(65,30),
    "toplamTon" DECIMAL(65,30),
    "seoCanonicalUrl" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "seoLink" TEXT,
    "seoTitle" TEXT,

    CONSTRAINT "hafriyat_sahalar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hafriyat_belge_kategorileri" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "ikon" TEXT NOT NULL DEFAULT 'document',
    "sira" INTEGER NOT NULL DEFAULT 0,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellemeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hafriyat_belge_kategorileri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hafriyat_belgeler" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "dosyaAdi" TEXT NOT NULL,
    "orjinalAd" TEXT NOT NULL,
    "dosyaTipi" TEXT NOT NULL,
    "boyut" INTEGER NOT NULL,
    "dosyaYolu" TEXT NOT NULL,
    "sahaId" TEXT NOT NULL,
    "kategoriId" INTEGER NOT NULL,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellemeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hafriyat_belgeler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hafriyat_resimler" (
    "id" TEXT NOT NULL,
    "baslik" TEXT,
    "dosyaAdi" TEXT NOT NULL,
    "orjinalAd" TEXT,
    "dosyaYolu" TEXT NOT NULL,
    "altMetin" TEXT,
    "aciklama" TEXT,
    "sahaId" TEXT NOT NULL,
    "sira" INTEGER NOT NULL DEFAULT 0,
    "olusturulmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncellemeTarihi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hafriyat_resimler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banner_positions" (
    "id" SERIAL NOT NULL,
    "positionUUID" VARCHAR(36) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "bannerGroupId" INTEGER,
    "fallbackGroupId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banner_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banner_groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "deletable" BOOLEAN NOT NULL DEFAULT true,
    "transitionDuration" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "width" INTEGER NOT NULL DEFAULT 1200,
    "height" INTEGER NOT NULL DEFAULT 400,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "displayDuration" INTEGER NOT NULL DEFAULT 5000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mobileHeight" INTEGER NOT NULL DEFAULT 200,
    "mobileWidth" INTEGER NOT NULL DEFAULT 400,
    "tabletHeight" INTEGER NOT NULL DEFAULT 300,
    "tabletWidth" INTEGER NOT NULL DEFAULT 800,
    "animationType" "BannerAnimasyonTipi" NOT NULL DEFAULT 'SOLUKLESTIR',
    "usageType" TEXT,

    CONSTRAINT "banner_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletable" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "bannerGroupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "avgEngagementTime" INTEGER NOT NULL DEFAULT 0,
    "bounceCount" INTEGER NOT NULL DEFAULT 0,
    "conversionCount" INTEGER NOT NULL DEFAULT 0,
    "endDate" TIMESTAMP(3),
    "impressionCount" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "uniqueViewCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banner_statistics" (
    "id" SERIAL NOT NULL,
    "bannerId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banner_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT,
    "url" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "target" TEXT NOT NULL DEFAULT '_self',
    "cssClass" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "menuLocation" TEXT NOT NULL DEFAULT 'main',
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_permissions" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "permission" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quick_access_links" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT DEFAULT 'link',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "moduleType" TEXT NOT NULL,
    "pageId" TEXT,
    "newsId" INTEGER,
    "projectId" INTEGER,
    "departmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quick_access_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_cards" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "slug" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "targetUrl" TEXT,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT NOT NULL DEFAULT '#4F772D',
    "backgroundColor" TEXT,
    "textColor" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorporateLayoutSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'string',
    "category" TEXT NOT NULL DEFAULT 'layout',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorporateLayoutSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "highlights" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sourceType" "HighlightSourceType" NOT NULL,
    "sourceRefId" TEXT,
    "titleOverride" TEXT,
    "subtitleOverride" TEXT,
    "imageMode" "HighlightImageMode" NOT NULL DEFAULT 'AUTO',
    "imageUrl" TEXT,
    "routeOverride" TEXT,
    "redirectUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hizli_erisim_sayfalar" (
    "id" TEXT NOT NULL,
    "sayfaUrl" TEXT NOT NULL,
    "baslik" TEXT NOT NULL DEFAULT 'HIZLI ERİŞİM',
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hizli_erisim_sayfalar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hizli_erisim_ogeleri" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "hedefUrl" TEXT NOT NULL,
    "sira" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastClickedAt" TIMESTAMP(3),
    "sayfaId" TEXT NOT NULL,

    CONSTRAINT "hizli_erisim_ogeleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sayfa_arka_planlar" (
    "id" SERIAL NOT NULL,
    "sayfaUrl" TEXT NOT NULL,
    "resimUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sayfa_arka_planlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DepartmentChiefs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "page_categories_slug_key" ON "page_categories"("slug");

-- CreateIndex
CREATE INDEX "page_seo_metrics_pageId_date_idx" ON "page_seo_metrics"("pageId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "executives_slug_key" ON "executives"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "departments_directorId_key" ON "departments"("directorId");

-- CreateIndex
CREATE UNIQUE INDEX "departments_slug_key" ON "departments"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_slug_key" ON "personnel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "corporate_content_type_key" ON "corporate_content"("type");

-- CreateIndex
CREATE UNIQUE INDEX "news_categories_slug_key" ON "news_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "news_slug_key" ON "news"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "news_gallery_items_newsId_mediaId_key" ON "news_gallery_items"("newsId", "mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "news_relations_newsId_relatedNewsId_key" ON "news_relations"("newsId", "relatedNewsId");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "project_gallery_items_projectId_mediaId_key" ON "project_gallery_items"("projectId", "mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "project_relations_projectId_relatedProjectId_key" ON "project_relations"("projectId", "relatedProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "hafriyat_bolgeler_ad_key" ON "hafriyat_bolgeler"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "hafriyat_sahalar_ad_bolgeId_key" ON "hafriyat_sahalar"("ad", "bolgeId");

-- CreateIndex
CREATE UNIQUE INDEX "hafriyat_belge_kategorileri_ad_key" ON "hafriyat_belge_kategorileri"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "banner_positions_positionUUID_key" ON "banner_positions"("positionUUID");

-- CreateIndex
CREATE INDEX "banner_positions_positionUUID_idx" ON "banner_positions"("positionUUID");

-- CreateIndex
CREATE INDEX "banner_positions_isActive_idx" ON "banner_positions"("isActive");

-- CreateIndex
CREATE INDEX "banner_groups_isActive_idx" ON "banner_groups"("isActive");

-- CreateIndex
CREATE INDEX "banner_groups_usageType_idx" ON "banner_groups"("usageType");

-- CreateIndex
CREATE INDEX "banner_groups_createdAt_idx" ON "banner_groups"("createdAt");

-- CreateIndex
CREATE INDEX "banners_bannerGroupId_idx" ON "banners"("bannerGroupId");

-- CreateIndex
CREATE INDEX "banners_isActive_idx" ON "banners"("isActive");

-- CreateIndex
CREATE INDEX "banners_order_idx" ON "banners"("order");

-- CreateIndex
CREATE INDEX "banners_createdAt_idx" ON "banners"("createdAt");

-- CreateIndex
CREATE INDEX "banners_startDate_idx" ON "banners"("startDate");

-- CreateIndex
CREATE INDEX "banners_endDate_idx" ON "banners"("endDate");

-- CreateIndex
CREATE INDEX "banner_statistics_bannerId_idx" ON "banner_statistics"("bannerId");

-- CreateIndex
CREATE INDEX "banner_statistics_type_idx" ON "banner_statistics"("type");

-- CreateIndex
CREATE INDEX "banner_statistics_createdAt_idx" ON "banner_statistics"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "menu_items_slug_key" ON "menu_items"("slug");

-- CreateIndex
CREATE INDEX "menu_items_menuLocation_idx" ON "menu_items"("menuLocation");

-- CreateIndex
CREATE INDEX "menu_items_orderIndex_idx" ON "menu_items"("orderIndex");

-- CreateIndex
CREATE INDEX "menu_items_parentId_idx" ON "menu_items"("parentId");

-- CreateIndex
CREATE INDEX "menu_items_isActive_idx" ON "menu_items"("isActive");

-- CreateIndex
CREATE INDEX "menu_permissions_menuItemId_idx" ON "menu_permissions"("menuItemId");

-- CreateIndex
CREATE INDEX "menu_permissions_role_idx" ON "menu_permissions"("role");

-- CreateIndex
CREATE INDEX "quick_access_links_moduleType_idx" ON "quick_access_links"("moduleType");

-- CreateIndex
CREATE INDEX "quick_access_links_pageId_idx" ON "quick_access_links"("pageId");

-- CreateIndex
CREATE INDEX "quick_access_links_newsId_idx" ON "quick_access_links"("newsId");

-- CreateIndex
CREATE INDEX "quick_access_links_projectId_idx" ON "quick_access_links"("projectId");

-- CreateIndex
CREATE INDEX "quick_access_links_departmentId_idx" ON "quick_access_links"("departmentId");

-- CreateIndex
CREATE INDEX "quick_access_links_sortOrder_idx" ON "quick_access_links"("sortOrder");

-- CreateIndex
CREATE INDEX "quick_access_links_isActive_idx" ON "quick_access_links"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "service_cards_slug_key" ON "service_cards"("slug");

-- CreateIndex
CREATE INDEX "service_cards_isActive_idx" ON "service_cards"("isActive");

-- CreateIndex
CREATE INDEX "service_cards_displayOrder_idx" ON "service_cards"("displayOrder");

-- CreateIndex
CREATE INDEX "service_cards_isFeatured_idx" ON "service_cards"("isFeatured");

-- CreateIndex
CREATE INDEX "service_cards_slug_idx" ON "service_cards"("slug");

-- CreateIndex
CREATE INDEX "service_cards_createdAt_idx" ON "service_cards"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CorporateLayoutSettings_key_key" ON "CorporateLayoutSettings"("key");

-- CreateIndex
CREATE INDEX "CorporateLayoutSettings_key_idx" ON "CorporateLayoutSettings"("key");

-- CreateIndex
CREATE INDEX "CorporateLayoutSettings_category_idx" ON "CorporateLayoutSettings"("category");

-- CreateIndex
CREATE INDEX "highlights_order_idx" ON "highlights"("order");

-- CreateIndex
CREATE INDEX "highlights_isActive_idx" ON "highlights"("isActive");

-- CreateIndex
CREATE INDEX "highlights_sourceType_idx" ON "highlights"("sourceType");

-- CreateIndex
CREATE UNIQUE INDEX "hizli_erisim_sayfalar_sayfaUrl_key" ON "hizli_erisim_sayfalar"("sayfaUrl");

-- CreateIndex
CREATE UNIQUE INDEX "sayfa_arka_planlar_sayfaUrl_key" ON "sayfa_arka_planlar"("sayfaUrl");

-- CreateIndex
CREATE UNIQUE INDEX "_DepartmentChiefs_AB_unique" ON "_DepartmentChiefs"("A", "B");

-- CreateIndex
CREATE INDEX "_DepartmentChiefs_B_index" ON "_DepartmentChiefs"("B");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "media_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "page_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_seo_metrics" ADD CONSTRAINT "page_seo_metrics_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executives" ADD CONSTRAINT "executives_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "executive_quick_links" ADD CONSTRAINT "executive_quick_links_executiveId_fkey" FOREIGN KEY ("executiveId") REFERENCES "executives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "executives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_gallery" ADD CONSTRAINT "personnel_gallery_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_gallery" ADD CONSTRAINT "personnel_gallery_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_quick_links" ADD CONSTRAINT "department_quick_links_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "news_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news" ADD CONSTRAINT "news_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_gallery_items" ADD CONSTRAINT "news_gallery_items_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_gallery_items" ADD CONSTRAINT "news_gallery_items_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_tags" ADD CONSTRAINT "news_tags_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_tags" ADD CONSTRAINT "news_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_relations" ADD CONSTRAINT "news_relations_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_relations" ADD CONSTRAINT "news_relations_relatedNewsId_fkey" FOREIGN KEY ("relatedNewsId") REFERENCES "news"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_gallery_items" ADD CONSTRAINT "project_gallery_items_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_gallery_items" ADD CONSTRAINT "project_gallery_items_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_relations" ADD CONSTRAINT "project_relations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_relations" ADD CONSTRAINT "project_relations_relatedProjectId_fkey" FOREIGN KEY ("relatedProjectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hafriyat_sahalar" ADD CONSTRAINT "hafriyat_sahalar_bolgeId_fkey" FOREIGN KEY ("bolgeId") REFERENCES "hafriyat_bolgeler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hafriyat_belgeler" ADD CONSTRAINT "hafriyat_belgeler_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "hafriyat_belge_kategorileri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hafriyat_belgeler" ADD CONSTRAINT "hafriyat_belgeler_sahaId_fkey" FOREIGN KEY ("sahaId") REFERENCES "hafriyat_sahalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hafriyat_resimler" ADD CONSTRAINT "hafriyat_resimler_sahaId_fkey" FOREIGN KEY ("sahaId") REFERENCES "hafriyat_sahalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banner_positions" ADD CONSTRAINT "banner_positions_bannerGroupId_fkey" FOREIGN KEY ("bannerGroupId") REFERENCES "banner_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banner_positions" ADD CONSTRAINT "banner_positions_fallbackGroupId_fkey" FOREIGN KEY ("fallbackGroupId") REFERENCES "banner_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_bannerGroupId_fkey" FOREIGN KEY ("bannerGroupId") REFERENCES "banner_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "banner_statistics" ADD CONSTRAINT "banner_statistics_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_permissions" ADD CONSTRAINT "menu_permissions_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quick_access_links" ADD CONSTRAINT "quick_access_links_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quick_access_links" ADD CONSTRAINT "quick_access_links_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quick_access_links" ADD CONSTRAINT "quick_access_links_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quick_access_links" ADD CONSTRAINT "quick_access_links_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hizli_erisim_ogeleri" ADD CONSTRAINT "hizli_erisim_ogeleri_sayfaId_fkey" FOREIGN KEY ("sayfaId") REFERENCES "hizli_erisim_sayfalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepartmentChiefs" ADD CONSTRAINT "_DepartmentChiefs_A_fkey" FOREIGN KEY ("A") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DepartmentChiefs" ADD CONSTRAINT "_DepartmentChiefs_B_fkey" FOREIGN KEY ("B") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
