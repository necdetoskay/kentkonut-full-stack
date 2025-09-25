-- Migration: Add basic info fields to projects table
-- Date: 2025-01-27
-- Description: Add konut_sayisi, ticari_unite, toplam_bolum fields to projects table

-- Add new columns to projects table
ALTER TABLE "projects" 
ADD COLUMN "konut_sayisi" INTEGER,
ADD COLUMN "ticari_unite" INTEGER,
ADD COLUMN "toplam_bolum" INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN "projects"."konut_sayisi" IS 'Konut Sayısı - Projedeki toplam konut sayısı';
COMMENT ON COLUMN "projects"."ticari_unite" IS 'Ticari Ünite - Projedeki ticari ünite sayısı';
COMMENT ON COLUMN "projects"."toplam_bolum" IS 'Toplam Bölüm - Projedeki toplam bölüm sayısı';
