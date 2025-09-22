## UnifiedTinyMCEEditor Kullanımı

Gelişmiş TinyMCE bileşeni; zengin toolbar, TR dil desteği, quickbars, medya/galeri entegrasyonu, önizleme/HTML/Debug/Console panelleri ile birlikte gelir.

### İçe aktarma

```tsx
import { UnifiedTinyMCEEditor, type UnifiedTinyMCEEditorRef } from '@/components/tinymce';
```

### Basit örnek

```tsx
const [content, setContent] = useState('<p>Merhaba</p>');
const editorRef = useRef<UnifiedTinyMCEEditorRef>(null);

<UnifiedTinyMCEEditor
  ref={editorRef}
  value={content}
  onChange={setContent}
  enableGallery
/>;
```

### Props

- `value`, `onChange(content)`
- `height` (varsayılan 400)
- `menubar` (boolean veya string)
- `apiKey` (TinyMCE Cloud key)
- `language` (varsayılan `tr`), `languageUrl`
- `enableGallery` (varsayılan `true`) – `GlobalMediaSelector` ile resim ekler
- `galleryButtonText` (varsayılan `Galeri`)
- Görsel paneller: `showPreviewPane`, `showHtmlPane`, `showDebugPane`, `showConsolePane`
- `toolbarOverride` ve `pluginsOverride` (tam kontrol için)
- `contentStyle` (ek CSS)

### Ref API

- `getContent()` – mevcut HTML içeriği döndürür
- `focus()` – editörü odağa alır
- `insertImage({ url, alt, width, height })` – imaj HTML’i ekler

### Toolbar/Plugins (varsayılan)

- Toolbar: tarihçe, stiller, font ailesi/boyutu/lineheight, metin vurguları, renkler, hizalama, listeler, link, image, media, charmap, emoticons, hr, pagebreak, table, arama/değiştir, code, preview, fullscreen, ltr/rtl, `customgallery`, help
- Plugins: `advlist autolink lists link image charmap anchor searchreplace visualblocks code fullscreen insertdatetime media table preview help wordcount emoticons hr pagebreak nonbreaking directionality quickbars`


