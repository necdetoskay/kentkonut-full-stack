import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// This API endpoint will update a list of media items to be assigned to the Projects category
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify the user has admin rights
    const adminUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Get the mediaIds array from the request body
    const body = await req.json();
    
    if (!body.mediaIds || !Array.isArray(body.mediaIds) || body.mediaIds.length === 0) {
      return new NextResponse("Invalid request body. Expected mediaIds array.", { status: 400 });
    }    // Get the Projects category (ID 3 as per MEDIA_CATEGORIES.PROJECT_IMAGES.id)
    const projectCategoryId = 3; // This hardcoded value matches MEDIA_CATEGORIES.PROJECT_IMAGES.id
    const projectsCategory = await db.mediaCategory.findUnique({
      where: { id: projectCategoryId }
    });

    if (!projectsCategory) {
      return new NextResponse("Projects category not found", { status: 404 });
    }    // Update each media item to assign it to the Projects category
    const updates = await Promise.all(
      body.mediaIds.map((mediaId: string) =>
        db.media.update({
          where: { id: mediaId },
          data: { categoryId: projectsCategory.id },
          select: { id: true, filename: true, categoryId: true }
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `${updates.length} media items updated to Projects category`,
      updatedItems: updates
    });
  } catch (error) {
    console.error("[MEDIA_UPDATE_CATEGORY]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
