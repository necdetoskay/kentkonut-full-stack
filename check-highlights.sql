-- Mevcut highlights'ları kontrol et
SELECT 
  id,
  "titleOverride",
  "subtitleOverride",
  "routeOverride",
  "redirectUrl",
  "isActive",
  "order"
FROM highlights 
ORDER BY "order";
