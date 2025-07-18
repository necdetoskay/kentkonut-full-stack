# Kent Konut Kurumsal Dashboard - Detaylı Yol Haritası

## ✅ Mevcut Durum (Tamamlandı)

### 1. Corporate Ana Dashboard
- **Konum**: `/dashboard/corporate`
- **Durum**: ✅ Tamamlandı
- **Özellikler**:
  - Mevcut modüllerin genel görünümü
  - İstatistik kartları (yöneticiler, hızlı linkler)
  - Hızlı eylem butonları
  - Gelecek özellikler bölümü

### 2. Yöneticiler Modülü
- **Konum**: `/dashboard/corporate/executives`
- **Durum**: ✅ Tamamlandı
- **Özellikler**:
  - Yönetici listesi
  - Yönetici ekleme/düzenleme
  - Tip bazlı filtreleme
  - Hiyerarşi yönetimi

### 3. Hızlı Erişim Linkleri
- **Konum**: `/dashboard/corporate/quick-links`
- **Durum**: ✅ Tamamlandı
- **Özellikler**:
  - Link yönetimi
  - İkon seçimi
  - Sıralama
  - Aktif/pasif durum kontrolü

---

## 🔮 Gelecek Modüller (Öncelik Sırasına Göre)

### Phase 1: Temel Kurumsal Bilgiler

#### 1. Kurumsal Bilgiler Modülü
- **Konum**: `/dashboard/corporate/company-info`
- **Öncelik**: Yüksek
- **Açıklama**: Şirketin temel bilgileri, misyon, vizyon, değerler

**Özellikler**:
- 📄 **Genel Bilgiler**
  - Şirket adı, kuruluş tarihi
  - Adres bilgileri
  - İletişim bilgileri
  - Yasal statü

- 🎯 **Misyon & Vizyon**
  - Misyon metni editörü
  - Vizyon metni editörü
  - Değerler listesi
  - Hedefler

- 📈 **Şirket Profili**
  - Şirket tarihçesi
  - Kilometre taşları
  - Başarı hikayeleri
  - Sayısal veriler

**Teknik Gereksinimler**:
```
- Prisma model: CompanyInfo
- API endpoints: /api/company-info
- Rich text editor (TipTap)
- Image upload (şirket logosu)
- Form validation
```

#### 2. Kurumsal Kimlik Modülü
- **Konum**: `/dashboard/corporate/brand-identity`
- **Öncelik**: Orta
- **Açıklama**: Logo, renk paleti, tipografi, kurumsal kimlik elementleri

**Özellikler**:
- 🎨 **Logo Yönetimi**
  - Ana logo
  - Alternatif logolar
  - Favicon
  - Sosyal medya logoları

- 🌈 **Renk Paleti**
  - Ana renkler
  - Yardımcı renkler
  - Gradient tanımları
  - Hex, RGB, CMYK kodları

- 📝 **Tipografi**
  - Ana font
  - Başlık fontları
  - Font boyutları
  - Line-height değerleri

### Phase 2: Prestij ve Başarılar

#### 3. Ödüller & Sertifikalar Modülü
- **Konum**: `/dashboard/corporate/awards`
- **Öncelik**: Yüksek
- **Açıklama**: Şirketin aldığı ödüller, sertifikalar, başarılar

**Özellikler**:
- 🏆 **Ödül Yönetimi**
  - Ödül adı, veren kurum
  - Tarih, kategori
  - Ödül görseli
  - Açıklama metni

- 📜 **Sertifikalar**
  - ISO sertifikaları
  - Kalite belgeleri
  - Üyelik sertifikaları
  - Geçerlilik tarihleri

- 📊 **Başarı Metrikleri**
  - Proje sayıları
  - Müşteri memnuniyeti
  - Pazar payı
  - Büyüme oranları

**Teknik Gereksinimler**:
```
- Prisma models: Award, Certificate
- File upload (sertifika PDF'leri)
- Date management
- Category system
- Gallery view
```

#### 4. Basında Biz Modülü
- **Konum**: `/dashboard/corporate/press`
- **Öncelik**: Orta
- **Açıklama**: Basın açıklamaları, medyada çıkan haberler

**Özellikler**:
- 📰 **Basın Açıklamaları**
  - Başlık, içerik
  - Yayın tarihi
  - PDF download
  - Medya kiti

- 📺 **Medyada Biz**
  - Haber linkleri
  - Röportajlar
  - TV programları
  - Sosyal medya mentions

### Phase 3: Organizasyon ve İnsan Kaynakları

#### 5. Organizasyon Şeması
- **Konum**: `/dashboard/corporate/organization`
- **Öncelik**: Orta
- **Açıklama**: Şirket yapısı, departmanlar, raporlama ilişkileri

**Özellikler**:
- 🏢 **Departman Yönetimi**
  - Departman adları
  - Departman müdürleri
  - Çalışan sayıları
  - Sorumluluk alanları

- 👥 **Organizasyon Şeması**
  - Hiyerarşik yapı
  - Raporlama ilişkileri
  - Drag & drop düzenleme
  - Görsel şema

- 📋 **Pozisyon Tanımları**
  - İş tanımları
  - Gerekli nitelikler
  - Sorumluluklar
  - Yetkinlikler

#### 6. Kariyer Modülü
- **Konum**: `/dashboard/corporate/careers`
- **Öncelik**: Düşük
- **Açıklama**: İş ilanları, kariyer fırsatları

**Özellikler**:
- 💼 **İş İlanları**
  - Pozisyon adı
  - Departman
  - Nitelikler
  - Başvuru formu

- 🎓 **Gelişim Programları**
  - Eğitim programları
  - Staj imkanları
  - Yetenek programları
  - Kariyer yolları

### Phase 4: Sosyal Sorumluluk ve Sürdürülebilirlik

#### 7. Sosyal Sorumluluk (CSR)
- **Konum**: `/dashboard/corporate/csr`
- **Öncelik**: Orta
- **Açıklama**: CSR projeleri, sosyal sorumluluk faaliyetleri

**Özellikler**:
- 🌱 **CSR Projeleri**
  - Proje adı, açıklama
  - Hedef kitle
  - Süre, bütçe
  - Sonuçlar

- 🌍 **Sürdürülebilirlik**
  - Çevre projeleri
  - Enerji verimliliği
  - Geri dönüşüm
  - Karbon ayak izi

- 🤝 **Gönüllü Programları**
  - Çalışan gönüllülüğü
  - Toplumsal projeler
  - Yardım kampanyaları
  - Eğitim destekleri

#### 8. Sürdürülebilirlik Raporları
- **Konum**: `/dashboard/corporate/sustainability`
- **Öncelik**: Düşük
- **Açıklama**: Sürdürülebilirlik raporları, çevre politikaları

### Phase 5: İletişim ve Etkileşim

#### 9. İletişim Merkezi
- **Konum**: `/dashboard/corporate/contact`
- **Öncelik**: Yüksek
- **Açıklama**: İletişim bilgileri, ofis lokasyonları, iletişim formları

**Özellikler**:
- 📍 **Ofis Lokasyonları**
  - Adres bilgileri
  - Harita entegrasyonu
  - Ulaşım bilgileri
  - Çalışma saatleri

- 📞 **İletişim Bilgileri**
  - Telefon numaraları
  - Email adresleri
  - Departman bazlı iletişim
  - Acil durum iletişimi

- 💬 **İletişim Formları**
  - Genel iletişim formu
  - Müşteri hizmetleri
  - İş başvurusu
  - Basın talepleri

#### 10. Sosyal Medya Yönetimi
- **Konum**: `/dashboard/corporate/social-media`
- **Öncelik**: Düşük
- **Açıklama**: Sosyal medya hesapları, paylaşım takvimi

---

## 🛠️ Teknik Altyapı Gereksinimleri

### Database Models (Prisma)
```prisma
// Kurumsal Bilgiler
model CompanyInfo {
  id          String   @id @default(cuid())
  name        String
  foundedYear Int?
  mission     String?
  vision      String?
  values      Json?
  history     String?
  address     String?
  phone       String?
  email       String?
  website     String?
  logoUrl     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Ödüller
model Award {
  id          String   @id @default(cuid())
  title       String
  issuer      String
  date        DateTime
  category    String?
  description String?
  imageUrl    String?
  order       Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Sertifikalar
model Certificate {
  id          String    @id @default(cuid())
  title       String
  issuer      String
  issueDate   DateTime
  expiryDate  DateTime?
  fileUrl     String?
  category    String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// CSR Projeleri
model CSRProject {
  id          String   @id @default(cuid())
  title       String
  description String?
  startDate   DateTime
  endDate     DateTime?
  budget      Float?
  status      String   @default("ACTIVE")
  category    String?
  imageUrl    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Departmanlar
model Department {
  id          String      @id @default(cuid())
  name        String
  description String?
  managerId   String?
  parentId    String?
  order       Int         @default(0)
  isActive    Boolean     @default(true)
  manager     Executive?  @relation(fields: [managerId], references: [id])
  parent      Department? @relation("DepartmentHierarchy", fields: [parentId], references: [id])
  children    Department[] @relation("DepartmentHierarchy")
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

### API Endpoints
```
/api/company-info       - GET, POST, PUT
/api/awards            - GET, POST, PUT, DELETE
/api/certificates      - GET, POST, PUT, DELETE
/api/csr-projects      - GET, POST, PUT, DELETE
/api/departments       - GET, POST, PUT, DELETE
/api/press-releases    - GET, POST, PUT, DELETE
/api/contact-info      - GET, POST, PUT
```

### Component Structure
```
components/
├── corporate/
│   ├── company-info/
│   │   ├── CompanyInfoForm.tsx
│   │   ├── MissionVisionEditor.tsx
│   │   └── CompanyStatsCard.tsx
│   ├── awards/
│   │   ├── AwardFormModal.tsx
│   │   ├── AwardCard.tsx
│   │   └── AwardGallery.tsx
│   ├── certificates/
│   │   ├── CertificateUpload.tsx
│   │   ├── CertificateList.tsx
│   │   └── CertificateViewer.tsx
│   └── organization/
│       ├── OrgChart.tsx
│       ├── DepartmentEditor.tsx
│       └── PositionCard.tsx
```

---

## 📊 Implementasyon Öncelikleri

### Faz 1 (1-2 hafta)
1. ✅ Corporate Dashboard (Tamamlandı)
2. 🔄 Kurumsal Bilgiler Modülü
3. 🔄 İletişim Merkezi

### Faz 2 (2-3 hafta)
4. Ödüller & Sertifikalar
5. Basında Biz Modülü
6. Kurumsal Kimlik

### Faz 3 (3-4 hafta)
7. Organizasyon Şeması
8. CSR Projeleri
9. Sosyal Medya Yönetimi

### Faz 4 (4-5 hafta)
10. Kariyer Modülü
11. Sürdürülebilirlik Raporları
12. İleri düzey özellikler

---

Bu yol haritası, Kent Konut projesinin kurumsal yönetim bölümünü tam anlamıyla profesyonel bir seviyeye çıkaracak ve şirketin dijital varlığını güçlendirecektir.
