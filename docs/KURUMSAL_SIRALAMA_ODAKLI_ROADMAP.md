# Kurumsal Sayfa - Sıralama Odaklı Generic Yapı Roadmap

## 🎯 Temel Prensipler

### 1. Generic Kart Yapısı
- **Herhangi türde içerik** eklenebilir (yönetici, birim, hizmet, proje vb.)
- **Esnek veri yapısı** ile özel alanlar desteklenir
- **Tip kısıtlaması yok** - tamamen açık sistem

### 2. Sıralama Önceliği
- **Drag & Drop sıralama** mutlaka olmalı
- **Gerçek zamanlı güncelleme** 
- **Otomatik kaydetme** sıralama değişikliklerinde
- **Görsel feedback** sürükleme sırasında

## 🗃️ Güncellenmiş Veri Modeli

### CorporateCard - Generic Yapı
```prisma
model CorporateCard {
  id              String   @id @default(cuid())
  
  // Temel bilgiler
  title           String   // Herhangi bir başlık
  subtitle        String?  // Opsiyonel alt başlık
  description     String?  // Açıklama
  
  // Görsel ve stil
  imageUrl        String?  
  backgroundColor String   @default("#ffffff")
  textColor       String   @default("#000000") 
  accentColor     String   @default("#007bff")
  imagePosition   String   @default("center")
  cardSize        String   @default("medium")
  borderRadius    String   @default("rounded")
  
  // SİRALAMA - EN ÖNEMLİ ALAN
  displayOrder    Int      @default(0) @unique
  
  // Durum ve davranış
  isActive        Boolean  @default(true)
  targetUrl       String?  // Tıklama hedefi
  openInNewTab    Boolean  @default(false)
  
  // Esnek içerik alanları
  content         Json?    // HTML/Markdown içerik
  customData      Json?    // Özel veriler
  
  // Meta
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String?
  
  @@map("corporate_cards")
  @@index([displayOrder])
  @@index([isActive, displayOrder])
}
```

## 🔄 Sıralama Sistemi Detayları

### 1. Database Sıralama Stratejisi
```sql
-- Sıralama için optimize edilmiş indexler
CREATE UNIQUE INDEX idx_corporate_cards_order ON corporate_cards(display_order);
CREATE INDEX idx_corporate_cards_active_order ON corporate_cards(is_active, display_order);

-- Sıralama güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_card_order(
  card_ids TEXT[],
  user_id TEXT
) RETURNS VOID AS $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..array_length(card_ids, 1) LOOP
    UPDATE corporate_cards 
    SET display_order = i, updated_at = NOW()
    WHERE id = card_ids[i];
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### 2. API Endpoint - Sıralama
```typescript
// PATCH /api/admin/kurumsal/kartlar/siralama
export async function PATCH(request: NextRequest) {
  try {
    const { cardIds } = await request.json();
    
    // Transaction ile güvenli güncelleme
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < cardIds.length; i++) {
        await tx.corporateCard.update({
          where: { id: cardIds[i] },
          data: { 
            displayOrder: i + 1,
            updatedAt: new Date()
          }
        });
      }
    });

    // Güncellenmiş kartları döndür
    const updatedCards = await prisma.corporateCard.findMany({
      orderBy: { displayOrder: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: updatedCards,
      message: 'Sıralama başarıyla güncellendi'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sıralama güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}
```

## 🎨 Admin Arayüz - Sıralama Odaklı

### 1. Drag & Drop Bileşeni
```typescript
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface SiralamaBileşeniProps {
  cards: CorporateCard[];
  onReorder: (newOrder: string[]) => Promise<void>;
}

export default function SiralamaBileşeni({ cards, onReorder }: SiralamaBileşeniProps) {
  const [localCards, setLocalCards] = useState(cards);
  const [isReordering, setIsReordering] = useState(false);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(localCards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Optimistic update
    setLocalCards(items);
    setIsReordering(true);

    try {
      await onReorder(items.map(item => item.id));
    } catch (error) {
      // Hata durumunda geri al
      setLocalCards(cards);
      console.error('Sıralama hatası:', error);
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Kart Sıralaması</h3>
        {isReordering && (
          <div className="flex items-center text-blue-600">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sıralama güncelleniyor...
          </div>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="cards">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-2 p-4 rounded-lg border-2 border-dashed transition-colors ${
                snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
              }`}
            >
              {localCards.map((card, index) => (
                <Draggable key={card.id} draggableId={card.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`bg-white rounded-lg border p-4 transition-all ${
                        snapshot.isDragging 
                          ? 'shadow-lg rotate-2 scale-105' 
                          : 'shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          {...provided.dragHandleProps}
                          className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded"
                        >
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        </div>
                        
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                            {index + 1}
                          </div>
                          
                          {card.imageUrl && (
                            <img 
                              src={card.imageUrl} 
                              alt={card.title}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          
                          <div>
                            <h4 className="font-medium">{card.title}</h4>
                            {card.subtitle && (
                              <p className="text-sm text-gray-600">{card.subtitle}</p>
                            )}
                          </div>
                        </div>
                        
                        <Badge variant={card.isActive ? "default" : "secondary"}>
                          {card.isActive ? "Aktif" : "Pasif"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
```

### 2. Kart Ekleme Formu - Generic
```typescript
interface KartEkleFormProps {
  onSave: (card: CreateCardRequest) => Promise<void>;
  onCancel: () => void;
}

export default function KartEkleForm({ onSave, onCancel }: KartEkleFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#007bff',
    targetUrl: '',
    openInNewTab: false,
    imagePosition: 'center',
    cardSize: 'medium',
    borderRadius: 'rounded',
    customData: {}
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temel Bilgiler */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Temel Bilgiler</h3>
          
          <div>
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Örn: BAŞKANIMIZ, HİZMETLERİMİZ, PROJELERİMİZ"
              required
            />
          </div>

          <div>
            <Label htmlFor="subtitle">Alt Başlık</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
              placeholder="Örn: Kişi adı, departman adı"
            />
          </div>

          <div>
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Detaylı açıklama..."
              rows={3}
            />
          </div>
        </div>

        {/* Görsel ve Stil */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Görsel ve Stil</h3>
          
          <div>
            <Label>Görsel</Label>
            <GlobalMediaSelector
              value={formData.imageUrl}
              onChange={(url) => setFormData({...formData, imageUrl: url})}
              folder="/media/kurumsal/"
              accept="image/*"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Arka Plan</Label>
              <ColorPicker
                value={formData.backgroundColor}
                onChange={(color) => setFormData({...formData, backgroundColor: color})}
              />
            </div>
            <div>
              <Label>Metin Rengi</Label>
              <ColorPicker
                value={formData.textColor}
                onChange={(color) => setFormData({...formData, textColor: color})}
              />
            </div>
            <div>
              <Label>Vurgu Rengi</Label>
              <ColorPicker
                value={formData.accentColor}
                onChange={(color) => setFormData({...formData, accentColor: color})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Görsel Pozisyon</Label>
              <Select value={formData.imagePosition} onValueChange={(value) => setFormData({...formData, imagePosition: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Merkez</SelectItem>
                  <SelectItem value="top">Üst</SelectItem>
                  <SelectItem value="bottom">Alt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kart Boyutu</Label>
              <Select value={formData.cardSize} onValueChange={(value) => setFormData({...formData, cardSize: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Küçük</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="large">Büyük</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Köşe Yuvarlaklığı</Label>
              <Select value={formData.borderRadius} onValueChange={(value) => setFormData({...formData, borderRadius: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yok</SelectItem>
                  <SelectItem value="small">Az</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="large">Çok</SelectItem>
                  <SelectItem value="full">Tam Yuvarlak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Önizleme */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Önizleme</h3>
        <div className="max-w-sm">
          <KartOnizleme data={formData} />
        </div>
      </div>

      {/* Butonlar */}
      <div className="flex justify-end gap-3 border-t pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit">
          Kartı Kaydet
        </Button>
      </div>
    </form>
  );
}
```

## 🚀 Implementation Sırası

### Faz 1: Temel Sıralama Sistemi (1 gün)
1. **Database schema** güncelleme
2. **Sıralama API endpoint**'i oluşturma
3. **Temel drag & drop** bileşeni
4. **Sıralama testi** ve doğrulama

### Faz 2: Generic Kart Sistemi (2 gün)
1. **Esnek form yapısı** oluşturma
2. **Özel veri alanları** desteği
3. **Stil seçenekleri** genişletme
4. **Önizleme sistemi** geliştirme

### Faz 3: Admin Arayüz Tamamlama (2 gün)
1. **Gelişmiş sıralama** özellikleri
2. **Toplu işlemler** (aktif/pasif, silme)
3. **Arama ve filtreleme**
4. **Performans optimizasyonu**

### Faz 4: Frontend Entegrasyon (1 gün)
1. **Dinamik kart renderı**
2. **Responsive tasarım**
3. **Loading states**
4. **Error handling**

## ✅ Kritik Başarı Kriterleri

### Sıralama Sistemi
- [ ] Drag & drop sorunsuz çalışıyor
- [ ] Sıralama değişiklikleri anında kaydediliyor
- [ ] Görsel feedback mükemmel
- [ ] Hata durumunda geri alma çalışıyor

### Generic Yapı
- [ ] Herhangi türde kart eklenebiliyor
- [ ] Özel veri alanları kullanılabiliyor
- [ ] Stil seçenekleri esnek
- [ ] Önizleme gerçek zamanlı

### Performans
- [ ] Sayfa yükleme < 2 saniye
- [ ] Sıralama işlemi < 500ms
- [ ] 50+ kart ile sorunsuz çalışıyor
- [ ] Mobile responsive mükemmel

Bu roadmap, sıralama özelliğini ön planda tutarak generic bir kart sistemi oluşturmayı hedefliyor. Herhangi türde içerik eklenebilir ve kullanıcı istediği gibi sıralayabilir.
