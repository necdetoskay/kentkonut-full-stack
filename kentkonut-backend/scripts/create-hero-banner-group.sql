-- HERO Banner Grubu oluşturma scripti
-- Bu grup silinememeli ve frontend Hero bileşeni buna göre tasarlanmalı

-- Mevcut HERO grubunu sil (varsa)
DELETE FROM banners WHERE "groupId" IN (SELECT id FROM banner_groups WHERE type = 'HERO');
DELETE FROM banner_groups WHERE type = 'HERO';

-- HERO Banner Grubu oluştur
INSERT INTO banner_groups (
    name, 
    description, 
    type, 
    active, 
    deletable, 
    "playMode", 
    duration, 
    "transitionDuration", 
    animation, 
    width, 
    height, 
    "createdAt", 
    "updatedAt"
) VALUES (
    'Ana Sayfa Hero Banner', 
    'Ana sayfa Hero kısmı için özel banner grubu - SİLİNEMEZ', 
    'HERO', 
    true, 
    false, 
    'AUTO', 
    5000, 
    1, 
    'FADE', 
    1200, 
    400, 
    NOW(), 
    NOW()
);

-- HERO Banner'larını ekle
INSERT INTO banners (
    title, 
    description, 
    subtitle,
    "imageUrl", 
    "linkUrl", 
    "ctaLink",
    active, 
    "order", 
    "groupId", 
    "createdAt", 
    "updatedAt"
) VALUES 
(
    'Kent Konut İnşaat - Yeni Projeler', 
    'Modern yaşam alanları ile geleceği inşa ediyoruz', 
    'Hayalinizdeki ev burada!',
    'https://via.placeholder.com/1200x400/0277bd/ffffff?text=Kent+Konut+Yeni+Projeler', 
    '/projeler', 
    'Projeleri İncele',
    true, 
    1, 
    (SELECT id FROM banner_groups WHERE type = 'HERO' LIMIT 1), 
    NOW(), 
    NOW()
),
(
    'Kentsel Dönüşüm Hizmetleri', 
    'Şehrin yenilenmesinde güvenilir ortağınız', 
    'Uzman kadromuzla yanınızdayız',
    'https://via.placeholder.com/1200x400/2e7d32/ffffff?text=Kentsel+Dönüşüm', 
    '/hizmetler', 
    'Hizmetlerimizi Keşfet',
    true, 
    2, 
    (SELECT id FROM banner_groups WHERE type = 'HERO' LIMIT 1), 
    NOW(), 
    NOW()
),
(
    'Kaliteli Yaşam Alanları', 
    'Her detayı özenle tasarlanmış konut projeleri', 
    'Size özel çözümler',
    'https://via.placeholder.com/1200x400/ff6f00/ffffff?text=Kaliteli+Yaşam+Alanları', 
    '/hakkimizda', 
    'Hakkımızda',
    true, 
    3, 
    (SELECT id FROM banner_groups WHERE type = 'HERO' LIMIT 1), 
    NOW(), 
    NOW()
);

-- Sonuçları kontrol et
SELECT 
    bg.name as "Banner Grubu", 
    bg.type as "Tip",
    bg.deletable as "Silinebilir",
    b.title as "Banner Başlığı", 
    b.active as "Aktif",
    b."order" as "Sıra"
FROM banner_groups bg 
LEFT JOIN banners b ON bg.id = b."groupId" 
WHERE bg.type = 'HERO'
ORDER BY b."order";
