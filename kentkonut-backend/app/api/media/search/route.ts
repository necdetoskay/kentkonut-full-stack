import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Advanced search for media files
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const categoryId = searchParams.get("category");
    const type = searchParams.get("type");
    const minSize = searchParams.get("minSize");
    const maxSize = searchParams.get("maxSize");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build complex where clause
    const where: any = {};

    // Text search
    if (query) {
      where.OR = [
        { originalName: { contains: query, mode: "insensitive" } },
        { alt: { contains: query, mode: "insensitive" } },
        { caption: { contains: query, mode: "insensitive" } },
        { filename: { contains: query, mode: "insensitive" } },
      ];
    }

    // Category filter
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    // File type filter
    if (type) {
      switch (type) {
        case "image":
          where.mimeType = { startsWith: "image/" };
          break;
        case "video":
          where.mimeType = { startsWith: "video/" };
          break;
        case "document":
          where.mimeType = { 
            in: [
              "application/pdf",
              "application/msword",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "text/plain"
            ]
          };
          break;
      }
    }

    // File size filters
    if (minSize || maxSize) {
      where.size = {};
      if (minSize) {
        where.size.gte = parseInt(minSize);
      }
      if (maxSize) {
        where.size.lte = parseInt(maxSize);
      }
    }

    // Date range filters
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Execute search
    const [media, total] = await Promise.all([
      db.media.findMany({
        where,
        include: {
          category: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.media.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get search statistics
    const stats = await getSearchStats(where);

    return NextResponse.json({
      query: {
        q: query,
        category: categoryId,
        type,
        minSize,
        maxSize,
        dateFrom,
        dateTo,
      },
      data: media,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      stats,
    });

  } catch (error) {
    console.error("[MEDIA_SEARCH]", error);
    return NextResponse.json(
      { error: "Arama sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Get search statistics
async function getSearchStats(where: any) {
  try {
    const [
      totalFiles,
      totalSize,
      typeStats,
      categoryStats
    ] = await Promise.all([
      // Total files count
      db.media.count({ where }),
      
      // Total size
      db.media.aggregate({
        where,
        _sum: { size: true },
      }),
      
      // File type distribution
      db.media.groupBy({
        where,
        by: ['mimeType'],
        _count: { mimeType: true },
        orderBy: { _count: { mimeType: 'desc' } },
      }),
      
      // Category distribution
      db.media.groupBy({
        where,
        by: ['categoryId'],
        _count: { categoryId: true },
        orderBy: { _count: { categoryId: 'desc' } },
      }),
    ]);

    return {
      totalFiles,
      totalSize: totalSize._sum.size || 0,
      typeDistribution: typeStats,
      categoryDistribution: categoryStats,
    };
  } catch (error) {
    console.error("Error getting search stats:", error);
    return {
      totalFiles: 0,
      totalSize: 0,
      typeDistribution: [],
      categoryDistribution: [],
    };
  }
}
