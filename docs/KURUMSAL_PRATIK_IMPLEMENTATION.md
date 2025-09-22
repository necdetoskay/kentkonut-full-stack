# Kurumsal Sayfa - Pratik Implementation Guide

## 🚀 Hızlı Başlangıç - Adım Adım

### 1. Database Schema Oluşturma

#### Prisma Schema Güncellemesi
```prisma
// prisma/schema.prisma
model CorporateCard {
  id              String   @id @default(cuid())
  title           String   
  subtitle        String?  
  description     String?  
  imageUrl        String?  
  backgroundColor String   @default("#ffffff")
  textColor       String   @default("#000000") 
  accentColor     String   @default("#007bff")
  displayOrder    Int      @unique // SİRALAMA İÇİN KRİTİK
  isActive        Boolean  @default(true)
  targetUrl       String?  
  openInNewTab    Boolean  @default(false)
  content         Json?    
  customData      Json?    // Generic veri için
  imagePosition   String   @default("center")
  cardSize        String   @default("medium")
  borderRadius    String   @default("rounded")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String?
  
  @@map("corporate_cards")
  @@index([displayOrder])
  @@index([isActive, displayOrder])
}
```

#### Migration Çalıştırma
```bash
# Migration oluştur
npx prisma migrate dev --name add_corporate_cards_generic

# Database güncelle
npx prisma db push

# Client yeniden oluştur
npx prisma generate
```

### 2. Sıralama API Endpoint'i

#### `/app/api/admin/kurumsal/kartlar/siralama/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cardIds } = await request.json();

    if (!Array.isArray(cardIds) || cardIds.length === 0) {
      return NextResponse.json(
        { error: 'Geçersiz kart ID listesi' }, 
        { status: 400 }
      );
    }

    // Transaction ile güvenli güncelleme
    const result = await prisma.$transaction(async (tx) => {
      const updates = [];
      
      for (let i = 0; i < cardIds.length; i++) {
        const update = tx.corporateCard.update({
          where: { id: cardIds[i] },
          data: { 
            displayOrder: i + 1,
            updatedAt: new Date()
          }
        });
        updates.push(update);
      }
      
      return Promise.all(updates);
    });

    // Güncellenmiş kartları döndür
    const updatedCards = await prisma.corporateCard.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: updatedCards,
      message: `${result.length} kartın sıralaması güncellendi`
    });

  } catch (error) {
    console.error('Sıralama hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Sıralama güncellenirken hata oluştu',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
```

### 3. Temel CRUD API'leri

#### `/app/api/admin/kurumsal/kartlar/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const cardSchema = z.object({
  title: z.string().min(1, 'Başlık gerekli').max(100, 'Başlık çok uzun'),
  subtitle: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Geçersiz renk kodu'),
  textColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Geçersiz renk kodu'),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Geçersiz renk kodu'),
  targetUrl: z.string().url().optional().or(z.literal('')),
  openInNewTab: z.boolean().default(false),
  content: z.any().optional(),
  customData: z.any().optional(),
  imagePosition: z.enum(['center', 'top', 'bottom']).default('center'),
  cardSize: z.enum(['small', 'medium', 'large']).default('medium'),
  borderRadius: z.enum(['none', 'small', 'medium', 'large', 'full']).default('rounded')
});

// GET - Tüm kartları listele
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cards = await prisma.corporateCard.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    return NextResponse.json({ 
      success: true, 
      data: cards,
      meta: {
        total: cards.length,
        active: cards.filter(c => c.isActive).length
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Kartlar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Yeni kart oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = cardSchema.parse(body);

    // En yüksek display order'ı bul
    const maxOrderCard = await prisma.corporateCard.findFirst({
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true }
    });

    const newDisplayOrder = (maxOrderCard?.displayOrder || 0) + 1;

    const card = await prisma.corporateCard.create({
      data: {
        ...validatedData,
        displayOrder: newDisplayOrder,
        createdBy: session.user.id
      }
    });

    return NextResponse.json({
      success: true,
      data: card,
      message: 'Kart başarıyla oluşturuldu'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Geçersiz veri', 
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Kart oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
```

### 4. React Hook - Kart Yönetimi

#### `/app/dashboard/kurumsal/hooks/useKurumsalKartlar.ts`
```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface CorporateCard {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  displayOrder: number;
  isActive: boolean;
  targetUrl?: string;
  openInNewTab: boolean;
  content?: any;
  customData?: any;
  imagePosition: string;
  cardSize: string;
  borderRadius: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export function useKurumsalKartlar() {
  const [cards, setCards] = useState<CorporateCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Kartları yükle
  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/kurumsal/kartlar');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Kartlar yüklenemedi');
      }

      setCards(result.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(errorMessage);
      toast.error('Kartlar yüklenirken hata oluştu: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sıralama güncelle
  const updateOrder = useCallback(async (cardIds: string[]) => {
    try {
      const response = await fetch('/api/admin/kurumsal/kartlar/siralama', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardIds })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Sıralama güncellenemedi');
      }

      setCards(result.data);
      toast.success(result.message || 'Sıralama güncellendi');
      
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sıralama hatası';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Kart oluştur
  const createCard = useCallback(async (cardData: Partial<CorporateCard>) => {
    try {
      const response = await fetch('/api/admin/kurumsal/kartlar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Kart oluşturulamadı');
      }

      await fetchCards(); // Listeyi yenile
      toast.success(result.message || 'Kart oluşturuldu');
      
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Oluşturma hatası';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchCards]);

  // Kart güncelle
  const updateCard = useCallback(async (id: string, cardData: Partial<CorporateCard>) => {
    try {
      const response = await fetch(`/api/admin/kurumsal/kartlar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Kart güncellenemedi');
      }

      await fetchCards(); // Listeyi yenile
      toast.success(result.message || 'Kart güncellendi');
      
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Güncelleme hatası';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchCards]);

  // Kart sil
  const deleteCard = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/kurumsal/kartlar/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Kart silinemedi');
      }

      await fetchCards(); // Listeyi yenile
      toast.success(result.message || 'Kart silindi');
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Silme hatası';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchCards]);

  // Kart durumu değiştir
  const toggleCardStatus = useCallback(async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/kurumsal/kartlar/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Durum değiştirilemedi');
      }

      await fetchCards(); // Listeyi yenile
      toast.success(`Kart ${!isActive ? 'aktif' : 'pasif'} edildi`);
      
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Durum değiştirme hatası';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchCards]);

  // İlk yükleme
  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return {
    cards,
    loading,
    error,
    refetch: fetchCards,
    updateOrder,
    createCard,
    updateCard,
    deleteCard,
    toggleCardStatus
  };
}
```

### 5. Seed Data - Mevcut Kartlar

#### `/prisma/seeds/corporate.ts`
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialCards = [
  {
    title: "BAŞKANIMIZ",
    subtitle: "Doç. Dr. Tahir BÜYÜKAKIN",
    imageUrl: "/images/corporate/baskan.jpg",
    backgroundColor: "#f8f9fa",
    textColor: "#2c3e50",
    accentColor: "#3498db",
    displayOrder: 1,
    targetUrl: "/kurumsal/baskan",
    customData: { position: "chairman", department: "management" }
  },
  {
    title: "GENEL MÜDÜR",
    subtitle: "Erhan COŞAN",
    imageUrl: "/images/corporate/genel-mudur.jpg",
    backgroundColor: "#f8f9fa",
    textColor: "#2c3e50",
    accentColor: "#27ae60",
    displayOrder: 2,
    targetUrl: "/kurumsal/genel-mudur",
    customData: { position: "general_manager", department: "management" }
  },
  {
    title: "BİRİMLERİMİZ",
    subtitle: "MÜDÜRLÜKLER",
    imageUrl: "/images/corporate/birimler.jpg",
    backgroundColor: "#f8f9fa",
    textColor: "#2c3e50",
    accentColor: "#8e44ad",
    displayOrder: 3,
    targetUrl: "/kurumsal/birimler",
    customData: { type: "departments", showSubItems: true }
  },
  {
    title: "STRATEJİMİZ",
    imageUrl: "/images/corporate/strateji.jpg",
    backgroundColor: "#fff3cd",
    textColor: "#856404",
    accentColor: "#ffc107",
    displayOrder: 4,
    targetUrl: "/kurumsal/strateji",
    customData: { type: "strategy", highlightColor: "#ffc107" }
  },
  {
    title: "HEDEFİMİZ",
    imageUrl: "/images/corporate/hedef.jpg",
    backgroundColor: "#d1ecf1",
    textColor: "#0c5460",
    accentColor: "#17a2b8",
    displayOrder: 5,
    targetUrl: "/kurumsal/hedef",
    customData: { type: "goals", showProgress: true }
  }
];

export async function seedCorporateCards() {
  console.log('🌱 Kurumsal kartlar seed ediliyor...');

  // Mevcut kartları temizle
  await prisma.corporateCard.deleteMany();

  // Yeni kartları ekle
  const createdCards = [];
  for (const cardData of initialCards) {
    const card = await prisma.corporateCard.create({
      data: {
        ...cardData,
        isActive: true,
        imagePosition: 'center',
        cardSize: 'medium',
        borderRadius: 'rounded'
      }
    });
    createdCards.push(card);
  }

  console.log(`✅ ${createdCards.length} kurumsal kart oluşturuldu`);
  return createdCards;
}

// Eğer doğrudan çalıştırılırsa
if (require.main === module) {
  seedCorporateCards()
    .then(() => {
      console.log('✅ Seed tamamlandı');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed hatası:', error);
      process.exit(1);
    });
}
```

### 6. Çalıştırma Komutları

```bash
# 1. Seed data yükle
npx tsx prisma/seeds/corporate.ts

# 2. Development server başlat
npm run dev

# 3. Admin paneline git
# http://localhost:3000/dashboard/kurumsal

# 4. Test et:
# - Kart ekleme
# - Sıralama (drag & drop)
# - Düzenleme
# - Aktif/Pasif yapma
```

## ✅ Test Checklist

### Sıralama Testi
- [ ] Drag & drop çalışıyor
- [ ] Sıralama kaydediliyor
- [ ] Görsel feedback var
- [ ] Hata durumunda geri alma

### CRUD Testi
- [ ] Kart ekleme çalışıyor
- [ ] Düzenleme çalışıyor
- [ ] Silme çalışıyor
- [ ] Durum değiştirme çalışıyor

### Generic Yapı Testi
- [ ] Farklı türde kartlar eklenebiliyor
- [ ] Özel veriler kaydediliyor
- [ ] Stil seçenekleri çalışıyor
- [ ] Önizleme doğru gösteriyor

Bu guide ile kurumsal sayfa için generic ve sıralama odaklı bir sistem kurabilirsiniz.
