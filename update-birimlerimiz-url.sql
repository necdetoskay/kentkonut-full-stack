-- Highlights tablosundaki "Birimlerimiz" item'ının URL'sini güncelle
UPDATE highlights 
SET "redirectUrl" = 'http://localhost:3020/kurumsal/birimler'
WHERE "titleOverride" = 'Birimlerimiz' OR "titleOverride" LIKE '%Birim%';

-- Sonucu kontrol et
SELECT 
  id,
  "titleOverride",
  "subtitleOverride",
  "routeOverride",
  "redirectUrl",
  "isActive"
FROM highlights 
WHERE "titleOverride" LIKE '%Birim%' OR "redirectUrl" LIKE '%birim%';
