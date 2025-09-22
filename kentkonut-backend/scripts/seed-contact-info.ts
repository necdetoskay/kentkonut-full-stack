import { db } from '@/lib/db';

async function main() {
  // If there is already an active record, just ensure at least one exists and update its basic fields
  const existing = await db.contactInfo.findFirst({ where: { isActive: true } }).catch(() => null);

  const data = {
    title: 'KENT KONUT A.Ş.',
    address: 'Körfez Mah. Hafız Binbaşı Cad. No:3 İzmit / Kocaeli',
    latitude: 40.7667,
    longitude: 29.9167,
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d...', // İsterseniz panelden güncelleyebilirsiniz
    phonePrimary: '0262 331 0703',
    phoneSecondary: null,
    email: 'halklailiskiler@kentkonut.com.tr',
    workingHours: '09:30 - 18:00',
    socialLinks: {
      facebook: 'https://facebook.com/kentkonut',
      instagram: 'https://instagram.com/kentkonut',
      twitter: 'https://x.com/kentkonut'
    } as any,
    isActive: true,
  } as const;

  if (existing) {
    await db.contactInfo.update({ where: { id: existing.id }, data });
    console.log('🔁 Updated existing active ContactInfo');
  } else {
    await db.contactInfo.create({ data });
    console.log('✅ Created new ContactInfo');
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed contact-info failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
