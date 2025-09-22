# Kurumsal Sayfa - Implementation Guide

## 🚀 Hızlı Başlangıç

### Ön Koşullar
- Node.js 18+ yüklü
- PostgreSQL veritabanı çalışır durumda
- kentkonut-backend projesi setup edilmiş
- Admin yetkileri mevcut

### Kurulum Adımları

#### 1. Database Schema Güncellemesi
```bash
# Backend dizinine git
cd kentkonut-backend

# Prisma schema dosyasını güncelle
# schema.prisma dosyasına yeni modelleri ekle
```

#### 2. Migration Oluştur ve Çalıştır
```bash
# Migration oluştur
npx prisma migrate dev --name add_corporate_management

# Database'i güncelle
npx prisma db push

# Prisma client'ı yeniden oluştur
npx prisma generate
```

#### 3. Seed Data Hazırla
```bash
# Seed script çalıştır
npm run seed:corporate
```

## 📁 Dosya Oluşturma Sırası

### 1. Backend API Endpoints

#### `/app/api/public/kurumsal/kartlar/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const active = searchParams.get('active') !== 'false';

    const cards = await prisma.corporateCard.findMany({
      where: {
        isActive: active,
        ...(type && { cardType: type as any })
      },
      orderBy: { displayOrder: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: cards,
      meta: {
        total: cards.length,
        activeCount: cards.filter(c => c.isActive).length
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Kartlar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
```

#### `/app/api/admin/kurumsal/kartlar/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const createCardSchema = z.object({
  title: z.string().min(1).max(100),
  subtitle: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#ffffff'),
  textColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#000000'),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#007bff'),
  cardType: z.enum(['EXECUTIVE', 'DEPARTMENT', 'STRATEGY', 'GOAL', 'CUSTOM']),
  targetUrl: z.string().url().optional(),
  content: z.any().optional()
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cards = await prisma.corporateCard.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    return NextResponse.json({ success: true, data: cards });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Kartlar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCardSchema.parse(body);

    // En yüksek display order'ı bul
    const maxOrder = await prisma.corporateCard.findFirst({
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true }
    });

    const card = await prisma.corporateCard.create({
      data: {
        ...validatedData,
        displayOrder: (maxOrder?.displayOrder || 0) + 1,
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
        { success: false, error: 'Geçersiz veri', details: error.errors },
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

### 2. Admin Dashboard Sayfası

#### `/app/dashboard/kurumsal/page.tsx`
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import KartYonetimi from './components/KartYonetimi';
import SayfaAyarlari from './components/SayfaAyarlari';
import { useKurumsalKartlar } from './hooks/useKurumsalKartlar';

export default function KurumsalYonetimi() {
  const { cards, loading, error, refetch } = useKurumsalKartlar();
  const [activeTab, setActiveTab] = useState('kartlar');

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kurumsal Sayfa Yönetimi</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="kartlar">Kartlar Yönetimi</TabsTrigger>
          <TabsTrigger value="sayfa">Sayfa Ayarları</TabsTrigger>
          <TabsTrigger value="onizleme">Önizleme</TabsTrigger>
        </TabsList>

        <TabsContent value="kartlar" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Kurumsal Kartlar</CardTitle>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Kart Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <KartYonetimi 
                cards={cards} 
                loading={loading} 
                error={error}
                onRefetch={refetch}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sayfa" className="mt-6">
          <SayfaAyarlari />
        </TabsContent>

        <TabsContent value="onizleme" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sayfa Önizlemesi</CardTitle>
            </CardHeader>
            <CardContent>
              <iframe 
                src="/kurumsal?preview=true" 
                className="w-full h-96 border rounded"
                title="Kurumsal Sayfa Önizlemesi"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 3. Kart Yönetimi Bileşeni

#### `/app/dashboard/kurumsal/components/KartYonetimi.tsx`
```typescript
'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { CorporateCard } from '@/types/kurumsal';

interface KartYonetimiProps {
  cards: CorporateCard[];
  loading: boolean;
  error: string | null;
  onRefetch: () => void;
}

export default function KartYonetimi({ cards, loading, error, onRefetch }: KartYonetimiProps) {
  const [localCards, setLocalCards] = useState(cards);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(localCards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalCards(items);

    // API'ye sıralama güncellemesi gönder
    try {
      const response = await fetch('/api/admin/kurumsal/kartlar/siralama', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardIds: items.map(item => item.id) })
      });

      if (!response.ok) {
        throw new Error('Sıralama güncellenemedi');
      }
    } catch (error) {
      console.error('Sıralama hatası:', error);
      // Hata durumunda eski sıralamaya geri dön
      setLocalCards(cards);
    }
  };

  const toggleCardStatus = async (cardId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/kurumsal/kartlar/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        onRefetch();
      }
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Kartlar yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Hata: {error}</div>;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="cards">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
            {localCards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(provided, snapshot) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`${snapshot.isDragging ? 'shadow-lg' : ''} ${!card.isActive ? 'opacity-50' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div {...provided.dragHandleProps} className="cursor-grab">
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        </div>
                        
                        {card.imageUrl && (
                          <img 
                            src={card.imageUrl} 
                            alt={card.title}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        
                        <div className="flex-1">
                          <h3 className="font-semibold">{card.title}</h3>
                          {card.subtitle && (
                            <p className="text-sm text-gray-600">{card.subtitle}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{card.cardType}</Badge>
                            <Badge variant={card.isActive ? "default" : "secondary"}>
                              {card.isActive ? "Aktif" : "Pasif"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleCardStatus(card.id, card.isActive)}
                          >
                            {card.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
```

## 🔄 Migration Stratejisi

### Mevcut Veriden Dinamik Veriye Geçiş

#### 1. Mevcut Sayfa Analizi
```typescript
// Mevcut statik kartları analiz et
const staticCards = [
  {
    title: "BAŞKANIMIZ",
    subtitle: "Doç. Dr. Tahir BÜYÜKAKIN",
    imageUrl: "/images/baskan.jpg",
    cardType: "EXECUTIVE",
    backgroundColor: "#f8f9fa",
    textColor: "#333333",
    accentColor: "#007bff"
  },
  {
    title: "GENEL MÜDÜR", 
    subtitle: "Erhan COŞAN",
    imageUrl: "/images/genel-mudur.jpg",
    cardType: "EXECUTIVE",
    backgroundColor: "#f8f9fa",
    textColor: "#333333", 
    accentColor: "#28a745"
  },
  // ... diğer kartlar
];
```

#### 2. Seed Data Oluşturma
```typescript
// prisma/seeds/corporate.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCorporateData() {
  // Önce mevcut verileri temizle
  await prisma.corporateCard.deleteMany();
  
  // Yeni kartları ekle
  const cards = await prisma.corporateCard.createMany({
    data: staticCards.map((card, index) => ({
      ...card,
      displayOrder: index + 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  });

  console.log(`${cards.count} kurumsal kart oluşturuldu`);
}
```

## ✅ Test Checklist

### Backend Tests
- [ ] API endpoint testleri
- [ ] Validation testleri  
- [ ] Authorization testleri
- [ ] Database işlem testleri

### Frontend Tests
- [ ] Bileşen render testleri
- [ ] User interaction testleri
- [ ] API integration testleri
- [ ] Responsive design testleri

### E2E Tests
- [ ] Kart oluşturma workflow
- [ ] Sıralama işlemleri
- [ ] Görsel yükleme
- [ ] Sayfa görüntüleme

## 🚀 Go-Live Checklist

### Pre-Launch
- [ ] Database backup alındı
- [ ] Migration test edildi
- [ ] Admin training tamamlandı
- [ ] Performance test yapıldı
- [ ] Security audit tamamlandı

### Launch Day
- [ ] Migration çalıştırıldı
- [ ] Seed data yüklendi
- [ ] Frontend deploy edildi
- [ ] Monitoring aktif
- [ ] Backup doğrulandı

### Post-Launch
- [ ] User feedback toplandı
- [ ] Performance monitör edildi
- [ ] Error tracking kontrol edildi
- [ ] Analytics kuruldu
- [ ] Documentation güncellendi
