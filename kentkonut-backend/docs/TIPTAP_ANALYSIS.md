# TipTap Editör Geliştirme Analizi ve Öneriler

## Mevcut Durum Analizi

### Eski RichTextEditor.tsx:
- ❌ `document.execCommand` kullanıyor (deprecated)
- ✅ Temel resim hizalama (sol, orta, sağ)
- ✅ Alt text desteği
- ✅ Media gallery entegrasyonu
- ❌ Resim boyutlandırma (resize) yok
- ❌ Modern TipTap özelliklerini kullanmıyor

### Yeni AdvancedTipTapEditor.tsx:
- ✅ Gerçek TipTap implementasyonu
- ✅ ResizeImage extension ile resize desteği
- ✅ Gelişmiş resim boyutlandırma (genişlik/yükseklik)
- ✅ Metin rengi desteği
- ✅ Undo/Redo işlemleri
- ✅ Metin hizalama (sol, orta, sağ)
- ✅ Dropcursor ve Gapcursor
- ✅ Daha iyi UX

## Yeni Özellikler

### 1. Resim Boyutlandırma
```typescript
// Resim ekleme sırasında boyut belirleme
insertImage(media, width, height, altText)

// Hazır boyut seçenekleri
- Küçük (200px)
- Orta (400px)  
- Büyük (600px)
- Özel boyut
```

### 2. Gelişmiş Toolbar
- Bold, Italic, Underline
- Heading 1, 2, 3
- Bullet/Ordered Lists
- Blockquote, Code
- Text align (left, center, right)
- Text color picker
- Undo/Redo

### 3. Drag & Drop Desteği
- Dropcursor: Sürüklenebilir öğeler için görsel geri bildirim
- Gapcursor: Boş alanlarda cursor yerleştirme

### 4. Resize Handles
- Resimler editörde doğrudan resize edilebilir
- Visual resize handles

## Kurulum

### Gerekli Paketler:
```bash
npm install @tiptap/extension-dropcursor @tiptap/extension-gapcursor prosemirror-utils prosemirror-view tiptap-extension-resize-image
```

### Import Kullanımı:
```typescript
// Yeni editörü kullanmak için
import { AdvancedTipTapEditor } from '@/components/editor/AdvancedTipTapEditor';

// Veya index.ts üzerinden
import { RichTextEditor } from '@/components/editor';
```

## CSS Stilleri

### TipTap Editor Stilleri:
- `.tiptap-editor-wrapper`: Ana wrapper
- `.ProseMirror`: Editör içeriği
- `.tiptap-image`: Resim stilleri
- `.tiptap-link`: Link stilleri
- Resize handles için özel stiller

### Responsive Tasarım:
- Mobile-first yaklaşım
- Toolbar responsive grid
- Modal responsive layout

## Gelecek Geliştirmeler

### 1. Tablo Desteği
```typescript
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
```

### 2. Mention Sistemi
```typescript
import Mention from '@tiptap/extension-mention';
```

### 3. Collaboration
```typescript
import Collaboration from '@tiptap/extension-collaboration';
```

### 4. Math/LaTeX Desteği
```typescript
import Mathematics from '@tiptap/extension-mathematics';
```

### 5. Video Embed
```typescript
import Youtube from '@tiptap/extension-youtube';
```

## Performans Optimizasyonları

### 1. Lazy Loading:
```typescript
const TipTapEditor = lazy(() => import('./AdvancedTipTapEditor'));
```

### 2. Debounced Updates:
```typescript
const debouncedOnChange = useMemo(
  () => debounce(onChange, 300),
  [onChange]
);
```

### 3. Content Sanitization:
```typescript
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(htmlContent);
```

## Kullanım Örnekleri

### Temel Kullanım:
```tsx
<AdvancedTipTapEditor
  value={content}
  onChange={setContent}
  placeholder="İçerik yazın..."
  label="İçerik"
  minHeight={300}
/>
```

### Gelişmiş Konfigürasyon:
```tsx
<AdvancedTipTapEditor
  value={content}
  onChange={setContent}
  placeholder="Detaylı içerik yazın..."
  label="Makale İçeriği"
  minHeight={500}
/>
```

## Migration Rehberi

### Eski RichTextEditor'den Geçiş:
1. Import'ları güncelle
2. Props aynı kalıyor
3. CSS class'ları kontrol et
4. Test et

### Özel Extensions Ekleme:
```typescript
const editor = useEditor({
  extensions: [
    // Mevcut extensions...
    CustomExtension.configure({
      // Konfigürasyon
    }),
  ],
});
```

## Sorun Giderme

### Yaygın Sorunlar:
1. **ResizeImage çalışmıyor**: Paket kurulumunu kontrol et
2. **CSS stilleri yok**: globals.css'e stiller eklendiğinden emin ol
3. **Performance sorunları**: Debounce kullan
4. **Mobile responsive değil**: CSS media queries kontrol et

### Debug Araçları:
```typescript
// Editor durumunu kontrol et
console.log(editor.getJSON());
console.log(editor.getHTML());
console.log(editor.getAttributes('image'));
```
