import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// GET all tags
export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const where: any = {};
    
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const tags = await db.tag.findMany({
      where,
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: {
            newsTags: true,
            projectTags: true
          }
        }
      }
    });

    // Transform the response to include counts
    const tagsWithCount = tags.map(tag => ({
      ...tag,
      newsCount: tag._count.newsTags,
      projectCount: tag._count.projectTags
    }));

    return NextResponse.json(tagsWithCount);
  } catch (error) {
    console.error("[TAGS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
