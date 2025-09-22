
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Basit slugify (Türkçe karakter desteği ile)
function slugify(input: string): string {
  const map: Record<string, string> = {
    'Ç': 'C', 'ç': 'c',
    'Ğ': 'G', 'ğ': 'g',
    'İ': 'I', 'I': 'I', 'ı': 'i',
    'Ö': 'O', 'ö': 'o',
    'Ş': 'S', 'ş': 's',
    'Ü': 'U', 'ü': 'u',
    'Â': 'A', 'â': 'a', 'Ê': 'E', 'ê': 'e', 'Î': 'I', 'î': 'i', 'Ô': 'O', 'ô': 'o', 'Û': 'U', 'û': 'u'
  };
  return input
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// /api/public/executives/slug/[slug]
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  console.log('[PUBLIC_API] Fetching executive with slug:', slug);

  if (!slug) {
    console.log('[PUBLIC_API] Slug parameter is missing');
    return new NextResponse(JSON.stringify({ success: false, message: 'Slug parametresi eksik' }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  try {
    // 1) Doğrudan slug alanına göre arama
    const executiveBySlug = await db.executive.findFirst({
      where: { 
        slug: {
          equals: slug,
          mode: 'insensitive' // Büyük/küçük harf duyarsız arama
        }
      },
    });

    if (executiveBySlug) {
      console.log('[PUBLIC_API] Executive found by slug field');
      return NextResponse.json(executiveBySlug);
    }

    // 2) Backfill: Veritabanında slug alanı boş olanlar isimden üretilen slug ile eşleştirilsin
    console.log('[PUBLIC_API] Executive not found by slug. Trying name-based matching...');
    const allExecutives = await db.executive.findMany({});

    const normalizedSlug = slug.toLowerCase();
    const match = allExecutives.find((e) => e.name && slugify(e.name) === normalizedSlug);

    if (match) {
      console.log('[PUBLIC_API] Executive matched by name-based slug:', match.id);

      // Slug alanı boş ise tek seferlik geriye dönük doldurma
      if (!match.slug || match.slug.trim() === '') {
        const newSlug = slugify(match.name);
        try {
          await db.executive.update({ where: { id: match.id }, data: { slug: newSlug } });
          console.log('[PUBLIC_API] Backfilled slug for executive:', match.id, '->', newSlug);
          // Güncel kaydı tekrar çekip döndürelim
          const updated = await db.executive.findUnique({ where: { id: match.id } });
          if (updated) return NextResponse.json(updated);
        } catch (e) {
          console.warn('[PUBLIC_API] Backfill slug update failed (may already exist unique):', e);
        }
      }

      return NextResponse.json(match);
    }

    console.log('[PUBLIC_API] Executive not found');
    return new NextResponse(JSON.stringify({ success: false, message: 'Yönetici bulunamadı' }), { 
      status: 404, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error(`[PUBLIC_API] Error fetching executive with slug ${slug}:`, error);
    return new NextResponse(JSON.stringify({ success: false, message: 'Internal Server Error' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}
