Gelişmiş Next.js Uploader Komponenti
Bu doküman, Next.js uygulamaları için geliştirilmiş, dosya listeleme, yükleme, silme ve resim kırpma özelliklerine sahip modüler bir uploader komponentinin nasıl oluşturulacağını adım adım açıklamaktadır.
Proje Yapısı ve Bağımlılıklar
Komponent, Next.js App Router yapısına uygun olarak tasarlanmıştır. Gerekli kütüphaneleri projenize eklemek için aşağıdaki komutu çalıştırın:
Generated bash
npm install react-image-crop lucide-react uuid
npm install --save-dev @types/uuid
Use code with caution.
Bash
react-image-crop: Resim kırpma işlevselliği için.
lucide-react: Modern ve hafif ikonlar için.
uuid: Yüklenen dosyalar için benzersiz isimler oluşturmak amacıyla.
Varsayımlar ve Notlar
Dosya Depolama: Bu örnekte dosyalar, projenin public/uploads klasöründe saklanmaktadır. Bu, geliştirme için pratik olsa da production (canlı) ortamlar için kesinlikle önerilmez. Canlı projelerde AWS S3, Google Cloud Storage, Cloudinary veya Vercel Blob gibi bulut depolama servisleri kullanılmalıdır.
Callback Fonksiyonu: Komponent, işlem tamamlandığında seçilen veya yüklenen dosyaların URL listesini onUploadComplete adlı bir callback prop'u aracılığıyla dışarıya iletir.
Stil: Komponentin stil kodları TailwindCSS kullanılarak yazılmıştır.
Adım 1: TypeScript Tanımları
Proje genelinde tip güvenliği sağlamak için kullanılacak olan tipler. Bu içeriği projenizin kök dizininde types.ts adlı bir dosyaya kaydedin.
types.ts
Generated typescript
// Sunucudan gelen dosya bilgilerinin tipi
export interface FileInfo {
  name: string;
  url: string;
  type: 'image' | 'video' | 'pdf' | 'other';
}

// Uploader komponentimizin alacağı props'ların tipi
export interface UploaderProps {
  /** Dosyaların yönetileceği klasör adı (örn: 'avatars' veya 'products/gallery') */
  folder: string;
  /** Kırpılacak resmin hedef genişliği (aspect ratio için) */
  width: number;
  /** Kırpılacak resmin hedef yüksekliği (aspect ratio için) */
  height: number;
  /** 
   * Yükleme veya seçim tamamlandığında tetiklenir. 
   * Seçilen/yüklenen dosyaların URL'lerini bir dizi olarak döner.
   */
  onUploadComplete: (files: string[]) => void;
  /** Çoklu seçim aktif mi? */
  multiple?: boolean;
}
Use code with caution.
TypeScript
Adım 2: API Rotaları (Sunucu Tarafı)
Dosya işlemlerini yönetecek olan sunucu tarafı kodları.
A. Dosyaları Listeleme ve Silme API'ı
Bu dinamik rota, public/uploads altındaki herhangi bir klasörden dosya okuma ve silme işlemlerini gerçekleştirir.
app/api/files/[...folder]/route.ts
Generated typescript
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { FileInfo } from '@/types';

const UPLOAD_DIR = path.resolve(process.env.ROOT_DIR || process.cwd(), 'public/uploads');

// Klasörün var olduğundan emin ol
const ensureDirectoryExists = async (dir: string) => {
  try {
    await fs.access(dir);
  } catch (error) {
    await fs.mkdir(dir, { recursive: true });
  }
};

const getFileType = (fileName: string): FileInfo['type'] => {
    const extension = path.extname(fileName).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(extension)) {
        return 'image';
    }
    if (['.mp4', '.mov', '.avi', '.webm'].includes(extension)) {
        return 'video';
    }
    if ('.pdf' === extension) {
        return 'pdf';
    }
    return 'other';
}

// [GET] - Belirtilen klasördeki dosyaları listeler
export async function GET(
  request: NextRequest,
  { params }: { params: { folder: string[] } }
) {
  const folderPath = params.folder.join('/');
  const targetDir = path.join(UPLOAD_DIR, folderPath);

  await ensureDirectoryExists(targetDir);

  try {
    const files = await fs.readdir(targetDir);
    const fileInfos: FileInfo[] = files.map(file => ({
      name: file,
      url: `/uploads/${folderPath}/${file}`,
      type: getFileType(file),
    }));
    // En yeni dosyaları en üstte göstermek için sıralama
    return NextResponse.json(fileInfos.sort((a, b) => b.name.localeCompare(a.name)));
  } catch (error) {
    console.error('Error reading directory:', error);
    return NextResponse.json({ message: 'Error listing files' }, { status: 500 });
  }
}


// [DELETE] - Belirtilen dosyayı siler
export async function DELETE(
  request: NextRequest,
  { params }: { params: { folder: string[] } }
) {
  const folderPath = params.folder.join('/');
  const { fileName } = await request.json();

  if (!fileName) {
    return NextResponse.json({ message: 'File name is required' }, { status: 400 });
  }

  const filePath = path.join(UPLOAD_DIR, folderPath, fileName);

  try {
    await fs.unlink(filePath);
    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ message: 'Error deleting file' }, { status: 500 });
  }
}
Use code with caution.
TypeScript
B. Dosya Yükleme API'ı
Bu rota, hem direkt dosyaları (PDF, video vb.) hem de kırpılmış resimleri (Blob olarak) alıp kaydeder.
app/api/upload/route.ts
Generated typescript
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.resolve(process.env.ROOT_DIR || process.cwd(), 'public/uploads');

const ensureDirectoryExists = async (dir: string) => {
  try {
    await fs.access(dir);
  } catch (error) {
    await fs.mkdir(dir, { recursive: true });
  }
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const folder = formData.get('folder') as string | null;

  if (!file || !folder) {
    return NextResponse.json({ message: 'File or folder path is missing' }, { status: 400 });
  }

  const targetDir = path.join(UPLOAD_DIR, folder);
  await ensureDirectoryExists(targetDir);
  
  const buffer = Buffer.from(await file.arrayBuffer());
  
  const originalExt = path.extname(file.name);
  const uniqueFileName = `${uuidv4()}${originalExt}`;
  const filePath = path.join(targetDir, uniqueFileName);

  try {
    await fs.writeFile(filePath, buffer);
    const fileUrl = `/uploads/${folder}/${uniqueFileName}`;
    return NextResponse.json({ message: 'File uploaded successfully', url: fileUrl, name: uniqueFileName });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ message: 'Error saving file' }, { status: 500 });
  }
}
Use code with caution.
TypeScript
Adım 3: UI Komponenti (Uploader.tsx)
Tüm kullanıcı arayüzünü ve istemci tarafı mantığını içeren ana React komponenti. Bu kodu components/Uploader.tsx olarak kaydedin.
components/Uploader.tsx
Generated tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UploaderProps, FileInfo } from '@/types';
import { Upload, GalleryVertical, Trash2, Download, Crop, Eye, CheckSquare, Square, X } from 'lucide-react';

import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Kırpma işlemi için yardımcı fonksiyon
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png', 0.95); // Kaliteyi ayarlayabilirsiniz
  });
}

export function Uploader({ folder, width, height, onUploadComplete, multiple = false }: UploaderProps) {
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery');
  const [galleryFiles, setGalleryFiles] = useState<FileInfo[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Kırpma state'leri
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropType>();
  const [scale, setScale] = useState(1);
  const [completedCrop, setCompletedCrop] = useState<CropType>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);

  const aspect = width / height;

  const fetchGalleryFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/files/${folder}`);
      if (!response.ok) throw new Error('Dosyalar getirilemedi.');
      const data: FileInfo[] = await response.json();
      setGalleryFiles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    fetchGalleryFiles();
  }, [fetchGalleryFiles]);

  const handleFileSelect = (fileUrl: string) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileUrl)) {
        return prev.filter(url => url !== fileUrl);
      } else {
        if (multiple) {
          return [...prev, fileUrl];
        } else {
          return [fileUrl];
        }
      }
    });
  };

  const handleFileDelete = async (fileName: string) => {
    if (!confirm(`'${fileName}' dosyasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) return;

    try {
      const response = await fetch(`/api/files/${folder}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      });
      if (!response.ok) throw new Error('Dosya silinemedi.');
      await fetchGalleryFiles();
    } catch (err: any) {
      alert(`Hata: ${err.message}`);
    }
  };

  const handleDirectUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Yükleme başarısız.');
      await fetchGalleryFiles();
      setActiveTab('gallery');
    } catch (err: any) {
      alert(`Hata: ${err.message}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setOriginalFileName(file.name);
        setImageToCrop(URL.createObjectURL(file));
      } else {
        handleDirectUpload(file);
      }
      e.target.value = ''; // Input'u sıfırla
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width: imgWidth, height: imgHeight } = e.currentTarget;
    const crop = centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, imgWidth, imgHeight),
        imgWidth,
        imgHeight
    );
    setCrop(crop);
    setScale(1);
  };
  
  const handleCropAndSave = async () => {
    const image = imgRef.current;
    if (!image || !completedCrop) {
        throw new Error('Kırpma verisi veya resim bulunamadı');
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = Math.floor(completedCrop.width * scaleX);
    canvas.height = Math.floor(completedCrop.height * scaleY);

    const ctx = canvas.getContext('2d');
    if (!ctx) { throw new Error('No 2d context'); }

    ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    
    const blob = await canvasToBlob(canvas);
    if (!blob) {
        alert("Kırpma işleminde hata oluştu.");
        return;
    }
    
    const fileToUpload = new File([blob], originalFileName || "cropped-image.png", { type: 'image/png' });
    await handleDirectUpload(fileToUpload);
    
    setImageToCrop(null);
    setOriginalFileName(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      const newScale = scale * (e.deltaY > 0 ? 0.95 : 1.05);
      setScale(Math.min(Math.max(0.5, newScale), 3));
  };

  const renderGallery = () => (
    <div>
      {isLoading && <p>Yükleniyor...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && galleryFiles.length === 0 && <p>Bu klasörde hiç dosya yok.</p>}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {galleryFiles.map(file => (
          <div key={file.url} className="relative group border rounded-lg overflow-hidden aspect-square flex items-center justify-center">
            <div className="absolute top-1 right-1 z-10 cursor-pointer" onClick={() => handleFileSelect(file.url)}>
              {selectedFiles.includes(file.url) ? <CheckSquare className="text-white bg-blue-600 rounded" /> : <Square className="text-gray-300 bg-black bg-opacity-30 rounded" />}
            </div>
            {file.type === 'image' ? (
              <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center p-2">
                <span className="text-xs text-gray-600 text-center break-all">{file.name}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center gap-1.5">
              <a href={file.url} target="_blank" rel="noopener noreferrer" title="Görüntüle" className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full"><Eye size={16} /></a>
              {file.type === 'image' && <button onClick={() => { setImageToCrop(file.url); setOriginalFileName(file.name); }} title="Kırp" className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full"><Crop size={16} /></button>}
              <a href={file.url} download title="İndir" className="opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full"><Download size={16} /></a>
              <button onClick={() => handleFileDelete(file.name)} title="Sil" className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-full"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end">
        <button onClick={() => onUploadComplete(selectedFiles)} disabled={selectedFiles.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400">
          Seçimi Tamamla ({selectedFiles.length})
        </button>
      </div>
    </div>
  );

  const renderUploader = () => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">Dosya Sürükle veya Seç</h3>
      <p className="mt-1 text-sm text-gray-500">Resimler kırpılacak, diğer dosyalar direkt yüklenecektir.</p>
      <input type="file" className="sr-only" id="file-upload" onChange={handleFileChange} />
      <label htmlFor="file-upload" className="cursor-pointer mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
        Dosya Seç
      </label>
    </div>
  );
  
  const renderCropper = () => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onWheel={handleWheel}>
      <div className="bg-white p-4 rounded-lg max-w-4xl w-full flex flex-col">
        <h2 className="text-xl font-bold mb-4">Resmi Kırp</h2>
        <div className="relative flex-grow flex justify-center items-center overflow-hidden" style={{ height: '60vh' }}>
          <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={aspect} className="max-h-full max-w-full">
            <img ref={imgRef} alt="Crop me" src={imageToCrop!} style={{ transform: `scale(${scale})`, transformOrigin: 'center' }} onLoad={onImageLoad} />
          </ReactCrop>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button onClick={() => setImageToCrop(null)} className="px-4 py-2 bg-gray-300 rounded-md">İptal</button>
          <p className='text-sm text-gray-500'>Yakınlaştırmak için mouse tekerleğini kullanın</p>
          <button onClick={handleCropAndSave} className="px-4 py-2 bg-green-600 text-white rounded-md">Kırp ve Kaydet</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      {imageToCrop && renderCropper()}
      <div className="flex border-b mb-4">
        <button onClick={() => setActiveTab('gallery')} className={`flex items-center gap-2 px-4 py-2 ${activeTab === 'gallery' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
          <GalleryVertical size={18} /> Galeri
        </button>
        <button onClick={() => setActiveTab('upload')} className={`flex items-center gap-2 px-4 py-2 ${activeTab === 'upload' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
          <Upload size={18} /> Yükle
        </button>
      </div>
      <div>
        {activeTab === 'gallery' ? renderGallery() : renderUploader()}
      </div>
    </div>
  );
}
Use code with caution.
Tsx
Adım 4: Komponenti Kullanma
Oluşturduğumuz Uploader komponentini bir sayfada nasıl kullanabileceğimize dair örnek.
app/page.tsx
Generated tsx
'use client';

import { Uploader } from '@/components/Uploader';
import { useState } from 'react';

export default function HomePage() {
  const [uploadedAvatar, setUploadedAvatar] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const handleAvatarUpload = (files: string[]) => {
    console.log("Avatar Yüklendi/Seçildi:", files);
    if (files.length > 0) {
      setUploadedAvatar(files);
    }
  };

  const handleGalleryUpload = (files: string[]) => {
    console.log("Galeri Resimleri Yüklendi/Seçildi:", files);
    setGalleryImages(files);
  };

  return (
    <main className="container mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-6">Gelişmiş Uploader Komponenti</h1>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4">Profil Fotoğrafı Yükleyici (Tekil Seçim)</h2>
          <p className="mb-4 text-gray-600">
            Burada 1:1 oranında (kare) bir resim yüklenmesi bekleniyor. `multiple` prop'u verilmediği için tekil seçim modundadır.
          </p>
          <div className="w-full md:w-3/4 lg:w-1/2">
             <Uploader
              folder="avatars" // public/uploads/avatars klasörüne kaydedecek
              width={300}     // 300px genişlik
              height={300}    // 300px yükseklik (1:1 aspect ratio)
              onUploadComplete={handleAvatarUpload}
            />
          </div>
          {uploadedAvatar.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold">Seçilen Avatar:</h3>
              <img src={uploadedAvatar[0]} alt="Seçilen avatar" className="mt-2 w-40 h-40 rounded-full object-cover border-4 border-blue-500" />
            </div>
          )}
        </section>

        <hr className="my-12" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">Ürün Galerisi Yükleyici (Çoklu Seçim)</h2>
          <p className="mb-4 text-gray-600">
            Burada 16:9 oranında resimler yüklenmesi bekleniyor. `multiple` prop'u `true` olduğu için çoklu seçim yapılabilir.
          </p>
          <Uploader
            folder="products/gallery" // public/uploads/products/gallery klasörüne kaydedecek
            width={1600}
            height={900}
            onUploadComplete={handleGalleryUpload}
            multiple={true} // Çoklu seçimi aktif et
          />
          {galleryImages.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold">Seçilen Galeri Resimleri:</h3>
              <div className="flex flex-wrap gap-4 mt-2">
                {galleryImages.map(url => (
                  <img key={url} src={url} alt="Seçilen galeri resmi" className="w-48 h-auto rounded-md shadow-lg" />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}