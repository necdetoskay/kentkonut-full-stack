# 🎯 PRD Implementation Plan - Proje Detay Galerisi Sistemi

## 📋 Genel Bakış

Bu doküman, mevcut tree-based galeri sistemini PRD gereksinimlerine uygun tab-based sisteme dönüştürme planını içerir.

## 🎯 Hedefler

- PRD'deki tab-based navigasyon sistemini implement etmek
- Responsive grid layout (desktop: 4, tablet: 3, mobil: 2 kolon)
- Real-time arama ve filtreleme sistemi
- Lazy loading ve performans optimizasyonları
- Touch gesture'lar ve mobil UX iyileştirmeleri

## 🏗️ Mimari Tasarım

### 1. Veritabanı Yapısı

Mevcut `ProjectGalleryItem` modeli PRD ile uyumlu, sadece kullanım şekli değişecek:

```prisma
model ProjectGalleryItem {
  id          Int                    @id @default(autoincrement())
  projectId   Int
  mediaId     String?                // NULL: container/tab, değil: medya
  order       Int                    @default(0)
  title       String                 // Tab başlığı
  description String?                // Tab açıklaması
  parentId    Int?                   // NULL: root level tab
  isActive    Boolean                @default(true)
  isFolder    Boolean                @default(false) // Tab container mı?
  createdAt   DateTime               @default(now())
  updatedAt   DateTime               @updatedAt
  type        String?
  category    ProjectGalleryCategory @default(DIS_MEKAN)
  
  // Relations
  media       Media?                 @relation("ProjectGalleryMedia", fields: [mediaId], references: [id], onDelete: Cascade)
  project     Project                @relation(fields: [projectId], references: [id], onDelete: Cascade)
  parent      ProjectGalleryItem?    @relation("GalleryHierarchy", fields: [parentId], references: [id])
  children    ProjectGalleryItem[]   @relation("GalleryHierarchy")
}
```

### 2. API Endpoint'leri

#### 2.1 GET /api/projects/[slug]/gallery
```typescript
// PRD gereksinimi: Hiyerarşik tab yapısını getir
interface TabGalleryResponse {
  success: boolean;
  data: {
    tabs: TabItem[];
    breadcrumb: BreadcrumbItem[];
  };
}

interface TabItem {
  id: number;
  title: string;
  description?: string;
  category: ProjectGalleryCategory;
  hasOwnMedia: boolean;  // Parent'ın kendi medyası var mı?
  subTabs: TabItem[];
  mediaCount: number;
  order: number;
}
```

#### 2.2 GET /api/projects/[slug]/gallery/[tabId]/media
```typescript
// PRD gereksinimi: Tab'ın medyalarını getir (lazy loading ile)
interface TabMediaResponse {
  success: boolean;
  data: {
    tab: TabItem;
    media: MediaItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  };
}
```

#### 2.3 GET /api/projects/[slug]/gallery/search
```typescript
// PRD gereksinimi: Real-time arama
interface SearchResponse {
  success: boolean;
  data: {
    results: SearchResult[];
    total: number;
    query: string;
  };
}

interface SearchResult {
  id: number;
  title: string;
  description?: string;
  tabPath: string[];
  media: MediaItem;
  relevanceScore: number;
}
```

### 3. Frontend Component Mimarisi

#### 3.1 Ana Komponentler

```typescript
// 1. TabGalleryContainer - Ana container
interface TabGalleryContainerProps {
  projectSlug: string;
  projectTitle: string;
}

// 2. TabNavigation - Yatay scrollable tab'lar
interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: number;
  onTabChange: (tabId: number) => void;
  breadcrumb: BreadcrumbItem[];
}

// 3. MediaGrid - Responsive grid layout
interface MediaGridProps {
  media: MediaItem[];
  loading: boolean;
  onImageClick: (index: number) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

// 4. SearchAndFilters - Arama ve filtreleme
interface SearchAndFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
  categories: ProjectGalleryCategory[];
}
```

#### 3.2 Tab Senaryoları (PRD'den)

**Senaryo A: Parent'ın Kendi Medyası + Child'ları Var**
```
Ana Tab: "İç Mekan"
├── Alt Tab: "İç Mekan" (parent'ın kendi görselleri)
├── Alt Tab: "Salon"
├── Alt Tab: "Mutfak"
└── Alt Tab: "Yatak Odası"
```

**Senaryo B: Parent'ın Sadece Child'ları Var**
```
Ana Tab: "Dış Mekan"
├── Alt Tab: "Bahçe"
├── Alt Tab: "Havuz"
└── Alt Tab: "Cephe"
```

**Senaryo C: Parent'ın Sadece Kendi Medyası Var**
```
Ana Tab: "Kat Planları"
└── Direkt medya grid gösterimi
```

## 🚀 Implementasyon Planı

### Faz 1: Backend API Geliştirme (1 hafta)

#### 1.1 Yeni API Endpoint'leri
- [ ] `GET /api/projects/[slug]/gallery` - Tab yapısını getir
- [ ] `GET /api/projects/[slug]/gallery/[tabId]/media` - Tab medyalarını getir
- [ ] `GET /api/projects/[slug]/gallery/search` - Arama endpoint'i
- [ ] `GET /api/projects/[slug]/gallery/filters` - Filtreleme seçenekleri

#### 1.2 Veritabanı Optimizasyonları
- [ ] Index'ler ekle (performans için)
- [ ] Query optimizasyonları
- [ ] Cache stratejisi

### Faz 2: Frontend Component Geliştirme (1 hafta)

#### 2.1 Temel Komponentler
- [ ] `TabGalleryContainer` - Ana container
- [ ] `TabNavigation` - Yatay scrollable tab'lar
- [ ] `MediaGrid` - Responsive grid layout
- [ ] `SearchAndFilters` - Arama ve filtreleme

#### 2.2 State Management
- [ ] Tab state management
- [ ] Media loading states
- [ ] Search state management
- [ ] Filter state management

### Faz 3: Grid Layout ve Performans (1 hafta)

#### 3.1 Responsive Grid
- [ ] Desktop: 4 kolon layout
- [ ] Tablet: 3 kolon layout
- [ ] Mobile: 2 kolon layout
- [ ] Grid breakpoint'leri

#### 3.2 Performans Optimizasyonları
- [ ] Lazy loading implementasyonu
- [ ] Image optimization
- [ ] Virtual scrolling (büyük listeler için)
- [ ] Memoization

### Faz 4: Arama ve Filtreleme (1 hafta)

#### 4.1 Arama Sistemi
- [ ] Real-time arama
- [ ] Arama geçmişi
- [ ] Highlighting
- [ ] Relevance scoring

#### 4.2 Filtreleme Sistemi
- [ ] Kategori filtreleme
- [ ] Medya tipi filtreleme
- [ ] Tarih aralığı filtresi
- [ ] Boyut filtresi

### Faz 5: Mobil UX ve Touch Gesture'lar (1 hafta)

#### 5.1 Touch Gesture'lar
- [ ] Swipe navigasyonu (lightbox'ta)
- [ ] Pinch-to-zoom
- [ ] Touch-friendly tab navigasyonu

#### 5.2 Mobil Optimizasyonlar
- [ ] Vertical scroll optimizasyonu
- [ ] Touch target boyutları
- [ ] Mobile-first responsive design

## 📊 Performans Hedefleri

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1

## 🧪 Test Stratejisi

### Unit Tests
- [ ] Component rendering testleri
- [ ] API endpoint testleri
- [ ] Utility function testleri

### Integration Tests
- [ ] Tab switching fonksiyonalitesi
- [ ] Lightbox navigasyonu
- [ ] API-Frontend entegrasyonu

### E2E Tests
- [ ] Kullanıcı akış testleri
- [ ] Cross-browser uyumluluğu
- [ ] Mobile deneyim testleri

## 📈 Metrikler ve Analitik

### Kullanıcı Metrikleri
- Galeri görüntülenme oranı
- Ortalama galeri görüntüleme süresi
- En çok görüntülenen kategoriler
- Lightbox açılma oranı

### Performans Metrikleri
- Sayfa yükleme süreleri
- Image load süreleri
- API response times
- Error rates

## 🔄 Migration Stratejisi

### Mevcut Sistemden Yeni Sisteme Geçiş

1. **Veri Migration**: Mevcut `ProjectGalleryItem` verilerini koru
2. **API Compatibility**: Eski API'leri deprecated olarak işaretle
3. **Frontend Migration**: Yeni komponentleri implement et
4. **Testing**: Kapsamlı test yap
5. **Deployment**: Aşamalı deployment

### Rollback Planı

- Eski sistem backup'ı korunacak
- Feature flag ile yeni/eski sistem arasında geçiş
- Hızlı rollback mekanizması

## 📅 Zaman Çizelgesi

| Hafta | Aktivite | Sorumlu | Deliverable |
|-------|----------|---------|-------------|
| 1 | Backend API & DB | Backend Dev | API endpoints ready |
| 2 | Frontend Components | Frontend Dev | Basic tab system working |
| 3 | Grid Layout & Performance | Frontend Dev | Responsive grid complete |
| 4 | Search & Filters | Full Team | Search and filtering complete |
| 5 | Mobile UX & Testing | QA + Dev | Mobile experience complete |
| 6 | Testing & Optimization | QA + Dev | Production ready |

## 🚨 Risk Analizi

### Yüksek Risk
- **Performance Issues**: Çok sayıda görsel yüklenirken performans sorunları
- **Mobile Experience**: Kompleks tab yapısının mobilde zorluğu

### Orta Risk
- **Browser Compatibility**: Eski browser desteği
- **Image Loading**: Yavaş internet bağlantılarında UX

### Düşük Risk
- **API Changes**: Backend API değişiklikleri
- **Design Changes**: Son dakika tasarım değişiklikleri

## 📞 İletişim

### Product Owner
- **İsim**: [Product Owner Adı]
- **Email**: [email@company.com]
- **Slack**: @productowner

### Tech Lead
- **İsim**: [Tech Lead Adı]  
- **Email**: [email@company.com]
- **Slack**: @techlead

---

*Bu doküman yaşayan bir dokümandır ve proje geliştirme sürecinde güncellenecektir.*
