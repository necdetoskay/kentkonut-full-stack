-- Proje tablosundaki sütun adlarını kontrol et
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name IN ('konut_sayisi', 'ticari_unite', 'toplam_bolum')
ORDER BY column_name;
