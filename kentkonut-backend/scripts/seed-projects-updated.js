/*
  Seed projects with meaningful content adapted to current schema structure.
  - Uses existing Media entries or creates new ones
  - Idempotent by slug (won't duplicate)
  - Compatible with current Project model

  Run:
    node scripts/seed-projects-updated.js
*/

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function readingTimeFromHtml(html) {
  const text = html.replace(/<[^>]*>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

async function ensureAuthor() {
  let author = await prisma.user.findFirst();
  if (!author) {
    author = await prisma.user.create({
      data: {
        id: 'project-seed-user',
        name: 'Proje Yöneticisi',
        email: 'proje@kentkonut.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "password"
        role: 'admin',
      }
    });
  }
  return author;
}

async function ensureMedia(url, idx) {
  const existing = await prisma.media.findFirst({ where: { url } });
  if (existing) return existing;
  return prisma.media.create({
    data: {
      filename: `project-${idx}.jpg`,
      originalName: `Project ${idx}`,
      url,
      path: url,
      type: 'IMAGE',
      size: 150000,
      mimeType: 'image/jpeg',
    }
  });
}

const completedSeeds = [
  { title: 'Kentpark Yaşam Evleri', city: 'Kocaeli', district: 'İzmit', lat: 40.77, lng: 29.94 },
  { title: 'Göl Panorama Konakları', city: 'Kocaeli', district: 'Başiskele', lat: 40.72, lng: 29.92 },
  { title: 'Çınarlı Vadi Evleri', city: 'Kocaeli', district: 'Kartepe', lat: 40.74, lng: 30.03 },
  { title: 'Marmara Işık Sitesi', city: 'Kocaeli', district: 'Derince', lat: 40.77, lng: 29.82 },
  { title: 'Sahil Rezidans', city: 'Kocaeli', district: 'Karamürsel', lat: 40.69, lng: 29.62 },
  { title: 'Ormanyaka Villaları', city: 'Kocaeli', district: 'Gölcük', lat: 40.71, lng: 29.82 },
  { title: 'Modern Kent Evleri', city: 'Kocaeli', district: 'Gebze', lat: 40.80, lng: 29.44 },
  { title: 'Şehir Meydanı Konutları', city: 'Kocaeli', district: 'Çayırova', lat: 40.83, lng: 29.37 },
  { title: 'Koruluk Park Evleri', city: 'Kocaeli', district: 'Darıca', lat: 40.77, lng: 29.37 },
  { title: 'Panorama Tepe Konutları', city: 'Kocaeli', district: 'Dilovası', lat: 40.78, lng: 29.54 },
];

const ongoingSeeds = [
  { title: 'Kent Nova Projesi', city: 'Kocaeli', district: 'İzmit', lat: 40.77, lng: 29.95, progress: 35 },
  { title: 'Körfez Marina Evleri', city: 'Kocaeli', district: 'Körfez', lat: 40.77, lng: 29.78, progress: 50 },
  { title: 'Parkyaşam Vadisi', city: 'Kocaeli', district: 'Başiskele', lat: 40.71, lng: 29.90, progress: 60 },
  { title: 'Mavi Kent Rezidans', city: 'Kocaeli', district: 'Gebze', lat: 40.80, lng: 29.44, progress: 45 },
  { title: 'Güneşli Tepe Yaşam', city: 'Kocaeli', district: 'Kartepe', lat: 40.74, lng: 30.02, progress: 25 },
];

function projectHtml(name) {
  return `<div class="project-content">
    <p>${name}, modern mimari ve sürdürülebilir malzemeler ile inşa edilen bir konut projesidir.</p>
    <ul>
      <li>Enerji verimli sistemler</li>
      <li>Kapalı otopark ve güvenlik</li>
      <li>Peyzajlı ortak alanlar</li>
      <li>Çocuk oyun alanları ve sosyal tesis</li>
    </ul>
  </div>`;
}

async function main() {
  console.log('🌱 Starting project seed...');
  
  const author = await ensureAuthor();
  console.log('👤 Author ensured:', author.name);

  // Prepare placeholder images (via.placeholder.com)
  const imagePool = [
    'https://via.placeholder.com/1200x800/0ea5e9/ffffff?text=Kent+Konut+Proje',
    'https://via.placeholder.com/1200x800/14b8a6/ffffff?text=Ye%C5%9Fil+Alan',
    'https://via.placeholder.com/1200x800/f59e0b/ffffff?text=Modern+Mimari',
    'https://via.placeholder.com/1200x800/ef4444/ffffff?text=Rezidans',
    'https://via.placeholder.com/1200x800/6366f1/ffffff?text=Panorama',
  ];

  // Seed 10 completed projects
  console.log('🏗️ Seeding completed projects...');
  for (let i = 0; i < completedSeeds.length; i++) {
    const p = completedSeeds[i];
    const slug = slugify(p.title);
    const exists = await prisma.project.findUnique({ where: { slug } });
    if (exists) {
      console.log('⏭️ Skipped (exists):', p.title);
      continue;
    }

    try {
      const media = await ensureMedia(imagePool[i % imagePool.length], i + 1);
      const html = projectHtml(p.title);

      await prisma.project.create({
        data: {
          title: p.title,
          slug,
          summary: `${p.city} ${p.district}'te tamamlanan modern konut projesi`,
          content: html,
          status: 'COMPLETED',
          province: p.city,
          district: p.district,
          address: `${p.district} Merkez`,
          locationName: `${p.district} Merkez`,
          latitude: p.lat,
          longitude: p.lng,
          mediaId: media.id,
          authorId: author.id,
          published: true,
          publishedAt: new Date(),
          readingTime: readingTimeFromHtml(html),
          viewCount: Math.floor(Math.random() * 500) + 150,
          hasQuickAccess: i < 2,
          blokDaireSayisi: `${Math.floor(Math.random() * 200) + 50} daire`,
          yil: '2024',
        }
      });
      console.log('✅ Completed:', p.title);
    } catch (e) {
      console.warn('⚠️ Skipped completed due to error:', p.title, '-', e?.code || e?.message || e);
    }
  }

  // Seed 5 in-progress projects
  console.log('🚧 Seeding ongoing projects...');
  for (let i = 0; i < ongoingSeeds.length; i++) {
    const p = ongoingSeeds[i];
    const slug = slugify(p.title);
    const exists = await prisma.project.findUnique({ where: { slug } });
    if (exists) {
      console.log('⏭️ Skipped (exists):', p.title);
      continue;
    }

    try {
      const media = await ensureMedia(imagePool[(i + 2) % imagePool.length], 20 + i);
      const html = projectHtml(p.title);

      await prisma.project.create({
        data: {
          title: p.title,
          slug,
          summary: `${p.city} ${p.district}'te devam eden proje (%${p.progress} tamamlandı)`,
          content: html,
          status: 'ONGOING',
          province: p.city,
          district: p.district,
          address: `${p.district} Merkez`,
          locationName: `${p.district} Merkez`,
          latitude: p.lat,
          longitude: p.lng,
          mediaId: media.id,
          authorId: author.id,
          published: true,
          publishedAt: new Date(),
          readingTime: readingTimeFromHtml(html),
          viewCount: Math.floor(Math.random() * 300) + 50,
          hasQuickAccess: false,
          blokDaireSayisi: `${Math.floor(Math.random() * 150) + 30} daire`,
          yil: '2025',
        }
      });
      console.log('✅ In-Progress:', p.title);
    } catch (e) {
      console.warn('⚠️ Skipped in-progress due to error:', p.title, '-', e?.code || e?.message || e);
    }
  }

  console.log('🎉 Project seeding completed!');
}

main()
  .then(async () => {
    console.log('🎉 Seeded projects successfully.');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed projects failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
