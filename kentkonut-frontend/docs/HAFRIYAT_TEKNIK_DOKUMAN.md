# Hafriyat Sayfası Teknik Dokümanı

## 1. Mimari Yapı

Hafriyat sayfası, mevcut Kent Konut frontend uygulamasına entegre edilecek bir sayfa olarak geliştirilecektir. React ve TypeScript kullanılarak geliştirilecek olan sayfa, mevcut uygulama mimarisine uygun olarak tasarlanacaktır.

### 1.1 Dosya Yapısı

```
kentkonut-frontend/
├── src/
│   ├── pages/
│   │   └── Hafriyat.tsx         # Ana hafriyat sayfası
│   ├── components/
│   │   └── hafriyat/
│   │       ├── HafriyatHeader.tsx       # Başlık ve açıklama bileşeni
│   │       ├── CircularProgress.tsx     # Dairesel ilerleme göstergesi
│   │       ├── ProgressBar.tsx          # Yatay ilerleme çubuğu
│   │       └── HafriyatList.tsx         # Hafriyat sahalarının listesi
│   ├── services/
│   │   └── hafriyatService.ts   # Backend API entegrasyonu
│   ├── types/
│   │   └── hafriyat.ts          # Tip tanımlamaları
```

## 2. Veri Modeli

### 2.1 Hafriyat Sahası Tipi

```typescript
export interface HafriyatSahasi {
  id: string;
  ad: string;           // Saha adı
  tamamlanmaYuzdesi: number;  // 0-100 arası değer
  aciklama?: string;    // Opsiyonel açıklama
  sonGuncelleme: string; // Tarih formatında
}
```

### 2.2 Hafriyat Verileri Tipi

```typescript
export interface HafriyatVerileri {
  baslik: string;
  aciklama: string;
  sonGuncelleme: string;
  sahalar: HafriyatSahasi[];
}
```

## 3. API Entegrasyonu

### 3.1 Hafriyat Verilerini Alma

```typescript
// hafriyatService.ts
import { apiClient } from './apiClient';
import { HafriyatVerileri } from '../types/hafriyat';

export const getHafriyatVerileri = async (): Promise<HafriyatVerileri> => {
  try {
    const response = await apiClient.get<HafriyatVerileri>('/api/hafriyat');
    return response.data;
  } catch (error) {
    console.error('Hafriyat verileri alınamadı:', error);
    throw error;
  }
};
```

## 4. Bileşenler

### 4.1 Dairesel İlerleme Göstergesi

CircularProgress bileşeni, bir hafriyat sahasının tamamlanma yüzdesini dairesel bir gösterge ile görselleştirecektir.

```typescript
// CircularProgress.tsx
interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}
```

### 4.2 Yatay İlerleme Çubuğu

ProgressBar bileşeni, bir hafriyat sahasının tamamlanma yüzdesini yatay bir çubuk ile görselleştirecektir.

```typescript
// ProgressBar.tsx
interface ProgressBarProps {
  percentage: number;
  height?: number;
  color?: string;
  label?: string;
}
```

### 4.3 Hafriyat Sahaları Listesi

HafriyatList bileşeni, tüm hafriyat sahalarını listeleyecek ve her biri için ilerleme göstergelerini görüntüleyecektir.

```typescript
// HafriyatList.tsx
interface HafriyatListProps {
  sahalar: HafriyatSahasi[];
}
```

## 5. Sayfa Yapısı

Hafriyat.tsx sayfası, tüm bileşenleri bir araya getirerek hafriyat sayfasını oluşturacaktır.

```typescript
// Hafriyat.tsx
import { useEffect, useState } from 'react';
import { getHafriyatVerileri } from '../services/hafriyatService';
import { HafriyatVerileri } from '../types/hafriyat';
import HafriyatHeader from '../components/hafriyat/HafriyatHeader';
import HafriyatList from '../components/hafriyat/HafriyatList';

const Hafriyat = () => {
  const [hafriyatVerileri, setHafriyatVerileri] = useState<HafriyatVerileri | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getHafriyatVerileri();
        setHafriyatVerileri(data);
        setLoading(false);
      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Render logic...
};
```

## 6. Routing Yapılandırması

Hafriyat sayfasına erişim için App.tsx dosyasında routing yapılandırması güncellenecektir.

```typescript
// App.tsx (güncelleme)
const Hafriyat = lazy(() => import("./pages/Hafriyat"));

// Routes içinde
<Route path="/hafriyat" element={<Hafriyat />} />
```

## 7. Stil ve Tasarım

Hafriyat sayfası, Kent Konut'un mevcut tasarım diline uygun olarak stillendirilecektir. Responsive tasarım için CSS Grid ve Flexbox kullanılacaktır.

### 7.1 Renk Şeması

- İlerleme göstergeleri için renk kodlaması:
  - %0-25: #ff4d4f (kırmızı)
  - %26-50: #faad14 (turuncu)
  - %51-75: #52c41a (açık yeşil)
  - %76-100: #1890ff (mavi)

### 7.2 Responsive Tasarım Kırılma Noktaları

- Mobil: < 768px
- Tablet: 768px - 1024px
- Masaüstü: > 1024px

## 8. Performans Optimizasyonu

- Lazy loading kullanılarak sayfa yükleme performansı iyileştirilecek
- Gereksiz render'ları önlemek için React.memo ve useMemo kullanılacak
- Büyük veri setleri için sanal liste (virtualization) kullanılabilir

## 9. Erişilebilirlik

- Tüm interaktif elementler için ARIA etiketleri eklenecek
- Klavye navigasyonu desteklenecek
- Renk kontrastı WCAG 2.1 AA standartlarına uygun olacak
- Ekran okuyucular için alternatif metinler sağlanacak

## 10. Test Stratejisi

- Birim testleri: Jest ve React Testing Library ile bileşen testleri
- Entegrasyon testleri: API entegrasyonu ve veri akışı testleri
- UI testleri: Görsel regresyon testleri
- Erişilebilirlik testleri: axe-core ile otomatik erişilebilirlik kontrolleri