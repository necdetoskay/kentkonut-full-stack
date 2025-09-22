# Kent Konut Kurumsal Sayfa Planı

## 1. Veri Yapısı Planı

### Ana Menü İçin Veri Modeli
```typescript
interface MenuItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  order: number;
  parentId?: number;
}
```

### Hızlı Erişim Menüsü İçin Veri Modeli
```typescript
interface QuickAccessMenu {
  id: number;
  pageId: number; // Hangi sayfaya ait olduğu
  menuItems: QuickAccessMenuItem[];
}

interface QuickAccessMenuItem {
  id: number;
  title: string;
  link: string;
  order: number;
  isCustom: boolean; // Özel link mi yoksa ana menüden mi?
}
```

## 2. Sayfa Yapısı Planı

### Komponent Hiyerarşisi
1. **KurumsalLayout**
   - Tüm kurumsal sayfalar için ana layout
   - Navbar, Footer ve içerik alanını içerecek

2. **KurumsalContent**
   - İçerik alanı komponenti
   - Sol tarafta ana içerik
   - Sağ tarafta QuickAccessMenu

3. **QuickAccessMenu**
   - Hızlı erişim menüsü komponenti
   - Dinamik olarak sayfalara göre özelleştirilebilir
   - Yönetilebilir menü yapısı

## 3. Yönetim Sistemi Planı

### Admin Panel Özellikleri
1. **Ana Menü Yönetimi**
   - Menü öğelerini ekleme/düzenleme/silme
   - Sıralama yapabilme
   - İçerik düzenleme

2. **Hızlı Erişim Menüsü Yönetimi**
   - Her sayfa için özel menü oluşturabilme
   - Var olan menü öğelerini seçebilme
   - Özel linkler ekleyebilme
   - Sıralama yapabilme

## 4. Veritabanı Şeması

```sql
-- Ana Menü Tablosu
CREATE TABLE menu_items (
    id INT PRIMARY KEY,
    title VARCHAR(255),
    slug VARCHAR(255),
    content TEXT,
    order_num INT,
    parent_id INT NULL
);

-- Hızlı Erişim Menüsü Tablosu
CREATE TABLE quick_access_menus (
    id INT PRIMARY KEY,
    page_id INT,
    title VARCHAR(255)
);

-- Hızlı Erişim Menü Öğeleri
CREATE TABLE quick_access_menu_items (
    id INT PRIMARY KEY,
    menu_id INT,
    title VARCHAR(255),
    link VARCHAR(255),
    order_num INT,
    is_custom BOOLEAN
);
```

## 5. API Endpoint Planı

```typescript
// Ana Menü Endpointleri
GET /api/menu-items
GET /api/menu-items/:id
POST /api/menu-items
PUT /api/menu-items/:id
DELETE /api/menu-items/:id

// Hızlı Erişim Menüsü Endpointleri
GET /api/quick-access/:pageId
POST /api/quick-access
PUT /api/quick-access/:id
DELETE /api/quick-access/:id
```

## 6. Özellik ve İşlevsellik Planı

1. **Dinamik Menü Yapısı**
   - Ana menü öğeleri dinamik olarak yüklenecek
   - Alt menüler desteklenecek
   - Sıralama özelliği olacak

2. **Hızlı Erişim Menüsü Özellikleri**
   - Sayfa bazlı özelleştirilebilir
   - Ana menüden öğeler seçilebilir
   - Özel linkler eklenebilir
   - Sürükle-bırak ile sıralama yapılabilir

3. **İçerik Yönetimi**
   - Zengin metin editörü desteği
   - Resim yükleme özelliği
   - SEO dostu URL yapısı

4. **Responsive Tasarım**
   - Mobil uyumlu layout
   - Hızlı erişim menüsü mobilde açılır-kapanır yapıda

## 7. Güvenlik Planı

1. **Yetkilendirme**
   - Role dayalı erişim kontrolü
   - Admin paneli güvenliği
   - API güvenliği

2. **Veri Doğrulama**
   - Form validasyonları
   - API request validasyonları
   - XSS koruması

## 8. Performans Planı

1. **Önbellekleme Stratejisi**
   - Menü yapısı için önbellekleme
   - Sayfa içerikleri için önbellekleme
   - API yanıtları için önbellekleme

2. **Lazy Loading**
   - Resimler için lazy loading
   - Komponentler için gerektiğinde yükleme

## 9. Test Planı

1. **Birim Testleri**
   - Komponent testleri
   - Servis testleri
   - Util fonksiyonları testleri

2. **Entegrasyon Testleri**
   - API entegrasyon testleri
   - Veritabanı işlemleri testleri

3. **E2E Testleri**
   - Kullanıcı senaryoları testleri
   - Admin panel işlemleri testleri 