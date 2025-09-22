# Kurumsal Sayfa - Teknik Spesifikasyon

## 🏗️ Database Schema Detayları

### CorporateCard Tablosu
```sql
CREATE TABLE corporate_cards (
  id VARCHAR(25) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  subtitle VARCHAR(100),
  description TEXT,
  image_url VARCHAR(500),
  background_color VARCHAR(7) DEFAULT '#ffffff',
  text_color VARCHAR(7) DEFAULT '#000000',
  accent_color VARCHAR(7) DEFAULT '#007bff',
  display_order INTEGER DEFAULT 0 NOT NULL, -- Sıralama için kritik
  is_active BOOLEAN DEFAULT true,
  target_url VARCHAR(500),
  content JSON,
  custom_data JSON, -- Esnek veri yapısı
  image_position VARCHAR(20) DEFAULT 'center',
  card_size VARCHAR(20) DEFAULT 'medium',
  border_radius VARCHAR(20) DEFAULT 'rounded',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(25)
);

-- Sıralama için optimize edilmiş indexler
CREATE INDEX idx_corporate_cards_order_active ON corporate_cards(display_order, is_active);
CREATE INDEX idx_corporate_cards_active ON corporate_cards(is_active);
CREATE UNIQUE INDEX idx_corporate_cards_order ON corporate_cards(display_order);
```

### CorporatePage Tablosu
```sql
CREATE TABLE corporate_pages (
  id VARCHAR(25) PRIMARY KEY,
  title VARCHAR(200) DEFAULT 'Kurumsal',
  meta_title VARCHAR(200),
  meta_description TEXT,
  header_image VARCHAR(500),
  intro_text TEXT,
  show_breadcrumb BOOLEAN DEFAULT true,
  custom_css TEXT,
  slug VARCHAR(100) UNIQUE DEFAULT 'kurumsal',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API Endpoint Detayları

### Public API Endpoints

#### GET /api/public/kurumsal/kartlar
```typescript
// Response Type
interface CorporateCardsResponse {
  success: boolean;
  data: CorporateCard[];
  meta: {
    total: number;
    activeCount: number;
  };
}

// Query Parameters
interface QueryParams {
  active?: boolean;
  limit?: number;
  orderBy?: 'displayOrder' | 'title' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}
```

#### GET /api/public/kurumsal/sayfa
```typescript
// Response Type
interface CorporatePageResponse {
  success: boolean;
  data: {
    page: CorporatePage;
    cards: CorporateCard[];
  };
}
```

### Admin API Endpoints

#### POST /api/admin/kurumsal/kartlar
```typescript
// Request Body
interface CreateCardRequest {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  targetUrl?: string;
  content?: any;
  customData?: any; // Esnek veri yapısı
  imagePosition?: 'center' | 'top' | 'bottom';
  cardSize?: 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'full';
}

// Response
interface CreateCardResponse {
  success: boolean;
  data: CorporateCard;
  message: string;
}
```

#### PATCH /api/admin/kurumsal/kartlar/siralama
```typescript
// Request Body
interface ReorderRequest {
  cardIds: string[]; // Yeni sıralama
}

// Response
interface ReorderResponse {
  success: boolean;
  data: CorporateCard[];
  message: string;
}
```

## 🎨 Frontend Bileşen Yapısı

### KurumsalSayfa Bileşeni
```typescript
interface KurumsalSayfaProps {
  initialData?: {
    page: CorporatePage;
    cards: CorporateCard[];
  };
}

const KurumsalSayfa: React.FC<KurumsalSayfaProps> = ({ initialData }) => {
  // Component implementation
};
```

### KurumsalKart Bileşeni
```typescript
interface KurumsalKartProps {
  card: CorporateCard;
  onClick?: (card: CorporateCard) => void;
  className?: string;
}

const KurumsalKart: React.FC<KurumsalKartProps> = ({ card, onClick, className }) => {
  // Component implementation
};
```

## 🛠️ Admin Arayüz Bileşenleri

### KartYonetimi Bileşeni
```typescript
interface KartYonetimiProps {
  cards: CorporateCard[];
  onUpdate: (cards: CorporateCard[]) => void;
  onDelete: (cardId: string) => void;
  onCreate: (card: CreateCardRequest) => void;
}
```

### KartEditForm Bileşeni
```typescript
interface KartEditFormProps {
  card?: CorporateCard;
  onSave: (card: CorporateCard) => void;
  onCancel: () => void;
  isLoading?: boolean;
}
```

### RenkSecici Bileşeni
```typescript
interface RenkSeciciProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
  presetColors?: string[];
}
```

## 📁 Dosya Yapısı

### Backend Dosyaları
```
kentkonut-backend/
├── app/api/admin/kurumsal/
│   ├── kartlar/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   └── siralama/route.ts
│   └── sayfa/route.ts
├── app/api/public/kurumsal/
│   ├── kartlar/route.ts
│   └── sayfa/route.ts
├── app/dashboard/kurumsal/
│   ├── page.tsx
│   ├── components/
│   │   ├── KartYonetimi.tsx
│   │   ├── KartEditForm.tsx
│   │   ├── RenkSecici.tsx
│   │   └── SayfaAyarlari.tsx
│   └── hooks/
│       ├── useKurumsalKartlar.ts
│       └── useKurumsalSayfa.ts
└── lib/services/
    └── kurumsalService.ts
```

### Frontend Dosyaları
```
kentkonut-frontend/
├── src/pages/kurumsal/
│   └── index.tsx
├── src/components/kurumsal/
│   ├── KurumsalSayfa.tsx
│   ├── KurumsalKart.tsx
│   └── KurumsalGrid.tsx
├── src/services/
│   └── kurumsalService.ts
├── src/types/
│   └── kurumsal.ts
└── src/hooks/
    └── useKurumsal.ts
```

## 🎯 Implementasyon Adımları

### Adım 1: Database Setup
```bash
# Migration oluştur
npx prisma migrate dev --name add_corporate_management

# Seed data ekle
npm run seed:corporate
```

### Adım 2: Backend API Development
1. Public API endpoints
2. Admin API endpoints
3. Validation middleware
4. Error handling
5. Testing

### Adım 3: Admin Interface
1. Kart listesi sayfası
2. Kart ekleme/düzenleme formu
3. Drag & drop sıralama
4. Görsel yükleme entegrasyonu
5. Önizleme özelliği

### Adım 4: Frontend Integration
1. API service katmanı
2. React hooks
3. Bileşen geliştirme
4. Responsive tasarım
5. Performance optimizasyonu

## 🧪 Test Senaryoları

### Unit Tests
- API endpoint testleri
- Validation testleri
- Service katmanı testleri
- Bileşen testleri

### Integration Tests
- Admin workflow testleri
- Frontend-Backend entegrasyon
- Database işlem testleri

### E2E Tests
- Kart oluşturma workflow
- Sıralama işlemleri
- Görsel yükleme
- Sayfa görüntüleme

## 📊 Performance Metrikleri

### Hedef Değerler
- **API Response Time**: < 200ms
- **Page Load Time**: < 2 seconds
- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds

### Optimizasyon Stratejileri
- Database query optimization
- Image compression ve WebP format
- CDN kullanımı
- Browser caching
- API response caching

## 🔒 Güvenlik Kontrolleri

### Input Validation
```typescript
const cardValidationSchema = z.object({
  title: z.string().min(1).max(100),
  subtitle: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  imageUrl: z.string().url().optional(),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  textColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  cardType: z.enum(['EXECUTIVE', 'DEPARTMENT', 'STRATEGY', 'GOAL', 'CUSTOM']),
  targetUrl: z.string().url().optional()
});
```

### Authorization
- Admin role kontrolü
- JWT token validation
- Rate limiting
- CORS configuration

## 📈 Monitoring & Analytics

### Tracking Events
- Kart tıklama sayıları
- Admin işlem logları
- Sayfa performans metrikleri
- Error tracking

### Dashboard Metrikleri
- Popüler kartlar
- Kullanıcı etkileşimleri
- Sistem performansı
- Error rates

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Database migration test
- [ ] API endpoint testing
- [ ] Admin interface testing
- [ ] Frontend integration testing
- [ ] Performance testing
- [ ] Security audit

### Post-deployment
- [ ] Monitoring setup
- [ ] Analytics configuration
- [ ] Backup verification
- [ ] User training
- [ ] Documentation update

## 📋 User Stories & Acceptance Criteria

### Epic: Kurumsal Sayfa Dinamik İçerik Yönetimi

#### Story 1: Admin - Kurumsal Kart Oluşturma
**As an** admin user
**I want to** create new corporate cards
**So that** I can add new executives or departments to the corporate page

**Acceptance Criteria:**
- [ ] Admin can access "Kurumsal Yönetimi" from dashboard menu
- [ ] "Yeni Kart Ekle" button is prominently displayed
- [ ] Form includes all required fields (title, type, colors)
- [ ] Image upload uses GlobalMediaSelector with /media/kurumsal/ folder
- [ ] Color picker allows custom colors and preset options
- [ ] Preview shows real-time changes
- [ ] Validation prevents duplicate titles
- [ ] Success message confirms card creation
- [ ] New card appears in management list immediately

#### Story 2: Admin - Kart Sıralama
**As an** admin user
**I want to** reorder corporate cards using drag and drop
**So that** I can control the display order on the frontend

**Acceptance Criteria:**
- [ ] Cards display in sortable grid layout
- [ ] Drag handles are clearly visible
- [ ] Smooth drag and drop animation
- [ ] Real-time order number updates
- [ ] Auto-save after reordering
- [ ] Undo functionality for accidental changes
- [ ] Loading state during save operation
- [ ] Error handling for failed saves

#### Story 3: Admin - Kart Düzenleme
**As an** admin user
**I want to** edit existing corporate cards
**So that** I can update information when needed

**Acceptance Criteria:**
- [ ] Edit button on each card in management view
- [ ] Form pre-populated with existing data
- [ ] All fields are editable
- [ ] Image replacement functionality
- [ ] Color theme updates reflect immediately in preview
- [ ] Cancel option discards changes
- [ ] Validation prevents invalid data
- [ ] Success confirmation after save
- [ ] Changes reflect on frontend immediately

#### Story 4: Visitor - Kurumsal Sayfa Görüntüleme
**As a** website visitor
**I want to** view the corporate page with dynamic content
**So that** I can learn about the organization's leadership and structure

**Acceptance Criteria:**
- [ ] Page loads within 2 seconds
- [ ] All active cards display in correct order
- [ ] Responsive design works on all devices
- [ ] Images load with proper optimization
- [ ] Hover effects work smoothly
- [ ] Clickable cards navigate to target URLs
- [ ] Breadcrumb navigation is functional
- [ ] SEO meta tags are properly set
- [ ] Accessibility standards are met

#### Story 5: Admin - Sayfa Ayarları
**As an** admin user
**I want to** configure corporate page settings
**So that** I can customize the overall page appearance and behavior

**Acceptance Criteria:**
- [ ] Page title and meta description editable
- [ ] Header image upload functionality
- [ ] Intro text rich editor
- [ ] Breadcrumb toggle option
- [ ] Custom CSS input field
- [ ] SEO slug customization
- [ ] Page active/inactive toggle
- [ ] Preview mode shows changes
- [ ] Settings save with confirmation

## 🎯 Implementation Phases Detail

### Phase 1: Foundation (Days 1-2)
**Goal:** Establish data structure and basic API

**Tasks:**
- Database schema design and migration
- Seed data creation with current page content
- Basic CRUD API endpoints
- Input validation and error handling
- Unit tests for API endpoints

**Deliverables:**
- Working database schema
- Functional API endpoints
- Test coverage > 80%
- API documentation

### Phase 2: Admin Interface (Days 3-6)
**Goal:** Complete admin management interface

**Tasks:**
- Admin dashboard integration
- Card management interface
- Drag & drop functionality
- Image upload integration
- Color picker component
- Form validation and UX
- Preview functionality

**Deliverables:**
- Fully functional admin interface
- User-friendly card management
- Image upload working
- Responsive admin design

### Phase 3: Frontend Integration (Days 7-9)
**Goal:** Dynamic frontend implementation

**Tasks:**
- API service layer
- React components development
- Responsive grid layout
- Loading states and error handling
- Performance optimization
- SEO implementation

**Deliverables:**
- Dynamic corporate page
- Mobile-responsive design
- Fast loading performance
- SEO-optimized content

### Phase 4: Enhancement & Polish (Days 10-12)
**Goal:** Advanced features and optimization

**Tasks:**
- Rich text editor for descriptions
- Analytics integration
- Caching implementation
- Advanced admin features
- Comprehensive testing
- Documentation completion

**Deliverables:**
- Enhanced content editing
- Performance monitoring
- Complete documentation
- Production-ready system
