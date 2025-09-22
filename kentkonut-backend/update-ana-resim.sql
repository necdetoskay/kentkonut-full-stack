-- Hafriyat sahalarına ana resim URL'leri ekleme
-- Test amaçlı örnek resim URL'leri kullanılıyor

UPDATE "hafriyat_sahalar" 
SET "anaResimUrl" = 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE "ad" LIKE '%KÖRFEZ%' OR "ad" LIKE '%Körfez%';

UPDATE "hafriyat_sahalar" 
SET "anaResimUrl" = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE "ad" LIKE '%SEPETÇİLER%' OR "ad" LIKE '%Sepetçiler%';

UPDATE "hafriyat_sahalar" 
SET "anaResimUrl" = 'https://images.unsplash.com/photo-1574263867128-a3d5c1b1deaa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE "ad" LIKE '%KETENCİLER%' OR "ad" LIKE '%Ketenciler%';

UPDATE "hafriyat_sahalar" 
SET "anaResimUrl" = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE "ad" LIKE '%BALÇIK%' OR "ad" LIKE '%Balçık%';

UPDATE "hafriyat_sahalar" 
SET "anaResimUrl" = 'https://images.unsplash.com/photo-1572883454114-1cf0031ede2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE "ad" LIKE '%TAVŞANLI%' OR "ad" LIKE '%Tavşanlı%';

-- Diğer sahalar için genel bir resim
UPDATE "hafriyat_sahalar" 
SET "anaResimUrl" = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
WHERE "anaResimUrl" IS NULL;

-- Kontrol sorgusu
SELECT "id", "ad", "anaResimUrl" FROM "hafriyat_sahalar" ORDER BY "ad";