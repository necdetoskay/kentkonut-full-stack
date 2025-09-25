-- Banner grup pozisyonunu düzelt
-- Hero banner grubunun pozisyonunu Ana Sayfa Üst Banner olarak güncelle

UPDATE banner_positions 
SET 
  "positionUUID" = '550e8400-e29b-41d4-a716-446655440001',
  name = 'Ana Sayfa Üst Banner',
  description = 'Ana sayfa hero banner pozisyonu',
  "updatedAt" = NOW()
WHERE "bannerGroupId" = 1;

-- Sonucu kontrol et
SELECT 
  bg.id as banner_group_id,
  bg.name as banner_group_name,
  bp.id as position_id,
  bp."positionUUID",
  bp.name as position_name,
  bp.description as position_description,
  bp."isActive" as position_active
FROM banner_groups bg
LEFT JOIN banner_positions bp ON bg.id = bp."bannerGroupId"
WHERE bg.id = 1;
