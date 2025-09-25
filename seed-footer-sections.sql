-- Footer bölümleri ve öğeleri seed verileri
INSERT INTO footer_sections (
  id,
  key,
  title,
  type,
  orientation,
  "order",
  isActive,
  createdAt,
  updatedAt
) VALUES 
('footer_links', 'links', null, 'LINKS', 'VERTICAL', 1, true, NOW(), NOW()),
('footer_contact', 'contact', null, 'CONTACT', 'VERTICAL', 2, true, NOW(), NOW()),
('footer_legal', 'legal', null, 'LEGAL', 'VERTICAL', 3, true, NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
  "order" = EXCLUDED."order",
  updatedAt = NOW();

-- Footer öğeleri
INSERT INTO footer_items (
  id,
  "sectionId",
  "order",
  type,
  label,
  url,
  target,
  isExternal,
  icon,
  createdAt,
  updatedAt
) VALUES 
-- Linkler bölümü
('footer_link_1', 'footer_links', 1, 'LINK', 'Ana Sayfa', '/', '_self', false, null, NOW(), NOW()),
('footer_link_2', 'footer_links', 2, 'LINK', 'Hakkımızda', '/hakkimizda', '_self', false, null, NOW(), NOW()),
('footer_link_3', 'footer_links', 3, 'LINK', 'Projelerimiz', '/projeler', '_self', false, null, NOW(), NOW()),
('footer_link_4', 'footer_links', 4, 'LINK', 'Kurumsal', '/kurumsal', '_self', false, null, NOW(), NOW()),
('footer_link_5', 'footer_links', 5, 'LINK', 'Haberler', '/haberler', '_self', false, null, NOW(), NOW()),
('footer_link_6', 'footer_links', 6, 'LINK', 'İletişim', '/bize-ulasin', '_self', false, null, NOW(), NOW()),

-- İletişim bölümü
('footer_contact_1', 'footer_contact', 1, 'ADDRESS', null, null, null, false, 'fas fa-map-marker-alt', NOW(), NOW()),
('footer_contact_2', 'footer_contact', 2, 'PHONE', '0262 331 07 03', 'tel:02623310703', '_self', false, 'fas fa-phone', NOW(), NOW()),
('footer_contact_3', 'footer_contact', 3, 'EMAIL', 'info@kentkonut.com.tr', 'mailto:info@kentkonut.com.tr', '_self', false, 'fas fa-envelope', NOW(), NOW()),

-- Yasal bölümü
('footer_legal_1', 'footer_legal', 1, 'LINK', 'Gizlilik Politikası', '/gizlilik-politikasi', '_self', false, null, NOW(), NOW()),
('footer_legal_2', 'footer_legal', 2, 'LINK', 'Kullanım Şartları', '/kullanim-sartlari', '_self', false, null, NOW(), NOW()),
('footer_legal_3', 'footer_legal', 3, 'LINK', 'Çerez Politikası', '/cerez-politikasi', '_self', false, null, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  "order" = EXCLUDED."order",
  updatedAt = NOW();

-- İletişim bilgileri için text öğesi ekle
INSERT INTO footer_items (
  id,
  "sectionId",
  "order",
  type,
  text,
  createdAt,
  updatedAt
) VALUES 
('footer_address_text', 'footer_contact', 1, 'TEXT', 'Atatürk Mahallesi, İnönü Caddesi No: 123/A, 41000 İzmit/Kocaeli', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  text = EXCLUDED.text,
  updatedAt = NOW();

-- Sonucu kontrol et
SELECT 
  fs.key,
  fs.title,
  fs.type,
  COUNT(fi.id) as item_count
FROM footer_sections fs
LEFT JOIN footer_items fi ON fs.id = fi."sectionId"
GROUP BY fs.id, fs.key, fs.title, fs.type
ORDER BY fs."order";
