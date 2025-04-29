import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Mevcut içerik referanslarını tarayıp medya dosyalarının referanslarını günceller
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    
    // Sadece admin kullanıcıların senkronizasyon yapabilmesini sağla
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })
    
    if (user?.role !== 'ADMIN') {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Tüm medya kayıtlarını önce sıfırla
    await prisma.media.updateMany({
      data: {
        isReferenced: false,
        references: []
      }
    });
    
    let processedCount = 0;
    let referencesFound = 0;
    
    // Banner kayıtlarını tara
    const banners = await prisma.banner.findMany({
      select: {
        id: true,
        imageUrl: true
      }
    });
    
    for (const banner of banners) {
      if (banner.imageUrl && banner.imageUrl.includes('/uploads/')) {
        const filename = banner.imageUrl.split('/').pop();
        
        if (filename) {
          const mediaRef = `banner:${banner.id}`;
          
          // Medya kaydını güncelle
          try {
            // Önce medya kaydını bul
            const mediaRecord = await prisma.media.findFirst({
              where: {
                OR: [
                  { url: banner.imageUrl },
                  { filename: filename }
                ]
              }
            });
            
            if (mediaRecord) {
              // Kayıt varsa güncelle
              let refs = mediaRecord.references || [];
              // Aynı referans yoksa ekle
              if (!refs.includes(mediaRef)) {
                refs.push(mediaRef);
              }
              
              await prisma.media.update({
                where: { id: mediaRecord.id },
                data: {
                  isReferenced: true,
                  references: refs
                }
              });
            }
          } catch (err) {
            console.error(`Banner ${banner.id} için medya güncelleme hatası:`, err);
            // Devam et, kritik değil
          }
          
          referencesFound++;
        }
      }
      
      processedCount++;
    }
    
    // Proje kayıtlarını tara
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        coverImage: true
      }
    });
    
    for (const project of projects) {
      if (project.coverImage && project.coverImage.includes('/uploads/')) {
        const filename = project.coverImage.split('/').pop();
        
        if (filename) {
          const mediaRef = `project:${project.id}`;
          
          // Medya kaydını güncelle
          try {
            // Önce medya kaydını bul
            const mediaRecord = await prisma.media.findFirst({
              where: {
                OR: [
                  { url: project.coverImage },
                  { filename: filename }
                ]
              }
            });
            
            if (mediaRecord) {
              // Kayıt varsa güncelle
              let refs = mediaRecord.references || [];
              // Aynı referans yoksa ekle
              if (!refs.includes(mediaRef)) {
                refs.push(mediaRef);
              }
              
              await prisma.media.update({
                where: { id: mediaRecord.id },
                data: {
                  isReferenced: true,
                  references: refs
                }
              });
            }
          } catch (err) {
            console.error(`Proje ${project.id} için medya güncelleme hatası:`, err);
            // Devam et, kritik değil
          }
          
          referencesFound++;
        }
      }
      
      processedCount++;
    }
    
    // Proje görselleri tara
    const projectImages = await prisma.projectImage.findMany({
      select: {
        id: true,
        url: true,
        projectId: true
      }
    });
    
    for (const image of projectImages) {
      if (image.url && image.url.includes('/uploads/')) {
        const filename = image.url.split('/').pop();
        
        if (filename) {
          const mediaRef = `projectImage:${image.id}`;
          
          // Medya kaydını güncelle
          try {
            // Önce medya kaydını bul
            const mediaRecord = await prisma.media.findFirst({
              where: {
                OR: [
                  { url: image.url },
                  { filename: filename }
                ]
              }
            });
            
            if (mediaRecord) {
              // Kayıt varsa güncelle
              let refs = mediaRecord.references || [];
              // Aynı referans yoksa ekle
              if (!refs.includes(mediaRef)) {
                refs.push(mediaRef);
              }
              
              await prisma.media.update({
                where: { id: mediaRecord.id },
                data: {
                  isReferenced: true,
                  references: refs
                }
              });
            }
          } catch (err) {
            console.error(`Proje görseli ${image.id} için medya güncelleme hatası:`, err);
            // Devam et, kritik değil
          }
          
          referencesFound++;
        }
      }
      
      processedCount++;
    }
    
    // Proje videoları tara
    const projectVideos = await prisma.projectVideo.findMany({
      select: {
        id: true,
        url: true,
        projectId: true
      }
    });
    
    for (const video of projectVideos) {
      if (video.url && video.url.includes('/uploads/')) {
        const filename = video.url.split('/').pop();
        
        if (filename) {
          const mediaRef = `projectVideo:${video.id}`;
          
          // Medya kaydını güncelle
          try {
            // Önce medya kaydını bul
            const mediaRecord = await prisma.media.findFirst({
              where: {
                OR: [
                  { url: video.url },
                  { filename: filename }
                ]
              }
            });
            
            if (mediaRecord) {
              // Kayıt varsa güncelle
              let refs = mediaRecord.references || [];
              // Aynı referans yoksa ekle
              if (!refs.includes(mediaRef)) {
                refs.push(mediaRef);
              }
              
              await prisma.media.update({
                where: { id: mediaRecord.id },
                data: {
                  isReferenced: true,
                  references: refs
                }
              });
            }
          } catch (err) {
            console.error(`Proje videosu ${video.id} için medya güncelleme hatası:`, err);
            // Devam et, kritik değil
          }
          
          referencesFound++;
        }
      }
      
      processedCount++;
    }
    
    // Toplam medya sayısını al
    const totalMediaCount = await prisma.media.count();
    const referencedMediaCount = await prisma.media.count({
      where: {
        isReferenced: true
      }
    });
    
    return NextResponse.json({
      success: true,
      processedCount,
      referencesFound,
      totalMediaCount,
      referencedMediaCount,
      message: "Medya referansları başarıyla güncellendi"
    });
    
  } catch (error) {
    console.error("Media reference sync error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 