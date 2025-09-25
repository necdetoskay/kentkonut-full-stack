-- "Birimlerimiz" highlight'ı oluştur veya güncelle
INSERT INTO highlights (
  "titleOverride",
  "subtitleOverride", 
  "imageUrl",
  "imageMode",
  "routeOverride",
  "redirectUrl",
  "isActive",
  "order",
  "createdAt",
  "updatedAt"
) VALUES (
  'Birimlerimiz',
  'Kurumsal Birimlerimiz',
  '/images/birimlerimiz.jpg',
  'COVER',
  null,
  'http://localhost:3020/kurumsal/birimler',
  true,
  1,
  NOW(),
  NOW()
)
ON CONFLICT ("titleOverride") DO UPDATE SET
  "redirectUrl" = 'http://localhost:3020/kurumsal/birimler',
  "updatedAt" = NOW();

-- Sonucu kontrol et
SELECT 
  id,
  "titleOverride",
  "subtitleOverride",
  "redirectUrl",
  "isActive"
FROM highlights 
WHERE "titleOverride" = 'Birimlerimiz';
