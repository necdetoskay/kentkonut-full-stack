-- Hero banner grubunu Ana Sayfa Üst Banner pozisyonuna bağla
-- Önce mevcut yanlış pozisyonu sil
DELETE FROM banner_positions WHERE "bannerGroupId" = 1;

-- Doğru pozisyonu oluştur
INSERT INTO banner_positions (
  "positionUUID", 
  name, 
  description, 
  "bannerGroupId", 
  "isActive", 
  priority, 
  "createdAt", 
  "updatedAt"
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Ana Sayfa Üst Banner',
  'Ana sayfa hero banner pozisyonu',
  1,
  true,
  1,
  NOW(),
  NOW()
);

-- Sonucu kontrol et
SELECT 
  bg.id as banner_group_id,
  bg.name as banner_group_name,
  bp.id as position_id,
  bp."positionUUID",
  bp.name as position_name,
  bp.description as position_description
FROM banner_groups bg
LEFT JOIN banner_positions bp ON bg.id = bp."bannerGroupId"
WHERE bg.id = 1;
