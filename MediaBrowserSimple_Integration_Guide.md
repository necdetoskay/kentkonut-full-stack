# MediaBrowserSimple Entegrasyon Rehberi

Bu rehber, MediaBrowserSimple komponentini başka bir Next.js projesinde kullanabilmek için gerekli tüm adımları ve kodları içerir.

## 📋 İçindekiler

1. [Komponent Analizi ve Bağımlılık Haritası](#1-komponent-analizi-ve-bağımlılık-haritası)
2. [Gerekli Dosyalar ve Kod Blokları](#2-gerekli-dosyalar-ve-kod-blokları)
3. [Backend API Gereksinimleri](#3-backend-api-gereksinimleri)
4. [Kurulum ve Konfigürasyon](#4-kurulum-ve-konfigürasyon)
5. [Adım Adım Entegrasyon Kılavuzu](#5-adım-adım-entegrasyon-kılavuzu)
6. [Kullanım Örnekleri ve Özelleştirme](#6-kullanım-örnekleri-ve-özelleştirme)

---

## 1. Komponent Analizi ve Bağımlılık Haritası

### 🎯 MediaBrowserSimple Nedir?

MediaBrowserSimple, medya dosyalarını görüntülemek, seçmek ve yüklemek için kullanılan gelişmiş bir React komponentidir. Modal tabanlı çalışır ve hem tek hem çoklu seçim destekler.

### 🔗 Ana Bağımlılıklar

#### **1. UI Komponentleri (Shadcn/UI)**
```
- Button: Buton komponentleri
- Input: Arama ve form girişleri
- Select: Kategori seçimi
- Card: Dosya kartları
- Badge: Durum göstergeleri
- Dialog: Modal pencere
```

#### **2. Context ve State Yönetimi**
```
- MediaCategoryContext: Kategori yönetimi
- useMediaCategories: Kategori hook'u
- useState/useEffect: React state yönetimi
```

#### **3. Medya Komponentleri**
```
- GlobalMediaSelector: Tip tanımları
- MediaUploader: Dosya yükleme
```

#### **4. Utility Fonksiyonları**
```
- formatFileSize: Dosya boyutu formatlama
- getMediaUrl: URL normalizasyonu
```

#### **5. External Libraries**
```
- lucide-react: İkonlar
- sonner: Toast bildirimleri
- next-auth: Oturum yönetimi
```

### 📊 Veri Akışı

```
User Action → MediaBrowserSimple → API Call → Backend → Database
                    ↓
Toast Notification ← State Update ← Response ← API Response
```

### 🏗️ Komponent Hiyerarşisi

```
MediaBrowserSimple
├── Dialog (Modal Container)
│   ├── DialogHeader (Başlık)
│   ├── DialogContent (Ana İçerik)
│   │   ├── Search Input (Arama)
│   │   ├── Category Select (Kategori Filtresi)
│   │   ├── Upload Button (Yükleme Butonu)
│   │   ├── File Grid (Dosya Listesi)
│   │   │   └── Card[] (Dosya Kartları)
│   │   │       ├── Checkbox (Seçim)
│   │   │       ├── Preview (Önizleme)
│   │   │       └── File Info (Dosya Bilgisi)
│   │   └── Upload Modal (Yükleme Modalı)
│   │       └── MediaUploader
│   └── DialogFooter (Alt Butonlar)
│       ├── Cancel Button
│       └── Select Button
```

### 🔄 State Yönetimi

```typescript
interface ComponentState {
  mediaFiles: GlobalMediaFile[];     // Tüm medya dosyaları
  loading: boolean;                  // Yükleme durumu
  selectedFiles: GlobalMediaFile[];  // Seçili dosyalar
  showUploaderModal: boolean;        // Yükleme modal durumu
  refreshKey: number;                // Yenileme tetikleyicisi
}
```

### 📡 API Entegrasyonları

```
GET /api/media                    → Medya dosyalarını getir
GET /api/media/categories         → Kategorileri getir
POST /api/media/upload            → Dosya yükle
DELETE /api/media/{id}            → Dosya sil
```

---

## 2. Gerekli Dosyalar ve Kod Blokları

### 📁 Klasör Yapısı

```
your-project/
├── components/
│   ├── ui/                       # Shadcn/UI komponentleri
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── dialog.tsx
│   └── media/                    # Medya komponentleri
│       ├── MediaBrowserSimple.tsx
│       ├── MediaUploader.tsx
│       └── GlobalMediaSelector.tsx
├── app/
│   ├── context/
│   │   └── MediaCategoryContext.tsx
│   └── api/
│       └── media/
│           ├── route.ts
│           ├── categories/
│           │   └── route.ts
│           └── upload/
│               └── route.ts
├── lib/
│   ├── media-utils.ts
│   └── media-categories.ts
└── types/
    └── media.ts
```

### 🎨 UI Komponentleri

Bu komponentler Shadcn/UI kütüphanesinden gelir. Kurulum için:

```bash
npx shadcn-ui@latest add button input select card badge dialog
```

### 📝 TypeScript Tip Tanımları

```typescript
// types/media.ts
export interface GlobalMediaFile {
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

export interface MediaCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MediaBrowserSimpleProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedFiles: GlobalMediaFile[]) => void;
  multiple?: boolean;
  allowedTypes?: string[];
  categoryFilter?: number;
  restrictCategorySelection?: boolean;
  title?: string;
  className?: string;
  preSelected?: GlobalMediaFile[];
  customFolder?: string;
}
```

---

## 3. Backend API Gereksinimleri

### 🗄️ Veritabanı Şeması

```sql
-- Media Categories Table
CREATE TABLE media_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media Files Table
CREATE TABLE media_files (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL,
  url TEXT NOT NULL,
  alt VARCHAR(255),
  caption TEXT,
  thumbnail_small VARCHAR(255),
  thumbnail_medium VARCHAR(255),
  thumbnail_large VARCHAR(255),
  category_id INTEGER REFERENCES media_categories(id),
  user_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_media_files_category_id ON media_files(category_id);
CREATE INDEX idx_media_files_mime_type ON media_files(mime_type);
CREATE INDEX idx_media_files_created_at ON media_files(created_at);
```

### 🔌 API Endpoint'leri

#### GET /api/media
```typescript
// app/api/media/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const type = searchParams.get('type');

    // Database query logic here
    const files = await getMediaFiles({
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      search,
      type
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error('Media fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media files' },
      { status: 500 }
    );
  }
}
```

#### GET /api/media/categories
```typescript
// app/api/media/categories/route.ts
export async function GET() {
  try {
    const categories = await getMediaCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
```

#### POST /api/media/upload
```typescript
// app/api/media/upload/route.ts
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const categoryId = formData.get('categoryId') as string;
    const customFolder = formData.get('customFolder') as string;

    // File upload logic
    const uploadedFile = await uploadMediaFile(file, {
      categoryId: parseInt(categoryId),
      customFolder
    });

    return NextResponse.json(uploadedFile);
  } catch (error) {
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

---

## 4. Kurulum ve Konfigürasyon

### 📦 Gerekli NPM Paketleri

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "next-auth": "^4.24.0",
    "lucide-react": "^0.400.0",
    "sonner": "^1.4.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### ⚙️ Environment Değişkenleri

```env
# .env.local
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# File Upload
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/*,video/*,application/pdf
```

### 🔧 Next.js Konfigürasyonu

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 🎨 Tailwind CSS Konfigürasyonu

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 🎨 CSS Variables

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## 5. Adım Adım Entegrasyon Kılavuzu

### 🚀 Adım 1: Proje Hazırlığı

```bash
# 1. Yeni Next.js projesi oluştur
npx create-next-app@latest my-media-project --typescript --tailwind --eslint --app

# 2. Proje dizinine git
cd my-media-project

# 3. Gerekli paketleri yükle
npm install next-auth lucide-react sonner @radix-ui/react-dialog @radix-ui/react-select class-variance-authority clsx tailwind-merge

# 4. Shadcn/UI'yi başlat
npx shadcn-ui@latest init

# 5. UI komponentlerini yükle
npx shadcn-ui@latest add button input select card badge dialog
```

### 🗂️ Adım 2: Klasör Yapısını Oluştur

```bash
mkdir -p components/ui
mkdir -p components/media
mkdir -p app/context
mkdir -p app/api/media/categories
mkdir -p app/api/media/upload
mkdir -p lib
mkdir -p types
mkdir -p public/uploads
```

### 📝 Adım 3: Tip Tanımlarını Oluştur

```typescript
// types/media.ts
export interface GlobalMediaFile {
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

export interface MediaCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UploadFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  name: string;
  size: number;
  type: string;
}
```

### 🛠️ Adım 4: Utility Fonksiyonlarını Oluştur

```typescript
// lib/media-utils.ts
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm'
];

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileTypeCategory(mimeType: string): string {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return 'image';
  }
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) {
    return 'video';
  }
  if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) {
    return 'document';
  }
  return 'unknown';
}

export function validateFileType(file: File, allowedTypes?: string[]): boolean {
  if (!allowedTypes || allowedTypes.length === 0) {
    return true;
  }

  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const category = type.replace('/*', '');
      return file.type.startsWith(category + '/');
    }
    return file.type === type;
  });
}

export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');

  return `${sanitizedName}_${timestamp}_${random}.${extension}`;
}
```

### 🔧 Adım 5: MediaCategoryContext Oluştur

```typescript
// app/context/MediaCategoryContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { MediaCategory } from "@/types/media";

interface MediaCategoryContextType {
  categories: MediaCategory[];
  isLoading: boolean;
  error: string | null;
  addCategory: (category: Omit<MediaCategory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MediaCategory>;
  updateCategory: (id: number, updates: Partial<MediaCategory>) => Promise<MediaCategory>;
  deleteCategory: (id: number) => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const MediaCategoryContext = createContext<MediaCategoryContextType | undefined>(undefined);

export function MediaCategoryProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/media/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Add category
  const addCategory = async (categoryData: Omit<MediaCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<MediaCategory> => {
    const response = await fetch('/api/media/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      throw new Error('Failed to add category');
    }

    const newCategory = await response.json();
    setCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  // Update category
  const updateCategory = async (id: number, updates: Partial<MediaCategory>): Promise<MediaCategory> => {
    const response = await fetch(`/api/media/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update category');
    }

    const updatedCategory = await response.json();
    setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat));
    return updatedCategory;
  };

  // Delete category
  const deleteCategory = async (id: number): Promise<void> => {
    const response = await fetch(`/api/media/categories/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete category');
    }

    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  // Refresh categories
  const refreshCategories = async () => {
    await fetchCategories();
  };

  // Fetch categories on mount
  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session) {
      fetchCategories();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [session, status]);

  return (
    <MediaCategoryContext.Provider
      value={{
        categories,
        isLoading,
        error,
        addCategory,
        updateCategory,
        deleteCategory,
        refreshCategories,
      }}
    >
      {children}
    </MediaCategoryContext.Provider>
  );
}

// Context hook
export function useMediaCategories() {
  const context = useContext(MediaCategoryContext);
  if (context === undefined) {
    throw new Error("useMediaCategories must be used within a MediaCategoryProvider");
  }
  return context;
}
```

### 📤 Adım 6: MediaUploader Komponenti

```typescript
// components/media/MediaUploader.tsx
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMediaCategories } from "@/app/context/MediaCategoryContext";
import { Upload, X, FileImage, FileText, Film, File, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatFileSize, validateFileType, generateUniqueFilename } from "@/lib/media-utils";
import { UploadFile, GlobalMediaFile } from "@/types/media";

interface MediaUploaderProps {
  categoryId?: number;
  defaultCategoryId?: number;
  onUploadComplete?: (files: GlobalMediaFile[]) => void;
  onUploadStart?: () => void;
  maxFiles?: number;
  className?: string;
  targetWidth?: number;
  targetHeight?: number;
  width?: number;
  height?: number;
  acceptedTypes?: string[];
  customFolder?: string;
}

export function MediaUploader({
  categoryId,
  defaultCategoryId,
  onUploadComplete,
  onUploadStart,
  maxFiles = 10,
  className = "",
  targetWidth,
  targetHeight,
  width = 800,
  height = 600,
  acceptedTypes = ['image/*', 'video/*', 'application/pdf', 'text/plain'],
  customFolder = 'media'
}: MediaUploaderProps) {
  const { data: session, status } = useSession();
  const { categories } = useMediaCategories();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(
    categoryId || defaultCategoryId || (categories.length > 0 ? categories[0].id : 0)
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<Set<string>>(new Set());

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      cleanupAllBlobUrls();
    };
  }, []);

  const cleanupAllBlobUrls = () => {
    blobUrlsRef.current.forEach(url => {
      URL.revokeObjectURL(url);
    });
    blobUrlsRef.current.clear();
  };

  // Update selected category when categoryId prop changes
  useEffect(() => {
    if (categoryId) {
      setSelectedCategoryId(categoryId);
    }
  }, [categoryId]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      if (!validateFileType(file, acceptedTypes)) {
        toast.error(`${file.name} dosya türü desteklenmiyor`);
        return false;
      }
      return true;
    });

    if (files.length + validFiles.length > maxFiles) {
      toast.error(`En fazla ${maxFiles} dosya yükleyebilirsiniz`);
      return;
    }

    const newFiles: UploadFile[] = validFiles.map(file => {
      const id = Math.random().toString(36).substring(2, 15);
      let preview: string | undefined;

      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
        blobUrlsRef.current.add(preview);
      }

      return {
        id,
        file,
        preview,
        progress: 0,
        status: 'pending',
        name: file.name,
        size: file.size,
        type: file.type,
      };
    });

    setFiles(prev => [...prev, ...newFiles]);
  }, [files.length, maxFiles, acceptedTypes]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    multiple: true,
    maxFiles,
  });

  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
        blobUrlsRef.current.delete(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    if (status !== "authenticated" || !session) {
      toast.error("Dosya yüklemek için giriş yapmalısınız");
      return;
    }

    setIsUploading(true);
    onUploadStart?.();

    const uploadedFiles: GlobalMediaFile[] = [];
    const failedFiles: string[] = [];

    for (const uploadFile of files) {
      try {
        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        ));

        const formData = new FormData();
        formData.append('file', uploadFile.file);
        formData.append('categoryId', selectedCategoryId.toString());
        formData.append('customFolder', customFolder);

        if (targetWidth) formData.append('targetWidth', targetWidth.toString());
        if (targetHeight) formData.append('targetHeight', targetHeight.toString());

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        uploadedFiles.push(result);

        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, status: 'success', progress: 100 }
            : f
        ));

      } catch (error) {
        console.error('Upload error:', error);
        failedFiles.push(uploadFile.name);

        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: 'error',
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            : f
        ));
      }
    }

    setIsUploading(false);

    // Show results
    if (uploadedFiles.length > 0) {
      toast.success(`${uploadedFiles.length} dosya başarıyla yüklendi`);
      onUploadComplete?.(uploadedFiles);
    }

    if (failedFiles.length > 0) {
      toast.error(`${failedFiles.length} dosya yüklenemedi: ${failedFiles.join(', ')}`);
    }

    // Clear successful uploads
    setFiles(prev => prev.filter(f => f.status === 'error'));
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <FileImage className="w-8 h-8" />;
    if (mimeType.startsWith('video/')) return <Film className="w-8 h-8" />;
    if (mimeType.includes('pdf')) return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Category Selection */}
      {!categoryId && categories.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Kategori</label>
          <Select
            value={selectedCategoryId.toString()}
            onValueChange={(value) => setSelectedCategoryId(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium mb-2">
          {isDragActive ? 'Dosyaları buraya bırakın' : 'Dosyaları sürükleyin veya tıklayın'}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Desteklenen formatlar: {acceptedTypes.join(', ')}
        </p>
        <p className="text-xs text-gray-400">
          En fazla {maxFiles} dosya, dosya başına maksimum 10MB
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Yüklenecek Dosyalar ({files.length})</h3>
          <div className="space-y-2">
            {files.map((file) => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center space-x-3">
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>

                    {/* Progress Bar */}
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="mt-1" />
                    )}

                    {/* Error Message */}
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      file.status === 'success' ? 'default' :
                      file.status === 'error' ? 'destructive' :
                      file.status === 'uploading' ? 'secondary' : 'outline'
                    }>
                      {file.status === 'pending' && 'Bekliyor'}
                      {file.status === 'uploading' && 'Yükleniyor'}
                      {file.status === 'success' && 'Başarılı'}
                      {file.status === 'error' && 'Hata'}
                    </Badge>

                    {getStatusIcon(file.status)}

                    {file.status !== 'uploading' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Upload Button */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setFiles([]);
                cleanupAllBlobUrls();
              }}
              disabled={isUploading}
            >
              Temizle
            </Button>
            <Button
              onClick={uploadFiles}
              disabled={isUploading || files.length === 0 || files.every(f => f.status === 'success')}
            >
              {isUploading ? 'Yükleniyor...' : `${files.filter(f => f.status !== 'success').length} Dosya Yükle`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 🎯 Adım 7: MediaBrowserSimple Ana Komponenti

```typescript
// components/media/MediaBrowserSimple.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMediaCategories } from "@/app/context/MediaCategoryContext";
import {
  Search,
  Grid3X3,
  List,
  Upload,
  RefreshCw,
  Image,
  Film,
  FileText,
  File,
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/media-utils";
import { GlobalMediaFile, MediaBrowserSimpleProps } from "@/types/media";
import { MediaUploader } from "./MediaUploader";

export function MediaBrowserSimple({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  allowedTypes,
  categoryFilter,
  restrictCategorySelection = false,
  title = "Medya Seç",
  className = "",
  preSelected = [],
  customFolder = 'media'
}: MediaBrowserSimpleProps) {
  const { categories } = useMediaCategories();
  const [mediaFiles, setMediaFiles] = useState<GlobalMediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<GlobalMediaFile[]>([]);
  const [showUploaderModal, setShowUploaderModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(categoryFilter);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Force refresh function
  const forceRefresh = () => {
    console.log("🔄 MediaBrowserSimple: Force refresh triggered");
    setRefreshKey(prev => prev + 1);
  };

  // Fetch media files
  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      console.log("📡 MediaBrowserSimple: Fetching files...", {
        categoryFilter: selectedCategoryId,
        search: searchTerm,
        allowedTypes
      });

      const params = new URLSearchParams();
      if (selectedCategoryId) params.append('categoryId', selectedCategoryId.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (allowedTypes && allowedTypes.length > 0) {
        allowedTypes.forEach(type => params.append('type', type));
      }

      const response = await fetch(`/api/media?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch media files');
      }

      const files = await response.json();
      console.log("📊 MediaBrowserSimple: Files fetched", { count: files.length });
      setMediaFiles(files);
    } catch (error) {
      console.error('Error fetching media files:', error);
      toast.error('Medya dosyaları yüklenirken hata oluştu');
      setMediaFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle checkbox selection (for multiple selection)
  const handleCheckboxSelection = (file: GlobalMediaFile, event: React.MouseEvent) => {
    event.stopPropagation();

    if (multiple) {
      setSelectedFiles(prev => {
        const isSelected = prev.some(f => f.id === file.id);
        if (isSelected) {
          return prev.filter(f => f.id !== file.id);
        } else {
          return [...prev, file];
        }
      });
    } else {
      // Single selection mode
      setSelectedFiles(prev => {
        const isSelected = prev.some(f => f.id === file.id);
        return isSelected ? [] : [file];
      });
    }
  };

  // Handle image click (for single selection or replacing selection)
  const handleImageClick = (file: GlobalMediaFile) => {
    if (multiple) {
      // In multiple mode, image click replaces current selection with single item
      setSelectedFiles([file]);
    } else {
      // In single mode, image click selects the item
      setSelectedFiles([file]);
    }
  };

  // Handle confirm selection
  const handleConfirmSelection = () => {
    onSelect(selectedFiles);
    onClose();
  };

  // Handle upload complete
  const handleUploadComplete = (uploadedFiles: GlobalMediaFile[]) => {
    console.log("🎯 MediaBrowserSimple: Upload complete, refreshing...");
    setShowUploaderModal(false);
    toast.success(`${uploadedFiles.length} dosya başarıyla yüklendi`);

    // Force refresh after upload
    setTimeout(() => {
      forceRefresh();
    }, 500);
  };

  // Fetch files when dialog opens or refreshKey changes
  useEffect(() => {
    if (isOpen) {
      console.log("📂 MediaBrowserSimple: Dialog opened, fetching files...");
      setSelectedFiles(preSelected);
      fetchMediaFiles();
    }
  }, [isOpen, refreshKey, preSelected]);

  // Refetch when search or category changes
  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(() => {
        fetchMediaFiles();
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, selectedCategoryId]);

  // Debug log for mediaFiles state
  useEffect(() => {
    console.log("📊 MediaBrowserSimple: mediaFiles state changed", {
      count: mediaFiles.length,
      files: mediaFiles.slice(0, 3).map(f => ({ id: f.id, filename: f.filename, categoryId: f.categoryId, url: f.url }))
    });
  }, [mediaFiles]);

  const getMediaUrl = (url?: string) => {
    if (!url) return '';
    let normalizedUrl = url;
    if (normalizedUrl.startsWith('http')) return normalizedUrl;

    // Remove common prefixes
    normalizedUrl = normalizedUrl.replace(/^\/public\//, '/');
    normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/');

    // Ensure it starts with /
    if (!normalizedUrl.startsWith('/')) {
      normalizedUrl = '/' + normalizedUrl;
    }

    return normalizedUrl;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-8 h-8 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Film className="w-8 h-8 text-purple-500" />;
    if (mimeType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  // Filter files based on allowed types
  const filteredFiles = mediaFiles.filter(file => {
    if (!allowedTypes || allowedTypes.length === 0) return true;

    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const category = type.replace('/*', '');
        return file.mimeType.startsWith(category + '/');
      }
      return file.mimeType === type;
    });
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 py-4 border-b">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Dosya ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          {!restrictCategorySelection && categories.length > 0 && (
            <div className="w-full sm:w-48">
              <Select
                value={selectedCategoryId?.toString() || "all"}
                onValueChange={(value) => setSelectedCategoryId(value === "all" ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Upload Button */}
          <Button
            variant="outline"
            onClick={() => setShowUploaderModal(true)}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Yükle
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            onClick={forceRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>

        {/* File Grid/List */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p>Dosyalar yükleniyor...</p>
              </div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <File className="w-12 h-12 mx-auto mb-2" />
                <p>Dosya bulunamadı</p>
                <p className="text-sm">Farklı arama terimleri deneyin veya yeni dosya yükleyin</p>
              </div>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4"
                : "space-y-2 p-4"
            }>
              {filteredFiles.map((file) => {
                const isSelected = selectedFiles.some(f => f.id === file.id);
                const isImage = file.mimeType.startsWith('image/');

                if (viewMode === 'list') {
                  return (
                    <Card
                      key={file.id}
                      className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                      onClick={() => handleImageClick(file)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          {/* Checkbox */}
                          <div
                            className="cursor-pointer hover:scale-110 transition-transform"
                            onClick={(e) => handleCheckboxSelection(file, e)}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected
                                ? 'bg-primary border-primary text-white'
                                : 'bg-white border-gray-300 hover:border-primary'
                            }`}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                          </div>

                          {/* Preview */}
                          <div className="w-12 h-12 flex-shrink-0">
                            {isImage ? (
                              <img
                                src={getMediaUrl(file.url)}
                                alt={file.alt || file.originalName}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                                {getFileIcon(file.mimeType)}
                              </div>
                            )}
                          </div>

                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.originalName}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{formatFileSize(file.size)}</span>
                              {file.category && (
                                <>
                                  <span>•</span>
                                  <Badge variant="outline" className="text-xs">
                                    {file.category.name}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                // Grid view
                return (
                  <Card
                    key={file.id}
                    className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                    onClick={() => handleImageClick(file)}
                  >
                    <CardContent className="p-0 relative">
                      {/* Selection checkbox */}
                      <div
                        className="absolute top-2 left-2 z-10 cursor-pointer hover:scale-110 transition-transform"
                        onClick={(e) => handleCheckboxSelection(file, e)}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-primary border-primary text-white'
                            : 'bg-white border-gray-300 hover:border-primary'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>

                      {/* File preview */}
                      <div className="w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden rounded border">
                        {isImage ? (
                          <img
                            src={getMediaUrl(file.url)}
                            alt={file.alt || file.originalName}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4">
                            {getFileIcon(file.mimeType)}
                            <p className="text-xs text-gray-500 mt-2 text-center truncate w-full">
                              {file.originalName}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* File info */}
                      <div className="p-2">
                        <p className="text-xs font-medium truncate" title={file.originalName}>
                          {file.originalName}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                          {file.category && (
                            <Badge variant="outline" className="text-xs">
                              {file.category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        <Dialog open={showUploaderModal} onOpenChange={setShowUploaderModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Medya Dosyası Yükle</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <MediaUploader
                categoryId={categoryFilter || undefined}
                defaultCategoryId={categoryFilter || undefined}
                onUploadComplete={handleUploadComplete}
                acceptedTypes={allowedTypes || undefined}
                customFolder={customFolder}
              />
            </div>
          </DialogContent>
        </Dialog>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            İptal
          </Button>
          <Button
            onClick={handleConfirmSelection}
            disabled={selectedFiles.length === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Seç ({selectedFiles.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## 3. Backend API Gereksinimleri

### 🗄️ Veritabanı Şeması (PostgreSQL)

```sql
-- Media Categories Table
CREATE TABLE media_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media Files Table
CREATE TABLE media_files (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL,
  url TEXT NOT NULL,
  alt VARCHAR(255),
  caption TEXT,
  thumbnail_small VARCHAR(255),
  thumbnail_medium VARCHAR(255),
  thumbnail_large VARCHAR(255),
  category_id INTEGER REFERENCES media_categories(id) ON DELETE SET NULL,
  user_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_media_files_category_id ON media_files(category_id);
CREATE INDEX idx_media_files_mime_type ON media_files(mime_type);
CREATE INDEX idx_media_files_created_at ON media_files(created_at);
CREATE INDEX idx_media_files_user_id ON media_files(user_id);

-- Sample categories
INSERT INTO media_categories (name, slug, description) VALUES
('İçerik Resimleri', 'content-images', 'Web sitesi içerik resimleri'),
('Proje Resimleri', 'project-images', 'Proje galerisi resimleri'),
('Haber Resimleri', 'news-images', 'Haber ve duyuru resimleri'),
('Banner Resimleri', 'banner-images', 'Ana sayfa banner resimleri'),
('Kurumsal Resimler', 'corporate-images', 'Kurumsal içerik resimleri'),
('Genel', 'general', 'Genel medya dosyaları');
```

### 🔌 API Endpoint'leri

#### 1. GET /api/media - Medya Dosyalarını Getir

```typescript
// app/api/media/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const types = searchParams.getAll('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build query
    let query = `
      SELECT
        mf.*,
        mc.name as category_name,
        mc.slug as category_slug
      FROM media_files mf
      LEFT JOIN media_categories mc ON mf.category_id = mc.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Category filter
    if (categoryId && categoryId !== 'all') {
      query += ` AND mf.category_id = $${paramIndex}`;
      params.push(parseInt(categoryId));
      paramIndex++;
    }

    // Search filter
    if (search) {
      query += ` AND (
        mf.original_name ILIKE $${paramIndex} OR
        mf.filename ILIKE $${paramIndex} OR
        mf.alt ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Type filter
    if (types.length > 0) {
      const typeConditions = types.map(type => {
        if (type.endsWith('/*')) {
          const category = type.replace('/*', '');
          return `mf.mime_type LIKE '${category}/%'`;
        }
        return `mf.mime_type = '${type}'`;
      }).join(' OR ');

      query += ` AND (${typeConditions})`;
    }

    // Order and pagination
    query += ` ORDER BY mf.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute query (replace with your database client)
    const result = await executeQuery(query, params);

    // Transform results
    const files = result.rows.map((row: any) => ({
      id: row.id,
      filename: row.filename,
      originalName: row.original_name,
      mimeType: row.mime_type,
      size: row.size,
      url: row.url,
      alt: row.alt,
      caption: row.caption,
      thumbnailSmall: row.thumbnail_small,
      thumbnailMedium: row.thumbnail_medium,
      thumbnailLarge: row.thumbnail_large,
      categoryId: row.category_id,
      category: row.category_id ? {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug
      } : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return NextResponse.json(files);
  } catch (error) {
    console.error('Media fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media files' },
      { status: 500 }
    );
  }
}

// DELETE /api/media - Medya Dosyasını Sil
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 });
    }

    // Get file info before deletion
    const fileQuery = 'SELECT * FROM media_files WHERE id = $1';
    const fileResult = await executeQuery(fileQuery, [parseInt(id)]);

    if (fileResult.rows.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = fileResult.rows[0];

    // Delete from database
    const deleteQuery = 'DELETE FROM media_files WHERE id = $1';
    await executeQuery(deleteQuery, [parseInt(id)]);

    // Delete physical file
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public', file.url);
      await fs.unlink(filePath);

      // Delete thumbnails if they exist
      if (file.thumbnail_small) {
        const thumbPath = path.join(process.cwd(), 'public', file.thumbnail_small);
        await fs.unlink(thumbPath).catch(() => {}); // Ignore errors
      }
      if (file.thumbnail_medium) {
        const thumbPath = path.join(process.cwd(), 'public', file.thumbnail_medium);
        await fs.unlink(thumbPath).catch(() => {}); // Ignore errors
      }
      if (file.thumbnail_large) {
        const thumbPath = path.join(process.cwd(), 'public', file.thumbnail_large);
        await fs.unlink(thumbPath).catch(() => {}); // Ignore errors
      }
    } catch (fsError) {
      console.error('Error deleting physical file:', fsError);
      // Continue even if file deletion fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Media delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete media file' },
      { status: 500 }
    );
  }
}
```

#### 2. GET /api/media/categories - Kategorileri Getir

```typescript
// app/api/media/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const query = `
      SELECT
        id,
        name,
        slug,
        description,
        created_at,
        updated_at,
        (SELECT COUNT(*) FROM media_files WHERE category_id = mc.id) as file_count
      FROM media_categories mc
      ORDER BY name ASC
    `;

    const result = await executeQuery(query, []);

    const categories = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      fileCount: parseInt(row.file_count),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO media_categories (name, slug, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await executeQuery(query, [name, slug, description]);
    const category = result.rows[0];

    return NextResponse.json({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      createdAt: category.created_at,
      updatedAt: category.updated_at
    });
  } catch (error) {
    console.error('Category creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
```

#### 3. POST /api/media/upload - Dosya Yükle

```typescript
// app/api/media/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { generateUniqueFilename } from '@/lib/media-utils';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const categoryId = formData.get('categoryId') as string;
    const customFolder = formData.get('customFolder') as string || 'media';
    const targetWidth = formData.get('targetWidth') as string;
    const targetHeight = formData.get('targetHeight') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.name);

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', customFolder);
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, uniqueFilename);
    await writeFile(filePath, buffer);

    // Generate URL
    const fileUrl = `/uploads/${customFolder}/${uniqueFilename}`;

    // Generate thumbnails for images
    let thumbnailSmall, thumbnailMedium, thumbnailLarge;
    if (file.type.startsWith('image/')) {
      try {
        const sharp = require('sharp');

        // Small thumbnail (150x150)
        const smallThumbName = `thumb_small_${uniqueFilename}`;
        const smallThumbPath = join(uploadDir, smallThumbName);
        await sharp(buffer)
          .resize(150, 150, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toFile(smallThumbPath);
        thumbnailSmall = `/uploads/${customFolder}/${smallThumbName}`;

        // Medium thumbnail (300x300)
        const mediumThumbName = `thumb_medium_${uniqueFilename}`;
        const mediumThumbPath = join(uploadDir, mediumThumbName);
        await sharp(buffer)
          .resize(300, 300, { fit: 'cover' })
          .jpeg({ quality: 85 })
          .toFile(mediumThumbPath);
        thumbnailMedium = `/uploads/${customFolder}/${mediumThumbName}`;

        // Large thumbnail (800x600)
        const largeThumbName = `thumb_large_${uniqueFilename}`;
        const largeThumbPath = join(uploadDir, largeThumbName);
        await sharp(buffer)
          .resize(800, 600, { fit: 'inside' })
          .jpeg({ quality: 90 })
          .toFile(largeThumbPath);
        thumbnailLarge = `/uploads/${customFolder}/${largeThumbName}`;
      } catch (thumbError) {
        console.error('Thumbnail generation error:', thumbError);
        // Continue without thumbnails
      }
    }

    // Save to database
    const insertQuery = `
      INSERT INTO media_files (
        filename,
        original_name,
        mime_type,
        size,
        url,
        thumbnail_small,
        thumbnail_medium,
        thumbnail_large,
        category_id,
        user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await executeQuery(insertQuery, [
      uniqueFilename,
      file.name,
      file.type,
      file.size,
      fileUrl,
      thumbnailSmall,
      thumbnailMedium,
      thumbnailLarge,
      categoryId ? parseInt(categoryId) : null,
      session.user?.id || null
    ]);

    const savedFile = result.rows[0];

    // Get category info if exists
    let category = null;
    if (savedFile.category_id) {
      const categoryQuery = 'SELECT id, name, slug FROM media_categories WHERE id = $1';
      const categoryResult = await executeQuery(categoryQuery, [savedFile.category_id]);
      if (categoryResult.rows.length > 0) {
        category = categoryResult.rows[0];
      }
    }

    // Return file info
    const responseFile = {
      id: savedFile.id,
      filename: savedFile.filename,
      originalName: savedFile.original_name,
      mimeType: savedFile.mime_type,
      size: savedFile.size,
      url: savedFile.url,
      thumbnailSmall: savedFile.thumbnail_small,
      thumbnailMedium: savedFile.thumbnail_medium,
      thumbnailLarge: savedFile.thumbnail_large,
      categoryId: savedFile.category_id,
      category,
      createdAt: savedFile.created_at,
      updatedAt: savedFile.updated_at
    };

    return NextResponse.json(responseFile);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

### 🔧 Database Helper Functions

```typescript
// lib/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function executeQuery(query: string, params: any[] = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
}

export async function getMediaFiles(filters: {
  categoryId?: number;
  search?: string;
  types?: string[];
  page?: number;
  limit?: number;
}) {
  const { categoryId, search, types, page = 1, limit = 50 } = filters;
  const offset = (page - 1) * limit;

  let query = `
    SELECT
      mf.*,
      mc.name as category_name,
      mc.slug as category_slug
    FROM media_files mf
    LEFT JOIN media_categories mc ON mf.category_id = mc.id
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramIndex = 1;

  if (categoryId) {
    query += ` AND mf.category_id = $${paramIndex}`;
    params.push(categoryId);
    paramIndex++;
  }

  if (search) {
    query += ` AND (
      mf.original_name ILIKE $${paramIndex} OR
      mf.filename ILIKE $${paramIndex} OR
      mf.alt ILIKE $${paramIndex}
    )`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  if (types && types.length > 0) {
    const typeConditions = types.map(type => {
      if (type.endsWith('/*')) {
        const category = type.replace('/*', '');
        return `mf.mime_type LIKE '${category}/%'`;
      }
      return `mf.mime_type = '${type}'`;
    }).join(' OR ');

    query += ` AND (${typeConditions})`;
  }

  query += ` ORDER BY mf.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await executeQuery(query, params);

  return result.rows.map((row: any) => ({
    id: row.id,
    filename: row.filename,
    originalName: row.original_name,
    mimeType: row.mime_type,
    size: row.size,
    url: row.url,
    alt: row.alt,
    caption: row.caption,
    thumbnailSmall: row.thumbnail_small,
    thumbnailMedium: row.thumbnail_medium,
    thumbnailLarge: row.thumbnail_large,
    categoryId: row.category_id,
    category: row.category_id ? {
      id: row.category_id,
      name: row.category_name,
      slug: row.category_slug
    } : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function getMediaCategories() {
  const query = `
    SELECT
      id,
      name,
      slug,
      description,
      created_at,
      updated_at,
      (SELECT COUNT(*) FROM media_files WHERE category_id = mc.id) as file_count
    FROM media_categories mc
    ORDER BY name ASC
  `;

  const result = await executeQuery(query, []);

  return result.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    fileCount: parseInt(row.file_count),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}
```

### 📁 Dosya Yönetimi Utilities

```typescript
// lib/file-utils.ts
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function saveUploadedFile(
  file: File,
  customFolder: string = 'media'
): Promise<{ filePath: string; fileUrl: string; uniqueFilename: string }> {
  const uniqueFilename = generateUniqueFilename(file.name);

  // Create upload directory
  const uploadDir = join(process.cwd(), 'public', 'uploads', customFolder);
  await mkdir(uploadDir, { recursive: true });

  // Save file
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filePath = join(uploadDir, uniqueFilename);
  await writeFile(filePath, buffer);

  // Generate URL
  const fileUrl = `/uploads/${customFolder}/${uniqueFilename}`;

  return { filePath, fileUrl, uniqueFilename };
}

export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const fullPath = join(process.cwd(), 'public', filePath);
    if (existsSync(fullPath)) {
      await unlink(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

export async function generateThumbnails(
  buffer: Buffer,
  originalFilename: string,
  uploadDir: string,
  customFolder: string
): Promise<{
  thumbnailSmall?: string;
  thumbnailMedium?: string;
  thumbnailLarge?: string;
}> {
  try {
    const sharp = require('sharp');
    const thumbnails: any = {};

    // Small thumbnail (150x150)
    const smallThumbName = `thumb_small_${originalFilename}`;
    const smallThumbPath = join(uploadDir, smallThumbName);
    await sharp(buffer)
      .resize(150, 150, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(smallThumbPath);
    thumbnails.thumbnailSmall = `/uploads/${customFolder}/${smallThumbName}`;

    // Medium thumbnail (300x300)
    const mediumThumbName = `thumb_medium_${originalFilename}`;
    const mediumThumbPath = join(uploadDir, mediumThumbName);
    await sharp(buffer)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(mediumThumbPath);
    thumbnails.thumbnailMedium = `/uploads/${customFolder}/${mediumThumbName}`;

    // Large thumbnail (800x600)
    const largeThumbName = `thumb_large_${originalFilename}`;
    const largeThumbPath = join(uploadDir, largeThumbName);
    await sharp(buffer)
      .resize(800, 600, { fit: 'inside' })
      .jpeg({ quality: 90 })
      .toFile(largeThumbPath);
    thumbnails.thumbnailLarge = `/uploads/${customFolder}/${largeThumbName}`;

    return thumbnails;
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return {};
  }
}

function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');

  return `${sanitizedName}_${timestamp}_${random}.${extension}`;
}
```

### 🔐 NextAuth Konfigürasyonu

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { executeQuery } from '@/lib/database';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Get user from database
          const query = 'SELECT * FROM users WHERE email = $1';
          const result = await executeQuery(query, [credentials.email]);

          if (result.rows.length === 0) {
            return null;
          }

          const user = result.rows[0];

          // Verify password (implement your password verification logic)
          const isValidPassword = await verifyPassword(credentials.password, user.password);

          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // Implement your password verification logic here
  // Example with bcrypt:
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(password, hashedPassword);
}
```

## 4. Kurulum ve Konfigürasyon

### 📦 Gerekli NPM Paketleri

```json
{
  "name": "media-browser-project",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "next-auth": "^4.24.7",
    "typescript": "^5.4.0",
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",

    "lucide-react": "^0.400.0",
    "sonner": "^1.4.41",
    "react-dropzone": "^14.2.3",

    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-checkbox": "^1.0.4",

    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0",
    "tailwindcss-animate": "^1.0.7",

    "pg": "^8.11.5",
    "@types/pg": "^8.11.6",
    "bcryptjs": "^2.4.3",
    "@types/bcryptjs": "^2.4.6",
    "sharp": "^0.33.4"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.3",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.3"
  }
}
```

### 🔧 Kurulum Komutları

```bash
# 1. Proje oluştur
npx create-next-app@latest media-browser-project --typescript --tailwind --eslint --app
cd media-browser-project

# 2. Temel paketleri yükle
npm install next-auth lucide-react sonner react-dropzone

# 3. Radix UI komponentlerini yükle
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-progress @radix-ui/react-checkbox

# 4. Utility paketlerini yükle
npm install class-variance-authority clsx tailwind-merge tailwindcss-animate

# 5. Database ve backend paketlerini yükle
npm install pg @types/pg bcryptjs @types/bcryptjs sharp

# 6. Shadcn/UI'yi başlat
npx shadcn-ui@latest init

# 7. UI komponentlerini yükle
npx shadcn-ui@latest add button input select card badge dialog progress
```

### ⚙️ Environment Değişkenleri

```env
# .env.local
# NextAuth
NEXTAUTH_SECRET=your-super-secret-key-here-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/media_db

# File Upload Settings
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/*,video/*,application/pdf,text/plain

# Image Processing
ENABLE_THUMBNAILS=true
THUMBNAIL_QUALITY=85
MAX_IMAGE_WIDTH=2048
MAX_IMAGE_HEIGHT=2048

# Development
NODE_ENV=development
```

### 🗂️ Proje Klasör Yapısı

```
media-browser-project/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   └── media/
│   │       ├── route.ts
│   │       ├── categories/
│   │       │   └── route.ts
│   │       └── upload/
│   │           └── route.ts
│   ├── context/
│   │   └── MediaCategoryContext.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                    # Shadcn/UI komponentleri
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── progress.tsx
│   │   └── checkbox.tsx
│   └── media/                 # Medya komponentleri
│       ├── MediaBrowserSimple.tsx
│       ├── MediaUploader.tsx
│       └── GlobalMediaSelector.tsx
├── lib/
│   ├── utils.ts              # Shadcn/UI utilities
│   ├── media-utils.ts        # Medya utility fonksiyonları
│   ├── database.ts           # Database helper fonksiyonları
│   └── file-utils.ts         # Dosya yönetimi utilities
├── types/
│   └── media.ts              # TypeScript tip tanımları
├── public/
│   └── uploads/              # Yüklenen dosyalar
│       ├── media/
│       ├── images/
│       └── documents/
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── .env.local
```

### 🔧 Next.js Konfigürasyonu

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'your-domain.com',
        pathname: '/uploads/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/media/:path*',
        destination: '/api/media/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

### 🎨 Tailwind CSS Konfigürasyonu

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 📝 TypeScript Konfigürasyonu

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 🎨 Global CSS

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: hsl(var(--muted));
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--accent-foreground));
}

/* Loading animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## 5. Adım Adım Entegrasyon Kılavuzu

### 🚀 Adım 1: Proje Kurulumu (15 dakika)

```bash
# 1.1 Yeni Next.js projesi oluştur
npx create-next-app@latest media-browser-project --typescript --tailwind --eslint --app
cd media-browser-project

# 1.2 Gerekli paketleri yükle
npm install next-auth lucide-react sonner react-dropzone
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-progress @radix-ui/react-checkbox
npm install class-variance-authority clsx tailwind-merge tailwindcss-animate
npm install pg @types/pg bcryptjs @types/bcryptjs sharp

# 1.3 Shadcn/UI'yi başlat
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input select card badge dialog progress

# 1.4 Klasör yapısını oluştur
mkdir -p components/media
mkdir -p app/context
mkdir -p app/api/media/categories
mkdir -p app/api/media/upload
mkdir -p lib
mkdir -p types
mkdir -p public/uploads
```

**✅ Test:** `npm run dev` komutu çalışmalı ve proje başlamalı.

### 🗄️ Adım 2: Veritabanı Kurulumu (10 dakika)

```sql
-- 2.1 PostgreSQL veritabanı oluştur
CREATE DATABASE media_db;

-- 2.2 Tabloları oluştur
\c media_db;

CREATE TABLE media_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE media_files (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL,
  url TEXT NOT NULL,
  alt VARCHAR(255),
  caption TEXT,
  thumbnail_small VARCHAR(255),
  thumbnail_medium VARCHAR(255),
  thumbnail_large VARCHAR(255),
  category_id INTEGER REFERENCES media_categories(id) ON DELETE SET NULL,
  user_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2.3 İndeksleri oluştur
CREATE INDEX idx_media_files_category_id ON media_files(category_id);
CREATE INDEX idx_media_files_mime_type ON media_files(mime_type);
CREATE INDEX idx_media_files_created_at ON media_files(created_at);

-- 2.4 Örnek kategoriler ekle
INSERT INTO media_categories (name, slug, description) VALUES
('İçerik Resimleri', 'content-images', 'Web sitesi içerik resimleri'),
('Proje Resimleri', 'project-images', 'Proje galerisi resimleri'),
('Haber Resimleri', 'news-images', 'Haber ve duyuru resimleri'),
('Banner Resimleri', 'banner-images', 'Ana sayfa banner resimleri'),
('Genel', 'general', 'Genel medya dosyaları');
```

**✅ Test:** Veritabanına bağlanabilmeli ve tablolar görünmeli.

### ⚙️ Adım 3: Environment Konfigürasyonu (5 dakika)

```env
# 3.1 .env.local dosyası oluştur
NEXTAUTH_SECRET=your-super-secret-key-here-min-32-chars-long
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://username:password@localhost:5432/media_db
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/*,video/*,application/pdf
```

**✅ Test:** Environment değişkenleri `process.env` ile erişilebilmeli.

### 📝 Adım 4: Tip Tanımlarını Oluştur (5 dakika)

```typescript
// 4.1 types/media.ts dosyasını oluştur
// (Yukarıdaki kod bloğunu kopyala)
```

**✅ Test:** TypeScript hataları olmamalı.

### 🔧 Adım 5: Utility Fonksiyonlarını Oluştur (10 dakika)

```typescript
// 5.1 lib/media-utils.ts dosyasını oluştur
// 5.2 lib/database.ts dosyasını oluştur
// 5.3 lib/file-utils.ts dosyasını oluştur
// (Yukarıdaki kod bloklarını kopyala)
```

**✅ Test:** Import'lar çalışmalı, TypeScript hataları olmamalı.

### 🎯 Adım 6: Context Oluştur (10 dakika)

```typescript
// 6.1 app/context/MediaCategoryContext.tsx dosyasını oluştur
// (Yukarıdaki kod bloğunu kopyala)

// 6.2 app/layout.tsx'e provider ekle
import { MediaCategoryProvider } from './context/MediaCategoryContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <MediaCategoryProvider>
          {children}
        </MediaCategoryProvider>
      </body>
    </html>
  );
}
```

**✅ Test:** Context hook'u kullanılabilmeli.

### 🔌 Adım 7: API Endpoint'lerini Oluştur (20 dakika)

```typescript
// 7.1 app/api/media/route.ts dosyasını oluştur
// 7.2 app/api/media/categories/route.ts dosyasını oluştur
// 7.3 app/api/media/upload/route.ts dosyasını oluştur
// (Yukarıdaki kod bloklarını kopyala)
```

**✅ Test:**
- `GET /api/media/categories` → Kategoriler dönmeli
- `GET /api/media` → Boş array dönmeli
- `POST /api/media/upload` → 401 Unauthorized dönmeli (auth olmadan)

### 🎨 Adım 8: UI Komponentlerini Oluştur (15 dakika)

```typescript
// 8.1 components/media/MediaUploader.tsx dosyasını oluştur
// 8.2 components/media/MediaBrowserSimple.tsx dosyasını oluştur
// (Yukarıdaki kod bloklarını kopyala)
```

**✅ Test:** Komponentler import edilebilmeli, TypeScript hataları olmamalı.

### 🔐 Adım 9: Authentication Kurulumu (15 dakika)

```typescript
// 9.1 app/api/auth/[...nextauth]/route.ts dosyasını oluştur
// (Yukarıdaki kod bloğunu kopyala)

// 9.2 app/layout.tsx'e SessionProvider ekle
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <SessionProvider>
          <MediaCategoryProvider>
            {children}
          </MediaCategoryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

**✅ Test:** NextAuth çalışmalı, session yönetimi aktif olmalı.

### 🧪 Adım 10: Test Sayfası Oluştur (10 dakika)

```typescript
// 10.1 app/test/page.tsx dosyasını oluştur
"use client";

import { useState } from 'react';
import { MediaBrowserSimple } from '@/components/media/MediaBrowserSimple';
import { Button } from '@/components/ui/button';
import { GlobalMediaFile } from '@/types/media';

export default function TestPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<GlobalMediaFile[]>([]);

  const handleSelect = (files: GlobalMediaFile[]) => {
    setSelectedFiles(files);
    console.log('Selected files:', files);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">MediaBrowserSimple Test</h1>

      <Button onClick={() => setIsOpen(true)}>
        Medya Seç ({selectedFiles.length} seçili)
      </Button>

      <MediaBrowserSimple
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleSelect}
        multiple={true}
        title="Test Medya Seçici"
        allowedTypes={['image/*']}
      />

      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Seçili Dosyalar:</h2>
          <div className="grid grid-cols-3 gap-4">
            {selectedFiles.map((file) => (
              <div key={file.id} className="border p-2 rounded">
                <img
                  src={file.url}
                  alt={file.originalName}
                  className="w-full h-32 object-cover mb-2"
                />
                <p className="text-sm">{file.originalName}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**✅ Test:** Test sayfası açılmalı, medya seçici çalışmalı.

### 🔍 Adım 11: Hata Ayıklama ve Test (15 dakika)

#### **11.1 Yaygın Hatalar ve Çözümleri**

**Hata:** `Module not found: Can't resolve '@/components/ui/button'`
```bash
# Çözüm: Shadcn/UI komponentlerini yükle
npx shadcn-ui@latest add button
```

**Hata:** `Database connection failed`
```bash
# Çözüm: PostgreSQL çalıştığından emin ol
sudo service postgresql start
# veya
brew services start postgresql
```

**Hata:** `NextAuth configuration error`
```env
# Çözüm: NEXTAUTH_SECRET'ı kontrol et
NEXTAUTH_SECRET=en-az-32-karakter-uzunlugunda-gizli-anahtar
```

**Hata:** `Sharp module not found`
```bash
# Çözüm: Sharp'ı yeniden yükle
npm uninstall sharp
npm install sharp
```

#### **11.2 Test Senaryoları**

1. **Kategori Listesi Testi**
   - `/api/media/categories` endpoint'ini test et
   - Kategoriler doğru şekilde dönmeli

2. **Dosya Yükleme Testi**
   - Test sayfasından dosya yüklemeyi dene
   - Thumbnail'lar oluşmalı
   - Veritabanına kayıt düşmeli

3. **Dosya Seçim Testi**
   - Tek seçim modu test et
   - Çoklu seçim modu test et
   - Arama fonksiyonu test et

4. **Responsive Test**
   - Mobil cihazlarda test et
   - Tablet boyutunda test et
   - Desktop'ta test et

#### **11.3 Performance Kontrolleri**

```bash
# 11.3.1 Build testi
npm run build

# 11.3.2 Production testi
npm run start

# 11.3.3 Lighthouse testi
# Chrome DevTools > Lighthouse > Run audit
```

**✅ Test:** Tüm testler başarılı olmalı, performans skorları iyi olmalı.

## 6. Kullanım Örnekleri ve Özelleştirme

### 🎯 Temel Kullanım Örnekleri

#### **6.1 Tek Dosya Seçimi**

```typescript
"use client";

import { useState } from 'react';
import { MediaBrowserSimple } from '@/components/media/MediaBrowserSimple';
import { Button } from '@/components/ui/button';
import { GlobalMediaFile } from '@/types/media';

export function SingleFileSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<GlobalMediaFile | null>(null);

  const handleSelect = (files: GlobalMediaFile[]) => {
    setSelectedFile(files[0] || null);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        {selectedFile ? selectedFile.originalName : 'Dosya Seç'}
      </Button>

      <MediaBrowserSimple
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleSelect}
        multiple={false}
        title="Tek Dosya Seç"
        allowedTypes={['image/*']}
      />

      {selectedFile && (
        <div className="mt-4">
          <img
            src={selectedFile.url}
            alt={selectedFile.originalName}
            className="max-w-xs rounded"
          />
        </div>
      )}
    </div>
  );
}
```

#### **6.2 Çoklu Dosya Seçimi**

```typescript
"use client";

import { useState } from 'react';
import { MediaBrowserSimple } from '@/components/media/MediaBrowserSimple';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlobalMediaFile } from '@/types/media';

export function MultipleFileSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<GlobalMediaFile[]>([]);

  const handleSelect = (files: GlobalMediaFile[]) => {
    setSelectedFiles(files);
  };

  const removeFile = (fileId: number) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Dosyalar Seç ({selectedFiles.length})
      </Button>

      <MediaBrowserSimple
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleSelect}
        multiple={true}
        title="Çoklu Dosya Seç"
        allowedTypes={['image/*', 'video/*']}
        preSelected={selectedFiles}
      />

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold">Seçili Dosyalar:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file) => (
              <Badge
                key={file.id}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeFile(file.id)}
              >
                {file.originalName} ✕
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

#### **6.3 Kategori Filtreli Seçim**

```typescript
"use client";

import { useState } from 'react';
import { MediaBrowserSimple } from '@/components/media/MediaBrowserSimple';
import { Button } from '@/components/ui/button';
import { GlobalMediaFile } from '@/types/media';

export function CategoryFilteredSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<GlobalMediaFile[]>([]);

  const handleSelect = (files: GlobalMediaFile[]) => {
    setSelectedFiles(files);
  };

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Proje Resimleri Seç
      </Button>

      <MediaBrowserSimple
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleSelect}
        multiple={true}
        title="Proje Resimleri"
        categoryFilter={2} // Proje Resimleri kategori ID'si
        restrictCategorySelection={true}
        allowedTypes={['image/*']}
        customFolder="projects"
      />
    </div>
  );
}
```

#### **6.4 Form Entegrasyonu**

```typescript
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MediaBrowserSimple } from '@/components/media/MediaBrowserSimple';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlobalMediaFile } from '@/types/media';

interface FormData {
  title: string;
  description: string;
  images: GlobalMediaFile[];
}

export function FormWithMediaSelector() {
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const { register, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      images: []
    }
  });

  const selectedImages = watch('images');

  const handleMediaSelect = (files: GlobalMediaFile[]) => {
    setValue('images', files);
  };

  const onSubmit = (data: FormData) => {
    console.log('Form data:', data);
    // Form gönderme işlemi
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Başlık</Label>
        <Input {...register('title')} placeholder="Başlık girin" />
      </div>

      <div>
        <Label htmlFor="description">Açıklama</Label>
        <Input {...register('description')} placeholder="Açıklama girin" />
      </div>

      <div>
        <Label>Resimler ({selectedImages.length})</Label>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsMediaOpen(true)}
          className="w-full mt-2"
        >
          Resim Seç
        </Button>

        {selectedImages.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {selectedImages.map((image) => (
              <img
                key={image.id}
                src={image.thumbnailSmall || image.url}
                alt={image.originalName}
                className="w-full h-20 object-cover rounded"
              />
            ))}
          </div>
        )}
      </div>

      <MediaBrowserSimple
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={handleMediaSelect}
        multiple={true}
        title="Form Resimleri"
        allowedTypes={['image/*']}
        preSelected={selectedImages}
      />

      <Button type="submit">Kaydet</Button>
    </form>
  );
}
```

### 🎨 Özelleştirme Seçenekleri

#### **6.5 Tema Özelleştirmesi**

```typescript
// components/media/CustomMediaBrowser.tsx
"use client";

import { MediaBrowserSimple } from './MediaBrowserSimple';
import { GlobalMediaFile } from '@/types/media';

interface CustomMediaBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (files: GlobalMediaFile[]) => void;
  theme?: 'light' | 'dark' | 'blue';
}

export function CustomMediaBrowser({
  theme = 'light',
  ...props
}: CustomMediaBrowserProps) {
  const themeClasses = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-white',
    blue: 'bg-blue-50 text-blue-900'
  };

  return (
    <div className={themeClasses[theme]}>
      <MediaBrowserSimple
        {...props}
        className={`${themeClasses[theme]} custom-media-browser`}
      />
    </div>
  );
}
```

#### **6.6 Custom Dosya Kartları**

```typescript
// components/media/CustomFileCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GlobalMediaFile } from '@/types/media';
import { formatFileSize } from '@/lib/media-utils';

interface CustomFileCardProps {
  file: GlobalMediaFile;
  isSelected: boolean;
  onSelect: () => void;
  onCheckboxSelect: (e: React.MouseEvent) => void;
}

export function CustomFileCard({
  file,
  isSelected,
  onSelect,
  onCheckboxSelect
}: CustomFileCardProps) {
  const isImage = file.mimeType.startsWith('image/');

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'ring-2 ring-blue-500 shadow-lg transform scale-105'
          : 'hover:shadow-md hover:scale-102'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-0 relative">
        {/* Custom checkbox */}
        <div
          className="absolute top-2 left-2 z-10 cursor-pointer"
          onClick={onCheckboxSelect}
        >
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            isSelected
              ? 'bg-blue-500 border-blue-500 text-white'
              : 'bg-white border-gray-300 hover:border-blue-500'
          }`}>
            {isSelected && '✓'}
          </div>
        </div>

        {/* File preview with overlay */}
        <div className="relative w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden rounded-t">
          {isImage ? (
            <>
              <img
                src={file.thumbnailMedium || file.url}
                alt={file.alt || file.originalName}
                className="max-w-full max-h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200" />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                📄
              </div>
              <p className="text-xs text-center truncate w-full">
                {file.originalName}
              </p>
            </div>
          )}
        </div>

        {/* Enhanced file info */}
        <div className="p-3 bg-white">
          <p className="text-sm font-medium truncate mb-1" title={file.originalName}>
            {file.originalName}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
            {file.category && (
              <Badge variant="outline" className="text-xs">
                {file.category.name}
              </Badge>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {new Date(file.createdAt).toLocaleDateString('tr-TR')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### **6.7 Gelişmiş Arama ve Filtreleme**

```typescript
// components/media/AdvancedMediaBrowser.tsx
"use client";

import { useState, useEffect } from 'react';
import { MediaBrowserSimple } from './MediaBrowserSimple';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { GlobalMediaFile } from '@/types/media';

interface AdvancedFilters {
  search: string;
  fileType: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  sizeRange: {
    min: number;
    max: number;
  };
}

export function AdvancedMediaBrowser() {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilters>({
    search: '',
    fileType: 'all',
    dateRange: { from: null, to: null },
    sizeRange: { min: 0, max: 10485760 } // 10MB
  });

  const [filteredFiles, setFilteredFiles] = useState<GlobalMediaFile[]>([]);

  const applyFilters = (files: GlobalMediaFile[]) => {
    return files.filter(file => {
      // Search filter
      if (filters.search && !file.originalName.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // File type filter
      if (filters.fileType !== 'all' && !file.mimeType.startsWith(filters.fileType)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.from && new Date(file.createdAt) < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange.to && new Date(file.createdAt) > filters.dateRange.to) {
        return false;
      }

      // Size range filter
      if (file.size < filters.sizeRange.min || file.size > filters.sizeRange.max) {
        return false;
      }

      return true;
    });
  };

  return (
    <div>
      {/* Advanced Filter Panel */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-4">
        <h3 className="font-semibold">Gelişmiş Filtreler</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="text-sm font-medium">Arama</label>
            <Input
              placeholder="Dosya adı ara..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>

          {/* File Type */}
          <div>
            <label className="text-sm font-medium">Dosya Türü</label>
            <Select
              value={filters.fileType}
              onValueChange={(value) => setFilters(prev => ({ ...prev, fileType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="image">Resimler</SelectItem>
                <SelectItem value="video">Videolar</SelectItem>
                <SelectItem value="application">Belgeler</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-sm font-medium">Tarih Aralığı</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      `${filters.dateRange.from.toLocaleDateString()} - ${filters.dateRange.to.toLocaleDateString()}`
                    ) : (
                      filters.dateRange.from.toLocaleDateString()
                    )
                  ) : (
                    "Tarih seç"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: filters.dateRange.from || undefined,
                    to: filters.dateRange.to || undefined
                  }}
                  onSelect={(range) => setFilters(prev => ({
                    ...prev,
                    dateRange: {
                      from: range?.from || null,
                      to: range?.to || null
                    }
                  }))}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Size Range */}
          <div>
            <label className="text-sm font-medium">Dosya Boyutu (MB)</label>
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.sizeRange.min / 1048576}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  sizeRange: {
                    ...prev.sizeRange,
                    min: parseFloat(e.target.value) * 1048576 || 0
                  }
                }))}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.sizeRange.max / 1048576}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  sizeRange: {
                    ...prev.sizeRange,
                    max: parseFloat(e.target.value) * 1048576 || 10485760
                  }
                }))}
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={() => setIsOpen(true)}>
            Medya Seç
          </Button>
          <Button
            variant="outline"
            onClick={() => setFilters({
              search: '',
              fileType: 'all',
              dateRange: { from: null, to: null },
              sizeRange: { min: 0, max: 10485760 }
            })}
          >
            Filtreleri Temizle
          </Button>
        </div>
      </div>

      <MediaBrowserSimple
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={(files) => console.log('Selected:', files)}
        multiple={true}
        title="Gelişmiş Medya Seçici"
      />
    </div>
  );
}
```

### 📚 Prop Referansı

#### **MediaBrowserSimple Props**

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `isOpen` | `boolean` | - | Modal açık/kapalı durumu |
| `onClose` | `() => void` | - | Modal kapatma callback'i |
| `onSelect` | `(files: GlobalMediaFile[]) => void` | - | Dosya seçim callback'i |
| `multiple` | `boolean` | `false` | Çoklu seçim aktif/pasif |
| `allowedTypes` | `string[]` | `undefined` | İzin verilen dosya türleri |
| `categoryFilter` | `number` | `undefined` | Kategori filtresi ID'si |
| `restrictCategorySelection` | `boolean` | `false` | Kategori değiştirmeyi engelle |
| `title` | `string` | `"Medya Seç"` | Modal başlığı |
| `className` | `string` | `""` | Ek CSS sınıfları |
| `preSelected` | `GlobalMediaFile[]` | `[]` | Önceden seçili dosyalar |
| `customFolder` | `string` | `"media"` | Yükleme klasörü |

#### **Allowed Types Örnekleri**

```typescript
// Sadece resimler
allowedTypes={['image/*']}

// Resim ve videolar
allowedTypes={['image/*', 'video/*']}

// Belirli formatlar
allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}

// Tüm dosyalar
allowedTypes={undefined} // veya boş array
```

### 🚀 Production Optimizasyonları

#### **6.8 Lazy Loading**

```typescript
// components/media/LazyMediaBrowser.tsx
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const MediaBrowserSimple = dynamic(
  () => import('./MediaBrowserSimple').then(mod => ({ default: mod.MediaBrowserSimple })),
  {
    loading: () => <div>Medya seçici yükleniyor...</div>,
    ssr: false
  }
);

export function LazyMediaBrowser(props: any) {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <MediaBrowserSimple {...props} />
    </Suspense>
  );
}
```

#### **6.9 Caching ve Performance**

```typescript
// lib/media-cache.ts
import { GlobalMediaFile } from '@/types/media';

class MediaCache {
  private cache = new Map<string, GlobalMediaFile[]>();
  private cacheTimeout = 5 * 60 * 1000; // 5 dakika

  set(key: string, data: GlobalMediaFile[]) {
    this.cache.set(key, data);
    setTimeout(() => {
      this.cache.delete(key);
    }, this.cacheTimeout);
  }

  get(key: string): GlobalMediaFile[] | null {
    return this.cache.get(key) || null;
  }

  clear() {
    this.cache.clear();
  }
}

export const mediaCache = new MediaCache();
```

---

## 🎉 Sonuç

Bu rehber ile MediaBrowserSimple komponentini başka bir Next.js projesinde başarıyla kullanabilirsiniz. Rehber şunları kapsar:

✅ **Komponent analizi ve bağımlılık haritası**
✅ **Tüm gerekli dosyalar ve kod blokları**
✅ **Backend API gereksinimleri**
✅ **Kurulum ve konfigürasyon**
✅ **Adım adım entegrasyon kılavuzu**
✅ **Kullanım örnekleri ve özelleştirme seçenekleri**

### 📞 Destek

Entegrasyon sırasında sorun yaşarsanız:

1. **Hata loglarını kontrol edin**
2. **Test senaryolarını çalıştırın**
3. **Environment değişkenlerini doğrulayın**
4. **Veritabanı bağlantısını test edin**

### 🔄 Güncellemeler

Bu rehber düzenli olarak güncellenir. Yeni özellikler ve iyileştirmeler için takip edin.

---

**📝 Not:** Bu rehber, MediaBrowserSimple komponentinin tam işlevsel bir kopyasını oluşturmanız için gerekli tüm bilgileri içerir. Her adımı dikkatlice takip ederek başarılı bir entegrasyon gerçekleştirebilirsiniz.
