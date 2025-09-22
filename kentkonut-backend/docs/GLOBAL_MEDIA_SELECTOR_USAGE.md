# GlobalMediaSelector Kullanım Kılavuzu

## 📋 Genel Bakış

`GlobalMediaSelector` bileşeni, tüm projede tutarlı medya seçimi için kullanılan merkezi bir bileşendir. Bu bileşen sayesinde:

- ✅ **Tutarlı UX**: Tüm projede aynı medya seçim deneyimi
- ✅ **Kategori Bazlı**: Farklı kategorilerde otomatik açılma
- ✅ **Boyut Kısıtlaması**: Hedef boyutlara göre crop ve ölçeklendirme
- ✅ **Klasör Yönetimi**: Özel klasörlerde dosya yönetimi
- ✅ **Galeri + Upload**: Hem mevcut dosyalardan seçim hem yeni yükleme

## 🚀 Temel Kullanım

```tsx
import { GlobalMediaSelector } from '@/components/media/GlobalMediaSelector';

// En basit kullanım
<GlobalMediaSelector
  onSelect={(media) => console.log('Seçilen:', media)}
/>
```

## 📝 Parametreler

### 🔧 Zorunlu Parametreler
- **`onSelect`** - `(media: GlobalMediaFile) => void` - Medya seçildiğinde çağrılacak fonksiyon

### 🎨 Opsiyonel Parametreler

#### **Temel Ayarlar**
- **`trigger`** - `React.ReactNode` - Modal açan buton
- **`title`** - `string` - Modal başlığı
- **`description`** - `string` - Modal açıklaması
- **`buttonText`** - `string` - Buton metni (varsayılan: "Medya Seç")

#### **Kategori Ayarları**
- **`defaultCategory`** - Kategori seçenekleri:
  - `'content-images'` - İçerik Resimleri
  - `'project-images'` - Projeler
  - `'news-images'` - Haberler
  - `'banner-images'` - Bannerlar
  - `'corporate-images'` - Kurumsal
  - `'department-images'` - Birimler
  - `'general'` - Genel
- **`categoryId`** - `number` - Doğrudan kategori ID'si
- **`restrictToCategory`** - `boolean` - Sadece belirtilen kategoriden seçim

#### **Boyut ve Dosya Ayarları**
- **`acceptedTypes`** - `string[]` - Kabul edilen dosya tipleri (varsayılan: `['image/*']`)
- **`targetWidth`** - `number` - Hedef resim genişliği (varsayılan: 800)
- **`targetHeight`** - `number` - Hedef resim yüksekliği (varsayılan: 600)
- **`width`** - `number` - Genişlik parametresi (varsayılan: 800)
- **`height`** - `number` - Yükseklik parametresi (varsayılan: 600)

#### **Seçim Ayarları**
- **`selectedMedia`** - `GlobalMediaFile | null` - Mevcut seçili medya
- **`showPreview`** - `boolean` - Seçili medyanın önizlemesini göster

#### **Çoklu Seçim**
- **`multiSelect`** - `boolean` - Çoklu seçim yapılsın mı?
- **`onMultiSelect`** - `(media: GlobalMediaFile[]) => void` - Çoklu seçim callback
- **`selectedItems`** - `GlobalMediaFile[]` - Ön seçili medyalar

#### **Klasör Ayarları**
- **`customFolder`** - `string` - Özel upload klasörü (varsayılan: 'media')

## 📂 Klasör Yapısı

```
public/
├── media/           # Varsayılan klasör
│   ├── banners/     # Banner görselleri
│   ├── projects/    # Proje görselleri
│   ├── news/        # Haber görselleri
│   └── content/     # İçerik görselleri
```

## 🎯 Kullanım Örnekleri

### 1. Basit Medya Seçimi
```tsx
<GlobalMediaSelector
  onSelect={(media) => setSelectedImage(media)}
  buttonText="Görsel Seç"
/>
```

### 2. Banner Görseli Seçimi
```tsx
<GlobalMediaSelector
  onSelect={handleBannerSelect}
  defaultCategory="banner-images"
  width={1200}
  height={400}
  customFolder="banners"
  buttonText="Banner Görseli Seç"
  title="Banner Görseli Seç"
  description="Banner için görsel seçin veya yükleyin"
  restrictToCategory={true}
/>
```

### 3. Proje Galerisi
```tsx
<GlobalMediaSelector
  onSelect={handleProjectImageSelect}
  defaultCategory="project-images"
  width={800}
  height={600}
  customFolder="projects"
  buttonText="Proje Görseli Seç"
  multiSelect={true}
  onMultiSelect={handleMultipleImages}
/>
```

### 4. Haber Görseli
```tsx
<GlobalMediaSelector
  onSelect={handleNewsImageSelect}
  defaultCategory="news-images"
  width={800}
  height={450}
  customFolder="news"
  buttonText="Haber Görseli Seç"
  acceptedTypes={['image/*']}
/>
```

### 5. İçerik Görseli
```tsx
<GlobalMediaSelector
  onSelect={handleContentImageSelect}
  defaultCategory="content-images"
  width={800}
  height={600}
  customFolder="content"
  buttonText="İçerik Görseli Seç"
  showPreview={true}
  selectedMedia={currentImage}
/>
```

## 🔧 Hook Kullanımı

```tsx
import { useGlobalMediaSelector } from '@/components/media/GlobalMediaSelector';

function MyComponent() {
  const { selectedMedia, handleSelect, clearSelection } = useGlobalMediaSelector();

  return (
    <div>
      <GlobalMediaSelector onSelect={handleSelect} />
      {selectedMedia && (
        <div>
          <img src={selectedMedia.url} alt={selectedMedia.alt} />
          <button onClick={clearSelection}>Temizle</button>
        </div>
      )}
    </div>
  );
}
```

## 🎨 Özel Trigger Butonu

```tsx
const customTrigger = (
  <Button variant="outline" className="w-full">
    <Image className="w-4 h-4 mr-2" />
    {selectedMedia ? selectedMedia.originalName : "Özel Buton"}
  </Button>
);

<GlobalMediaSelector
  onSelect={handleSelect}
  trigger={customTrigger}
  selectedMedia={selectedMedia}
/>
```

## 📊 GlobalMediaFile Tipi

```tsx
interface GlobalMediaFile {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  caption?: string;
  thumbnailSmall?: string;
  thumbnailMedium?: string;
  thumbnailLarge?: string;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
}
```

## 🚀 Özellikler

### ✅ **Otomatik Kategori Yönetimi**
- Kategori bazlı otomatik başlık ve açıklama
- Kategori kısıtlaması
- Varsayılan kategori ayarları

### ✅ **Boyut Kısıtlaması**
- Hedef boyutlara göre crop ekranı
- Otomatik ölçeklendirme
- Boyut validasyonu

### ✅ **Klasör Yönetimi**
- Özel klasör desteği
- Varsayılan 'media' klasörü
- Klasör bazlı dosya organizasyonu

### ✅ **Gelişmiş UX**
- Galeri + Upload seçenekleri
- Önizleme desteği
- Çoklu seçim
- Arama ve filtreleme

### ✅ **Tip Güvenliği**
- TypeScript desteği
- GlobalMediaFile tipi
- Hook desteği

## 🔄 Güncelleme Geçmişi

- **v2.0**: Width/height parametreleri eklendi
- **v2.0**: Custom folder desteği eklendi
- **v2.0**: Default 'media' klasörü ayarlandı
- **v1.0**: Temel medya seçim özellikleri

Bu bileşen artık tüm projede tutarlı ve güçlü bir medya seçim deneyimi sağlar! 🎉 