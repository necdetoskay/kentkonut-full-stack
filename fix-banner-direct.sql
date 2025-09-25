-- Direkt banner pozisyonu oluştur
INSERT INTO banner_positions ("positionUUID", name, description, "bannerGroupId", "isActive", priority, "createdAt", "updatedAt")
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Ana Sayfa Üst Banner',
  'Ana sayfa hero banner pozisyonu',
  (SELECT id FROM banner_groups WHERE name LIKE '%Hero%' OR name LIKE '%Ana Sayfa%' LIMIT 1),
  true,
  1,
  NOW(),
  NOW()
)
ON CONFLICT ("positionUUID") DO UPDATE SET
  name = 'Ana Sayfa Üst Banner',
  description = 'Ana sayfa hero banner pozisyonu',
  "bannerGroupId" = (SELECT id FROM banner_groups WHERE name LIKE '%Hero%' OR name LIKE '%Ana Sayfa%' LIMIT 1),
  "isActive" = true,
  priority = 1,
  "updatedAt" = NOW();
