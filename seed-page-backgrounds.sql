-- Sayfa arka planları seed verileri
INSERT INTO sayfa_arka_planlar (
  "sayfaUrl",
  "resimUrl",
  createdAt,
  updatedAt
) VALUES 
('/bize-ulasin', '/images/bize-ulasin-background.jpg', NOW(), NOW()),
('/iletisim', '/images/iletisim-background.jpg', NOW(), NOW()),
('/geri-bildirim', '/images/geri-bildirim-background.jpg', NOW(), NOW()),
('/kurumsal', '/images/kurumsal-background.jpg', NOW(), NOW()),
('/kurumsal/birimler', '/images/birimler-background.jpg', NOW(), NOW()),
('/projeler', '/images/projeler-background.jpg', NOW(), NOW()),
('/hakkimizda', '/images/hakkimizda-background.jpg', NOW(), NOW()),
('/haberler', '/images/haberler-background.jpg', NOW(), NOW())
ON CONFLICT ("sayfaUrl") DO UPDATE SET
  "resimUrl" = EXCLUDED."resimUrl",
  "updatedAt" = NOW();

-- Sonucu kontrol et
SELECT 
  id,
  "sayfaUrl",
  "resimUrl"
FROM sayfa_arka_planlar 
ORDER BY "sayfaUrl";
