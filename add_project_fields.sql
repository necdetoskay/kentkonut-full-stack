-- Proje tablosuna yeni alanları eklemek için SQL komutları
-- Bu komutları PostgreSQL veritabanında çalıştırın

-- 1. Konut Sayısı alanını ekle
ALTER TABLE "projects" 
ADD COLUMN "konut_sayisi" INTEGER;

-- 2. Ticari Ünite alanını ekle  
ALTER TABLE "projects" 
ADD COLUMN "ticari_unite" INTEGER;

-- 3. Toplam Bölüm alanını ekle
ALTER TABLE "projects" 
ADD COLUMN "toplam_bolum" INTEGER;

-- 4. Alanlara açıklama ekle (opsiyonel)
COMMENT ON COLUMN "projects"."konut_sayisi" IS 'Projedeki toplam konut sayısı';
COMMENT ON COLUMN "projects"."ticari_unite" IS 'Projedeki ticari ünite sayısı';
COMMENT ON COLUMN "projects"."toplam_bolum" IS 'Projedeki toplam bölüm sayısı';

-- 5. Değişiklikleri kontrol et
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN ('konut_sayisi', 'ticari_unite', 'toplam_bolum');
