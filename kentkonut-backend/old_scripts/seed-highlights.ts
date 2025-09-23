import { db } from '@/lib/db';

async function main() {
  const items = [
    { title: 'Öne Çıkan 1', order: 1 },
    { title: 'Öne Çıkan 2', order: 2 },
    { title: 'Öne Çıkan 3', order: 3 },
    { title: 'Öne Çıkan 4', order: 4 },
    { title: 'Öne Çıkan 5', order: 5 },
  ];

  for (const it of items) {
    // Try to find an existing record with same titleOverride or order
    const existing = await db.highlight.findFirst({
      where: {
        OR: [
          { titleOverride: it.title },
          { order: it.order },
        ],
      },
    }).catch(() => null);

    const data: any = {
      sourceType: 'CUSTOM',
      titleOverride: it.title,
      subtitleOverride: null,
      imageUrl: null,
      redirectUrl: null,
      order: it.order,
      isActive: true,
    };

    if (existing) {
      await db.highlight.update({ where: { id: existing.id }, data });
      console.log(`🔁 Updated highlight: ${it.title}`);
    } else {
      await db.highlight.create({ data });
      console.log(`✅ Created highlight: ${it.title}`);
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed highlights failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
