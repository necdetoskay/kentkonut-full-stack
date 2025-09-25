-- Mevcut banner grup kaydını kontrol etmek için SQL scripti
-- Bu sorguları PostgreSQL veritabanında çalıştırın

-- 1. Tüm banner gruplarını listele
SELECT 
  id,
  name,
  description,
  "isActive",
  "usageType",
  "deletable"
FROM banner_groups 
ORDER BY id;

-- 2. Hero veya Ana Sayfa içeren banner gruplarını kontrol et
SELECT 
  id,
  name,
  description,
  "isActive",
  "usageType",
  "deletable"
FROM banner_groups 
WHERE name LIKE '%Hero%' OR name LIKE '%Ana Sayfa%' OR name LIKE '%hero%' OR name LIKE '%ana%'
ORDER BY id;

-- 3. Aktif banner gruplarını kontrol et
SELECT 
  id,
  name,
  description,
  "isActive",
  "usageType",
  "deletable"
FROM banner_groups 
WHERE "isActive" = true
ORDER BY id;

-- 4. Banner gruplarının banner sayılarını kontrol et
SELECT 
  bg.id,
  bg.name,
  bg."isActive",
  COUNT(b.id) as banner_count
FROM banner_groups bg
LEFT JOIN banners b ON bg.id = b."bannerGroupId"
GROUP BY bg.id, bg.name, bg."isActive"
ORDER BY bg.id;

-- 5. Eğer hiç banner grubu yoksa, yeni bir tane oluştur
INSERT INTO banner_groups (name, description, "isActive", "deletable", width, height, "mobileWidth", "mobileHeight", "tabletWidth", "tabletHeight", "displayDuration", "transitionDuration", "animationType")
VALUES (
  'Ana Sayfa Hero Banner',
  'Ana sayfa hero banner grubu - SİLİNEMEZ',
  true,
  false,
  1200,
  400,
  400,
  200,
  800,
  300,
  5000,
  0.5,
  'SOLUKLESTIR'
)
ON CONFLICT DO NOTHING;

-- 6. Sonucu kontrol et
SELECT 
  id,
  name,
  description,
  "isActive",
  "usageType",
  "deletable"
FROM banner_groups 
WHERE name LIKE '%Hero%' OR name LIKE '%Ana Sayfa%'
ORDER BY id;
