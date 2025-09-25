-- "Bize Ulaşın" sayfası için arka plan kaydı oluştur
INSERT INTO sayfa_arka_planlar (
  "sayfaUrl",
  "resimUrl",
  "createdAt",
  "updatedAt"
) VALUES (
  '/bize-ulasin',
  '/images/bize-ulasin-background.jpg',
  NOW(),
  NOW()
)
ON CONFLICT ("sayfaUrl") DO UPDATE SET
  "resimUrl" = '/images/bize-ulasin-background.jpg',
  "updatedAt" = NOW();

-- Sonucu kontrol et
SELECT 
  id,
  "sayfaUrl",
  "resimUrl"
FROM sayfa_arka_planlar 
WHERE "sayfaUrl" = '/bize-ulasin';
