# GlobalMediaSelector & MediaSelector Kullanım Rehberi

Bu rehber, **GlobalMediaSelector** ve **MediaSelector** bileşenlerini başka bir React projesinde kolayca kullanabilmeniz için hazırlanmıştır. Hiç ön bilginiz olmasa bile, adım adım uygulayarak medya seçici modalını projenize entegre edebilirsiniz.

---

## 1. Amaç ve Genel Bakış
- **GlobalMediaSelector**: Proje genelinde, görsel/medya seçimi ve yüklemesi için kullanılan, özelleştirilebilir bir modal/select componentidir.
- **MediaSelector**: Asıl galeri, yükleme ve seçim işlemlerini yapan alt componenttir. Modalı ve dosya yönetimini içerir.

---

## 2. Gereksinimler ve Bağımlılıklar

### Zorunlu Paketler
- React (>=18)
- UI kütüphanesi: [shadcn/ui](https://ui.shadcn.com/) veya [Radix UI](https://www.radix-ui.com/) (Dialog, Tabs, Button, Input vs.)
- fetch veya axios (API çağrıları için)
- Bir backend API (ör: `/api/media` gibi, örnek kod aşağıda)

### Önerilen Klasör Yapısı
```
components/
  MediaSelector.tsx
  GlobalMediaSelector.tsx
  ui/
    dialog.tsx
    tabs.tsx
    button.tsx
    input.tsx
```

---

## 3. MediaSelector Componenti

### components/MediaSelector.tsx
```tsx
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export interface MediaFile {
  id: number;
  filename: string;
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

interface MediaSelectorProps {
  onSelect: (media: MediaFile) => void;
  selectedMedia?: MediaFile | null;
  trigger: React.ReactNode;
  title?: string;
  description?: string;
  acceptedTypes?: string[];
  customFolder?: string;
}

export const MediaSelector: React.FC<MediaSelectorProps> = ({
  onSelect,
  selectedMedia,
  trigger,
  title = "Medya Seç",
  description,
  acceptedTypes = ["image/*"],
  customFolder = "media",
}) => {
  const [open, setOpen] = useState(false);
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [tab, setTab] = useState<"gallery" | "upload">("gallery");
  const [uploading, setUploading] = useState(false);

  // Galeri verisini çek
  const fetchMedia = async () => {
    const res = await fetch(`/api/media?customFolder=${customFolder}`);
    const data = await res.json();
    setMediaList(data.data || []);
  };

  React.useEffect(() => {
    if (open && tab === "gallery") fetchMedia();
  }, [open, tab]);

  // Dosya yükle
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("customFolder", customFolder);
    await fetch("/api/media", { method: "POST", body: formData });
    setUploading(false);
    setTab("gallery");
    fetchMedia();
  };

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <div className="text-sm text-gray-500">{description}</div>}
          </DialogHeader>
          <Tabs value={tab} onValueChange={setTab as any}>
            <TabsList>
              <TabsTrigger value="gallery">Galeri</TabsTrigger>
              <TabsTrigger value="upload">Yükle</TabsTrigger>
            </TabsList>
            <TabsContent value="gallery">
              <div className="grid grid-cols-3 gap-4 mt-4">
                {mediaList.length === 0 && <div>Hiç dosya yok</div>}
                {mediaList.map((media) => (
                  <div
                    key={media.id}
                    className={`border rounded p-2 cursor-pointer ${selectedMedia?.id === media.id ? "border-blue-500" : ""}`}
                    onClick={() => { onSelect(media); setOpen(false); }}
                  >
                    <img src={media.url} alt={media.originalName} className="w-full h-24 object-cover" />
                    <div className="text-xs mt-1">{media.originalName}</div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="upload">
              <div className="mt-4">
                <Input type="file" accept={acceptedTypes.join(",")} onChange={handleUpload} disabled={uploading} />
                {uploading && <div>Yükleniyor...</div>}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};
```

---

## 4. GlobalMediaSelector Componenti

### components/GlobalMediaSelector.tsx
```tsx
import React from "react";
import { MediaSelector, MediaFile } from "./MediaSelector";
import { Button } from "./ui/button";
import { Image } from "lucide-react";

interface GlobalMediaSelectorProps {
  onSelect: (media: MediaFile) => void;
  selectedMedia?: MediaFile | null;
  buttonText?: string;
  title?: string;
  description?: string;
  acceptedTypes?: string[];
  customFolder?: string;
}

export const GlobalMediaSelector: React.FC<GlobalMediaSelectorProps> = ({
  onSelect,
  selectedMedia,
  buttonText = "Medya Seç",
  title = "Medya Seç",
  description,
  acceptedTypes = ["image/*"],
  customFolder = "media",
}) => {
  const trigger = (
    <Button type="button" variant="outline" className="w-full">
      <Image className="w-4 h-4 mr-2" />
      {selectedMedia ? selectedMedia.originalName : buttonText}
    </Button>
  );

  return (
    <MediaSelector
      onSelect={onSelect}
      selectedMedia={selectedMedia}
      trigger={trigger}
      title={title}
      description={description}
      acceptedTypes={acceptedTypes}
      customFolder={customFolder}
    />
  );
};
```

---

## 5. Kullanım Örneği

```tsx
import React, { useState } from "react";
import { GlobalMediaSelector, MediaFile } from "./components/GlobalMediaSelector";

export default function BannerForm() {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);

  return (
    <div>
      <h2>Banner Görseli</h2>
      <GlobalMediaSelector
        onSelect={setSelectedMedia}
        selectedMedia={selectedMedia}
        buttonText="Banner Görseli Seç"
        title="Banner Görseli Seç"
        description="Banner için görsel seçin veya yükleyin"
        acceptedTypes={["image/*"]}
        customFolder="banners"
      />
      {selectedMedia && (
        <div className="mt-4">
          <img src={selectedMedia.url} alt={selectedMedia.originalName} className="w-48 h-24 object-cover" />
          <div>{selectedMedia.originalName}</div>
        </div>
      )}
    </div>
  );
}
```

---

## 6. Backend API Gereksinimi

### /api/media GET (Galeri)
```js
// Express.js örneği
app.get('/api/media', (req, res) => {
  // customFolder parametresine göre dosya listesini döndür
  res.json({ data: [
    // ...
    { id: 1, filename: 'foo.png', url: '/uploads/foo.png', originalName: 'foo.png', size: 12345, mimeType: 'image/png', createdAt: '...' }
  ] });
});
```

### /api/media POST (Yükleme)
```js
// Express.js örneği
app.post('/api/media', upload.single('file'), (req, res) => {
  // Dosyayı kaydet, customFolder parametresini kullan
  res.status(201).json({ success: true });
});
```

---

## 7. UI Bileşenleri
- `Dialog`, `Tabs`, `Button`, `Input` gibi UI componentlerini shadcn/ui, radix-ui veya kendi componentlerinle sağlayabilirsin.
- Kendi UI componentlerin yoksa, [shadcn/ui](https://ui.shadcn.com/) veya [Radix UI](https://www.radix-ui.com/) kullanabilirsin.

---

## 8. Ekstra: Çoklu Seçim
- Çoklu seçim için MediaSelector’a `multiSelect`, `onMultiSelect`, `selectedItems` gibi props ekleyebilirsin.
- Kodda örnek olarak eklenmemiştir, ihtiyaca göre genişletilebilir.

---

## 9. Entegrasyon Adımları
1. `components/MediaSelector.tsx` ve `components/GlobalMediaSelector.tsx` dosyalarını projenize ekleyin.
2. UI componentlerini (Dialog, Tabs, Button, Input) projenize uygun şekilde ekleyin veya uyarlayın.
3. Backend API endpointlerini kendi projenize göre güncelleyin.
4. Kullanmak istediğiniz yerde `<GlobalMediaSelector ... />` ile entegre edin.

---

## 10. Sıkça Sorulan Sorular

### S: Farklı klasörlere yükleme yapabilir miyim?
C: Evet, `customFolder` propunu değiştirerek farklı klasörlere yükleme yapabilirsiniz.

### S: Sadece görsel değil, video veya PDF seçimi de mümkün mü?
C: `acceptedTypes` propunu örneğin `["image/*", "application/pdf"]` olarak ayarlayabilirsiniz.

### S: Modal açma/kapama kontrolünü kendim yönetebilir miyim?
C: Evet, MediaSelector componentini daha da özelleştirerek open state'ini dışarıdan yönetebilirsiniz.

---

## 11. Sonuç
Bu rehberde, GlobalMediaSelector ve MediaSelector componentlerini baştan sona başka bir projede kullanmak için ihtiyacınız olan her şeyi bulabilirsiniz. Kodları kopyalayıp projenize ekleyin, backend API'nizi uyarlayın ve hemen kullanmaya başlayın!

Sorularınız olursa veya daha fazla özelleştirme isterseniz, bu rehberi genişletebilirsiniz. 