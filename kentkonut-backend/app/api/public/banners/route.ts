import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { withCors, handleCorsPreflightRequest } from "@/lib/cors";

// OPTIONS /api/public/banners - Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflightRequest(request);
}

// Public banners endpoint - authentication gerektirmez (CORS enabled)
// Frontend için aktif banner gruplarını döner
export const GET = withCors(async (req: NextRequest) => {
  // Rate limit kontrolü
  const rl = rateLimit(req as any); // Next.js API route'larında Request yerine NextRequest kullanılabilir, burada type cast yapıyoruz
  if (rl) return rl;
  try {
    console.log("[PUBLIC_BANNERS_GET] Public banners endpoint called");

    const url = new URL(req.url);
    const groupId = url.searchParams.get('groupId');

    if (groupId) {
      // Belirli bir grup için bannerları getir
      const bannerGroup = await db.bannerGroup.findFirst({
        where: {
          id: parseInt(groupId),
          isActive: true,
        },
        include: {
          banners: {
            where: {
              isActive: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      });

      if (!bannerGroup) {
        return new NextResponse("Banner group not found", { status: 404 });
      }

      return NextResponse.json(bannerGroup);
    } else {
      // Tüm aktif banner gruplarını getir
      const bannerGroups = await db.bannerGroup.findMany({
        where: {
          isActive: true,
        },
        include: {
          banners: {
            where: {
              isActive: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          id: 'asc',
        },
      });

      return NextResponse.json(bannerGroups);
    }
  } catch (error) {
    console.error("[PUBLIC_BANNERS_GET] Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
});
