import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// PRD'ye uygun tab yapısı için interface'ler
interface TabItem {
  id: number;
  title: string;
  description?: string;
  order: number;
  category: string;
  hasOwnMedia: boolean; // Tab'ın kendi medyası var mı?
  mediaCount: number;   // Tab'ın içerdiği toplam medya sayısı
  subTabs?: TabItem[];  // Alt tablar
}

interface TabGalleryResponse {
  success: boolean;
  data: {
    tabs: TabItem[];
    breadcrumb?: {
      id: number;
      title: string;
      parentId?: number;
    }[];
  };
}

// GET: Tab yapısını getir
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id);
    
    if (isNaN(projectId)) {
      return new NextResponse("Invalid project ID", { status: 400 });
    }

    console.log(`[API] Getting gallery tabs for project: ${projectId}`);

    // Tüm galeri öğelerini getir
    const galleryItems = await db.projectGalleryItem.findMany({
      where: { 
        projectId,
        isActive: true
      },
      include: {
        media: true,
        parent: true,
        children: {
          include: {
            media: true,
            children: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    console.log(`[API] Found ${galleryItems.length} gallery items`);

    // PRD'ye uygun tab yapısını oluştur
    const tabStructure = buildTabStructure(galleryItems);

    return NextResponse.json({
      success: true,
      data: {
        tabs: tabStructure
      }
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery GET error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST: Yeni galeri öğesi oluştur
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
    const { mediaId, title, description, parentId, order, isFolder, category } = body;

    // Validasyon
    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    if (!isFolder && !mediaId) {
      return new NextResponse("Media ID is required for non-folder items", { status: 400 });
    }

    // Parent ID varsa, parent'ın varlığını kontrol et
    if (parentId) {
      const parent = await db.projectGalleryItem.findUnique({
        where: { id: parentId }
      });

      if (!parent) {
        return new NextResponse("Parent gallery item not found", { status: 404 });
      }

      if (parent.projectId !== projectId) {
        return new NextResponse("Parent gallery item does not belong to this project", { status: 400 });
      }
    }

    // Oluşturulacak veri
    const createData = {
      projectId,
      title,
      description: description || "",
      parentId: parentId || null,
      order: order || 0,
      isFolder: isFolder || false,
      isActive: true,
      mediaId: isFolder ? null : mediaId,
      category: category || "DIS_MEKAN"
    };

    console.log(`[API] Creating gallery item with data:`, createData);

    // Veritabanı işlemini bir transaction içinde yapıyoruz
    const galleryItem = await db.$transaction(async (tx) => {
      const item = await tx.projectGalleryItem.create({
        data: createData,
        include: {
          media: true,
          parent: true,
          children: true
        }
      });
      
      console.log('✅ [API] Gallery item created in transaction:', item);
      return item;
    });

    return NextResponse.json({
      success: true,
      data: galleryItem
    });
  } catch (error) {
    console.error("[API_ERROR] Gallery POST error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Helper: Tab yapısını oluştur
function buildTabStructure(items: any[]): TabItem[] {
  // Önce tüm itemları ID'lerine göre map'leyelim
  const itemMap = new Map();
  items.forEach(item => {
    itemMap.set(item.id, item);
  });

  // Root level tabları bul (parentId null olanlar)
  const rootTabs = items.filter(item => item.parentId === null);
  
  // Her bir root tab için TabItem oluştur
  return rootTabs.map(rootItem => buildTabFromItem(rootItem, itemMap));
}

// Helper: Tek bir tab oluştur
function buildTabFromItem(item: any, itemMap: Map<number, any>): TabItem {
  // Alt tabları bul (parentId bu item'ın ID'si olanlar)
  const childItems = Array.from(itemMap.values()).filter(i => i.parentId === item.id);
  
  // Alt tabları recursive olarak oluştur
  const subTabs = childItems.map(child => buildTabFromItem(child, itemMap));
  
  // Tab'ın kendi medyası var mı?
  const hasOwnMedia = !!item.mediaId;
  
  // Tab'ın içerdiği toplam medya sayısı
  const mediaCount = countMediaInTab(item, itemMap);
  
  return {
    id: item.id,
    title: item.title,
    description: item.description || "",
    order: item.order,
    category: item.category,
    hasOwnMedia,
    mediaCount,
    subTabs: subTabs.length > 0 ? subTabs : undefined
  };
}

// Helper: Tab içindeki toplam medya sayısını hesapla
function countMediaInTab(item: any, itemMap: Map<number, any>): number {
  // Eğer item'ın kendisi bir medyaysa +1
  let count = item.mediaId ? 1 : 0;
  
  // Alt itemları bul
  const childItems = Array.from(itemMap.values()).filter(i => i.parentId === item.id);
  
  // Alt itemların medya sayılarını recursive olarak topla
  childItems.forEach(child => {
    count += countMediaInTab(child, itemMap);
  });
  
  return count;
}