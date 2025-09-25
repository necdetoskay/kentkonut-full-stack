-- Banner grup pozisyon bilgilerini kontrol et
SELECT 
  bg.id as banner_group_id,
  bg.name as banner_group_name,
  bp.id as position_id,
  bp."positionUUID",
  bp.name as position_name,
  bp.description as position_description,
  bp."isActive" as position_active,
  bp."bannerGroupId"
FROM banner_groups bg
LEFT JOIN banner_positions bp ON bg.id = bp."bannerGroupId"
WHERE bg.name LIKE '%Hero%' OR bg.name LIKE '%Ana Sayfa%'
ORDER BY bg.id;
