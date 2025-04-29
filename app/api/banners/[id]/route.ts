import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bannerSchema } from "@/lib/validations/banner";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const banner = await db.banner.findUnique({
      where: {
        id: parseInt(params.id)
      },
      include: {
        statistics: true
      }
    });

    if (!banner) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error("[BANNER_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const bannerId = parseInt(params.id);
    
    // Güncellemeden önce mevcut banner'ı al
    const existingBanner = await db.banner.findUnique({
      where: { id: bannerId },
      select: { imageUrl: true }
    });
    
    if (!existingBanner) {
      return new NextResponse("Banner bulunamadı", { status: 404 });
    }

    const json = await req.json();
    const body = bannerSchema.parse(json);

    const banner = await db.banner.update({
      where: {
        id: bannerId
      },
      data: {
        title: body.title,
        imageUrl: body.imageUrl,
        linkUrl: body.linkUrl,
        order: body.order,
        active: body.isActive,
        startDate: body.startDate,
        endDate: body.endDate,
        bannerGroupId: body.groupId
      }
    });
    
    // Görsel değiştiyse yeni medyayı referanslı olarak işaretle
    if (body.imageUrl && body.imageUrl !== existingBanner.imageUrl && body.imageUrl.includes('/uploads/')) {
      try {
        // İlgili medya dosyasını bul
        const mediaUrl = body.imageUrl;
        const mediaFilename = mediaUrl.split('/').pop(); // URL'den dosya adını al
        
        // Medya kaydını güncelle
        try {
          // Önce medya kaydını bul
          const mediaRecord = await prisma.media.findFirst({
            where: {
              OR: [
                { url: mediaUrl },
                { filename: mediaFilename || '' }
              ]
            }
          });
          
          if (mediaRecord) {
            // Kayıt varsa güncelle
            let refs = mediaRecord.references || [];
            // Aynı referans yoksa ekle
            if (!refs.includes(`banner:${banner.id}`)) {
              refs.push(`banner:${banner.id}`);
            }
            
            const mediaUpdate = await prisma.media.update({
              where: { id: mediaRecord.id },
              data: {
                isReferenced: true,
                references: refs,
                lastAccessed: new Date()
              }
            });
            
            console.log(`[BANNERS_PUT] Medya kaydı güncellendi:`, mediaUpdate.id);
            
            // Eski görseli kullanan başka kayıt yoksa işaretini kaldır
            if (existingBanner.imageUrl && existingBanner.imageUrl.includes('/uploads/')) {
              await updateMediaReferenceStatus(existingBanner.imageUrl, `banner:${banner.id}`);
            }
          } else {
            console.log(`[BANNERS_PUT] İlgili medya kaydı bulunamadı:`, mediaUrl);
          }
        } catch (updateError) {
          console.error("[BANNERS_PUT] Medya kaydı güncellenirken detaylı hata:", updateError);
        }
      } catch (mediaUpdateError) {
        console.error("[BANNERS_PUT] Medya kaydı güncellenirken hata:", mediaUpdateError);
        // Banner kaydı güncellendi, ancak medya ilişkilendirme hatası kritik değil
        // İşlemi devam ettir
      }
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error("[BANNER_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const bannerId = parseInt(params.id);
    
    // Silmeden önce mevcut banner'ı al
    const existingBanner = await db.banner.findUnique({
      where: { id: bannerId },
      select: { imageUrl: true }
    });
    
    if (!existingBanner) {
      return new NextResponse("Banner bulunamadı", { status: 404 });
    }

    await db.banner.delete({
      where: {
        id: bannerId
      }
    });
    
    // Bannerın kullandığı görselin referans durumunu güncelle
    if (existingBanner.imageUrl && existingBanner.imageUrl.includes('/uploads/')) {
      try {
        await updateMediaReferenceStatus(existingBanner.imageUrl, `banner:${bannerId}`);
      } catch (mediaUpdateError) {
        console.error("[BANNERS_DELETE] Medya kaydı güncellenirken hata:", mediaUpdateError);
        // Banner kaydı silindi, ancak medya ilişkilendirme hatası kritik değil
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BANNER_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Medya referans durumunu güncelleme yardımcı fonksiyonu
async function updateMediaReferenceStatus(mediaUrl: string, referenceToRemove: string) {
  try {
    const mediaFilename = mediaUrl.split('/').pop(); // URL'den dosya adını al
    
    // Medya kaydını bul
    const media = await prisma.media.findFirst({
      where: {
        OR: [
          { url: mediaUrl },
          { filename: mediaFilename || '' }
        ]
      }
    });
    
    if (!media) return;
    
    // Referansları güncelle
    let references = media.references || [];
    
    // Belirtilen referansı çıkar
    references = references.filter(ref => ref !== referenceToRemove);
    
    // Eğer başka referans kalmadıysa isReferenced'ı false yap
    const isReferenced = references.length > 0;
    
    try {
      // Medya kaydını güncelle
      await prisma.media.update({
        where: { id: media.id },
        data: {
          isReferenced,
          references,
          lastAccessed: new Date()
        }
      });
      
      console.log(`[MEDIA_UPDATE] Medya referans durumu güncellendi: ${mediaUrl}, isReferenced: ${isReferenced}`);
    } catch (updateErr) {
      console.error(`Medya kaydı güncellenirken hata (${media.id}):`, updateErr);
    }
  } catch (error) {
    console.error("Medya referans durumu güncellenirken genel hata:", error);
    // Hata fırlatma, bu fonksiyon kritik bir işlem değil
  }
} 