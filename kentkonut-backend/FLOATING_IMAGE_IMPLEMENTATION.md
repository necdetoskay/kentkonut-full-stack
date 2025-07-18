# TipTap Editor - Floating Resim Özelliği İmplementasyonu

## 📋 Özet

TipTap editörüne **text içi floating resim özelliği** başarıyla eklendi. Artık kullanıcılar resimleri text içinde sağa, sola float edebilir ve text resmin etrafına sarılır.

## ✅ Eklenen Özellikler

### 1. Floating Resim Seçenekleri
- **Sol Float (Text Sarması)**: `float-left` - Resim sola yaslanır, text sağ tarafına sarılır
- **Sağ Float (Text Sarması)**: `float-right` - Resim sağa yaslanır, text sol tarafına sarılır
- **Float Yok**: `float-none` - Normal blok resim davranışı
- **Geleneksel hizalamalar**: Sol, Merkez, Sağ blok hizalamaları korundu

### 2. CSS Implementasyonu
```css
/* Floating stilleri globals.css'e eklendi */
.tiptap-image-container.tiptap-image-float-left {
  float: left;
  clear: left;
  margin: 0 16px 16px 0;
  max-width: 50%;
}

.tiptap-image-container.tiptap-image-float-right {
  float: right;
  clear: right;
  margin: 0 0 16px 16px;
  max-width: 50%;
}

.tiptap-image-container.tiptap-image-float-none {
  float: none;
  clear: both;
  display: block;
  margin: 16px auto;
}
```

### 3. Editör Geliştirmeleri
- **Dialog Sistemı**: Gelişmiş resim ekleme modal'ı
- **Önizleme**: Floating seçenekleri için text sarması demonstrasyonu
- **MediaSelector**: Galeri entegrasyonu
- **Alt Text**: Erişilebilirlik desteği

## 🎯 Kullanım Kılavuzu

### Editörde Floating Resim Ekleme:
1. TipTap editöründe içerik yazın
2. **Resim Ekle** butonuna tıklayın
3. Resim URL'si girin veya galeriden seçin
4. **Hizalama** dropdown'ından seçin:
   - `Sol Float (Text Sarması)` - Text resmin yanına sarılır
   - `Sağ Float (Text Sarması)` - Text resmin yanına sarılır
   - Diğer seçenekler normal blok davranışı
5. **Önizleme** bölümünde sonucu görün
6. **Resim Ekle** ile onaylayın

### HTML Çıktısı:
```html
<!-- Sol Float -->
<div class="tiptap-image-container tiptap-image-float-left">
  <img src="..." alt="..." data-align="float-left" class="tiptap-image" />
</div>

<!-- Sağ Float -->
<div class="tiptap-image-container tiptap-image-float-right">
  <img src="..." alt="..." data-align="float-right" class="tiptap-image" />
</div>
```

## 📁 Değiştirilen Dosyalar

### 1. `components/ui/rich-text-editor-tiptap.tsx`
- `insertImage` fonksiyonu güncellendi
- Dialog seçenekleri genişletildi
- Floating önizleme eklendi
- State management geliştirmeleri

### 2. `app/globals.css`
- Floating CSS stilleri eklendi
- Clearfix desteği
- Responsive davranış
- Editor/preview uyumluluğu

### 3. `scripts/test-floating-image-new.js`
- Test scripti oluşturuldu
- HTML test dosyası generator
- Floating örnekleri

## 🧪 Test Dosyaları

### Test HTML Sayfası:
- **URL**: `http://localhost:3001/floating-test.html`
- **İçerik**: Floating resim örnekleri ve text sarması demonstrasyonu
- **Test Durumları**: Sol float, sağ float, normal blok

### Test Scriptini Çalıştırma:
```bash
node scripts/test-floating-image-new.js
```

## 🎨 Görsel Örnekler

### Sol Float:
```
[RESİM]     Bu text resmin yanında
            yer alıyor ve sağ tarafa
            doğru sarılıyor...
            
            Bu paragraf da devam
            ediyor resmin yanında.
```

### Sağ Float:
```
Bu text resmin yanında     [RESİM]
yer alıyor ve sol tarafa
doğru sarılıyor...

Bu paragraf da devam
ediyor resmin yanında.
```

## ⚡ Performans ve Uyumluluk

- **Browser Uyumluluğu**: Modern tarayıcılar
- **Responsive**: Mobilde otomatik küçültme
- **CSS Clearfix**: Float temizleme garantisi
- **Erişilebilirlik**: Alt text desteği
- **SEO Dostu**: Semantic HTML yapısı

## 🔧 Teknik Detaylar

### State Management:
```typescript
const [imageAlign, setImageAlign] = useState('center');
// Seçenekler: 'float-left', 'float-right', 'float-none', 'center', 'left', 'right'
```

### CSS Sınıf Mantığı:
```javascript
if (imageAlign === 'float-left') {
  containerClass += ' tiptap-image-float-left';
} else if (imageAlign === 'float-right') {
  containerClass += ' tiptap-image-float-right';
}
```

## 🎉 Sonuç

Floating resim özelliği başarıyla eklendi! Kullanıcılar artık:
- ✅ Text içi floating resimler ekleyebilir
- ✅ Text sarması görsel deneyimi yaşayabilir  
- ✅ Geleneksel blok hizalamaları da kullanabilir
- ✅ Galeriden resim seçebilir ve önizleme yapabilir

Özellik tüm departman formlarında ve RichTextEditor kullanan sayfalarda aktif!
