-- Proje tablosundaki konut ve ticari ünite verilerini kontrol et
SELECT 
  id,
  title,
  status,
  konutSayisi,
  ticariUnite,
  toplamBolum
FROM projects 
WHERE status IN ('ONGOING', 'COMPLETED')
ORDER BY status, id;
