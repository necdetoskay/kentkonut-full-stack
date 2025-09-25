-- Mevcut banner pozisyonlarını kontrol et
SELECT 
  bp.id,
  bp."positionUUID",
  bp.name,
  bp.description,
  bp."bannerGroupId",
  bg.name as banner_group_name
FROM banner_positions bp
LEFT JOIN banner_groups bg ON bp."bannerGroupId" = bg.id
ORDER BY bp.id;
