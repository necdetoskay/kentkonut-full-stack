-- Banner pozisyonu UUID eşleşmesini düzeltmek için SQL scripti
-- Bu sorguları PostgreSQL veritabanında çalıştırın

-- 1. Mevcut banner pozisyonlarını kontrol et
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

-- 3. Eğer hero banner pozisyonu yoksa oluştur
-- Önce banner grubunu bul
SELECT id, name, isActive 
FROM banner_groups 
WHERE name LIKE '%Hero%' OR name LIKE '%Ana Sayfa%' 
ORDER BY id;

-- 4. Hero banner pozisyonu oluştur (eğer yoksa)
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

-- 5. Banner pozisyonunu güncelle (eğer varsa ama yanlış grup ID'si varsa)
UPDATE banner_positions 
SET 
  name = 'Ana Sayfa Üst Banner',
  description = 'Ana sayfa hero banner pozisyonu',
  bannerGroupId = (SELECT id FROM banner_groups WHERE name LIKE '%Hero%' OR name LIKE '%Ana Sayfa%' LIMIT 1),
  isActive = true,
  priority = 1
WHERE positionUUID = '550e8400-e29b-41d4-a716-446655440001';

-- 6. Sonucu kontrol et
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
