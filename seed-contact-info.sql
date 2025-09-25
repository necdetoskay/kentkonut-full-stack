-- İletişim bilgileri seed verileri
INSERT INTO contact_info (
  id,
  title,
  address,
  latitude,
  longitude,
  "mapUrl",
  "phonePrimary",
  "phoneSecondary",
  email,
  "workingHours",
  "socialLinks",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'contact_main_office',
  'Ana Ofis',
  'Atatürk Mahallesi, İnönü Caddesi No: 123/A, 41000 İzmit/Kocaeli',
  40.7654,
  29.9167,
  'https://maps.google.com/?q=40.7654,29.9167',
  '0262 331 07 03',
  '0262 331 07 04',
  'info@kentkonut.com.tr',
  'Pazartesi - Cuma: 08:00 - 18:00, Cumartesi: 09:00 - 15:00',
  '{"facebook": "https://facebook.com/kentkonut", "instagram": "https://instagram.com/kentkonut", "youtube": "https://youtube.com/kentkonut"}',
  true,
  NOW(),
  NOW()
),
(
  'contact_ankara_branch',
  'Ankara Şubesi',
  'Çankaya Mahallesi, Atatürk Bulvarı No: 456/B, 06420 Çankaya/Ankara',
  39.9208,
  32.8541,
  'https://maps.google.com/?q=39.9208,32.8541',
  '0312 555 01 23',
  '0312 555 01 24',
  'ankara@kentkonut.com.tr',
  'Pazartesi - Cuma: 08:00 - 18:00',
  '{"facebook": "https://facebook.com/kentkonutankara", "instagram": "https://instagram.com/kentkonutankara"}',
  true,
  NOW(),
  NOW()
),
(
  'contact_izmir_branch',
  'İzmir Şubesi',
  'Konak Mahallesi, Cumhuriyet Caddesi No: 789/C, 35250 Konak/İzmir',
  38.4192,
  27.1287,
  'https://maps.google.com/?q=38.4192,27.1287',
  '0232 444 05 67',
  '0232 444 05 68',
  'izmir@kentkonut.com.tr',
  'Pazartesi - Cuma: 08:00 - 18:00',
  '{"facebook": "https://facebook.com/kentkonutizmir", "instagram": "https://instagram.com/kentkonutizmir"}',
  true,
  NOW(),
  NOW()
);

-- Sonucu kontrol et
SELECT 
  id,
  title,
  address,
  "phonePrimary",
  email,
  "isActive"
FROM contact_info 
ORDER BY "createdAt";
