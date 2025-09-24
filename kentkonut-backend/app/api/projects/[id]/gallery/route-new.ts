import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Yeni şemaya uygun olarak güncellenmiş API

// Galeri yapısı için interface'ler
interface GalleryItem {
  id: number;
  title: string;
  description?: string;
  order: number;
  hasMedia: boolean;   // Alt medya öğeleri var mı?
  mediaCount: number;  // Alt medya sayısı
  subGalleries?: GalleryItem[]; // Alt galeriler
}

interface GalleryResponse {
  success: boolean;
  data: {
    galleries: GalleryItem[];
    breadcrumb?: {
      id: number;
      title: string;
      parentId?: number;
    }[];
  };
}

// GET: Galeri yapısını getir
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id);
    
    if (isNaN(projectId)) {
      return new NextResponse("Invalid project ID", { status: 400 });
    }

    console.log(`[API] Getting gallery structure for project: ${projectId}`);

    // Tüm galerileri getir
    const galleries = await db.projectGallery.findMany({
      where: { 
        projectId,
        isActive: true
      },
      include: {
        children: {
          include: {
            children: true,
            items: {
              include: {
                media: true
              }
            }
          }
        },
        items: {
          include: {
            media: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    console.log(`[API] Found ${galleries.length} galleries`);

    // Kök seviyesindeki galerileri bul (parentId = null)
    const rootGalleries = galleries.filter(gallery => gallery.parentId === null);
    
    // Galeri yapısını oluştur
    const galleryStructure = buildGalleryStructure(rootGalleries, galleries);

    return NextResponse.json({
      success: true,
      data: {
        galleries: galleryStructure
      }
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery GET error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST: Yeni galeri oluştur
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Yetkilendirme kontrolü
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const projectId = parseInt(params.id);
    if (isNaN(projectId)) {
      return new NextResponse("Invalid project ID", { status: 400 });
    }

    // Proje var mı kontrol et
    const project = await db.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    // Request body'den verileri al
    const body = await req.json();
    const { title, description, parentId, order } = body;

    // Validasyon
    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    // Parent ID varsa, parent'ın varlığını kontrol et
    if (parentId) {
      const parent = await db.projectGallery.findUnique({
        where: { id: parentId }
      });

      if (!parent) {
        return new NextResponse("Parent gallery not found", { status: 404 });
      }

      if (parent.projectId !== projectId) {
        return new NextResponse("Parent gallery does not belong to this project", { status: 400 });
      }
    }

    // Oluşturulacak veri
    const createData = {
      projectId,
      title,
      description: description || "",
      parentId: parentId || null,
      order: order || 0,
      isActive: true
    };

    console.log(`[API] Creating gallery with data:`, createData);

    // Veritabanı işlemini bir transaction içinde yapıyoruz
    const gallery = await db.$transaction(async (tx) => {
      const item = await tx.projectGallery.create({
        data: createData,
        include: {
          children: true,
          items: {
            include: {
              media: true
            }
          }
        }
      });
      
      console.log('✅ [API] Gallery created in transaction:', item);
      return item;
    });

    return NextResponse.json({
      success: true,
      data: gallery
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery POST error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Helper: Galeri yapısını oluştur
function buildGalleryStructure(rootGalleries: any[], allGalleries: any[]): GalleryItem[] {
  return rootGalleries.map(gallery => {
    // Alt galerileri bul
    const childGalleries = allGalleries.filter(g => g.parentId === gallery.id);
    
    // Medya öğelerini say
    const mediaCount = countTotalMediaItems(gallery, allGalleries);
    
    // Galeri nesnesini oluştur
    return {
      id: gallery.id,
      title: gallery.title,
      description: gallery.description || "",
      order: gallery.order,
      hasMedia: gallery.items.length > 0,
      mediaCount,
      subGalleries: childGalleries.length > 0 
        ? buildGalleryStructure(childGalleries, allGalleries) 
        : undefined
    };
  });
}

// Helper: Toplam medya sayısını hesapla (alt galeriler dahil)
function countTotalMediaItems(gallery: any, allGalleries: any[]): number {
  // Bu galerinin doğrudan medya öğeleri
  let count = gallery.items.length;
  
  // Alt galerilerin medya öğeleri
  const childGalleries = allGalleries.filter(g => g.parentId === gallery.id);
  childGalleries.forEach(childGallery => {
    count += countTotalMediaItems(childGallery, allGalleries);
  });
  
  return count;
}