import { db } from '@/lib/db';

const categories = ['REQUEST', 'SUGGESTION', 'COMPLAINT'] as const;
const statuses = ['NEW', 'IN_REVIEW', 'RESOLVED', 'CLOSED'] as const;

function pick<T>(arr: readonly T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

const firstNames = ['Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Can', 'Elif', 'Mert', 'Zeynep', 'Ali', 'Cem'];
const lastNames  = ['Yılmaz', 'Demir', 'Şahin', 'Kaya', 'Yıldız', 'Çelik', 'Arslan', 'Koç', 'Aydın', 'Öztürk'];

const sampleMessages = [
  'Site ile ilgili bir önerim var: üst menüye hızlı erişim eklense çok iyi olur.',
  'Projeler sayfasında filtreleme hızı düşük, iyileştirilebilir mi?',
  'Bize Ulaşın sayfasında harita bazen görünmüyor, kontrol eder misiniz?',
  'Yeni projeler hakkında e-posta ile bilgilendirme almak istiyorum.',
  'Arama fonksiyonu bazı kelimelerde sonuç döndürmüyor, incelenmeli.',
  'Şikayet: Görseller bazı sayfalarda geç yükleniyor.',
  'Öneri: Haberler için etiket bulutu eklenebilir.',
  'Şikayet: Mobil cihazda menü bazen kapanmıyor.',
  'Talep: Proje detaylarında PDF dokümanları da görmek isterim.',
  'Öneri: İletişim sayfasına ofis fotoğrafları ekleyin.',
];

async function main() {
  const rows: any[] = [];
  for (let i = 0; i < 20; i++) {
    const firstName = pick(firstNames);
    const lastName  = pick(lastNames);
    const phone = `0 5${randInt(0,5)}${randInt(0,9)} ${randInt(100,999)} ${randInt(10,99)} ${randInt(10,99)}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randInt(1,99)}@example.com`;
    const address = `Mahalle ${randInt(1, 50)}, Sokak ${randInt(1, 100)}, No:${randInt(1, 50)} Kocaeli`;

    rows.push({
      category: pick(categories),
      firstName,
      lastName,
      nationalId: null,
      email,
      phone,
      address,
      message: pick(sampleMessages),
      ipAddress: `192.168.1.${randInt(2, 254)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
      status: pick(statuses),
      createdAt: new Date(Date.now() - randInt(0, 14) * 24 * 60 * 60 * 1000), // son 2 hafta
    });
  }

  let created = 0;
  for (const r of rows) {
    await db.feedback.create({ data: r });
    created++;
  }

  console.log(`✅ Seeded ${created} feedback rows.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed feedback failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
