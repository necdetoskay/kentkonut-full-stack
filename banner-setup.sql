-- Banner pozisyonlarını kontrol etmek için SQL sorguları
-- Bu sorguları PostgreSQL veritabanında çalıştırın

-- 1. Banner pozisyonlarını kontrol et
SELECT 
  id,
  positionUUID,
  name,
  description,
  isActive,
  bannerGroupId,
  fallbackGroupId
FROM banner_positions 
WHERE positionUUID = '550e8400-e29b-41d4-a716-446655440001';

-- 2. Banner gruplarını kontrol et
SELECT 
  id,
  name,
  description,
  isActive,
  usageType
FROM banner_groups 
WHERE isActive = true;

-- 3. Hero banner grubuna ait bannerları kontrol et
SELECT 
  b.id,
  b.title,
  b.description,
  b.imageUrl,
  b.isActive,
  b.order,
  bg.name as group_name
FROM banners b
JOIN banner_groups bg ON b.bannerGroupId = bg.id
WHERE bg.isActive = true
ORDER BY b.order;

-- 4. Hero banner pozisyonu için banner grubu oluştur (eğer yoksa)
INSERT INTO banner_groups (name, description, isActive, usageType, width, height, displayDuration, transitionDuration, animationType)
VALUES ('Hero Banner Group', 'Ana sayfa hero banner grubu', true, 'HERO', 1200, 400, 5000, 0.5, 'SOLUKLESTIR')
ON CONFLICT DO NOTHING;

-- 5. Hero banner pozisyonu oluştur (eğer yoksa)
INSERT INTO banner_positions (positionUUID, name, description, bannerGroupId, isActive, priority)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Hero Banner Position',
  'Ana sayfa hero banner pozisyonu',
  (SELECT id FROM banner_groups WHERE name = 'Hero Banner Group' LIMIT 1),
  true,
  1
)
ON CONFLICT (positionUUID) DO NOTHING;

-- 6. Test banner'ı oluştur (eğer yoksa)
INSERT INTO banners (title, description, imageUrl, isActive, order, bannerGroupId)
VALUES (
  'Test Hero Banner',
  'Test hero banner açıklaması',
  '/images/hero-banner-test.jpg',
  true,
  1,
  (SELECT id FROM banner_groups WHERE name = 'Hero Banner Group' LIMIT 1)
)
ON CONFLICT DO NOTHING;
