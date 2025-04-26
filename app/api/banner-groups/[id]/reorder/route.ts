import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

interface ReorderRequest {
  bannerIds: Array<{
    id: number
    order: number
  }>
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await params
    const { bannerIds } = (await req.json()) as ReorderRequest

    // Tüm banner sıralamalarını tek bir transaction içinde güncelle
    await db.$transaction(
      bannerIds.map(({ id: bannerId, order }) =>
        db.banner.update({
          where: { id: bannerId },
          data: { order }
        })
      )
    )

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("[BANNER_REORDER]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 