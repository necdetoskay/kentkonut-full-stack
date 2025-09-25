-- Banner pozisyonlarını kontrol etmek için SQL sorguları
-- Bu sorguları PostgreSQL veritabanında çalıştırın

-- 1. Tüm banner pozisyonlarını listele
SELECT 
  id,
  positionUUID,
  name,
  description,
  isActive,
  bannerGroupId,
  fallbackGroupId,
  priority
FROM banner_positions 
ORDER BY id;

-- 2. Hero banner pozisyonunu kontrol et
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

-- 3. Banner gruplarını kontrol et
SELECT 
  id,
  name,
  description,
  isActive,
  usageType
FROM banner_groups 
WHERE isActive = true
ORDER BY id;

-- 4. Hero banner grubuna ait bannerları kontrol et
SELECT 
  b.id,
  b.title,
  b.description,
  b.imageUrl,
  b.isActive,
  b.order,
  bg.name as group_name,
  bg.id as group_id
FROM banners b
JOIN banner_groups bg ON b.bannerGroupId = bg.id
WHERE bg.isActive = true
ORDER BY bg.id, b.order;

-- 5. Eğer hero banner pozisyonu yoksa oluştur
INSERT INTO banner_positions (positionUUID, name, description, bannerGroupId, isActive, priority)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Ana Sayfa Üst Banner',
  'Ana sayfa hero banner pozisyonu',
  (SELECT id FROM banner_groups WHERE name LIKE '%Hero%' OR name LIKE '%Ana Sayfa%' LIMIT 1),
  true,
  1
)
ON CONFLICT (positionUUID) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  bannerGroupId = EXCLUDED.bannerGroupId,
  isActive = EXCLUDED.isActive,
  priority = EXCLUDED.priority;
