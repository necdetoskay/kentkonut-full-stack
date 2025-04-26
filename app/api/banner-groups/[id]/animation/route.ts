import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const animationSchema = z.object({
  animation: z.enum(["FADE", "SLIDE", "ZOOM", "ROTATE", "BLUR", "FLIP", "ELASTIC", "WAVE", "STEP", "SPIRAL"])
})

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
    const body = await req.json()
    
    const { animation } = animationSchema.parse(body)

    const updatedGroup = await db.bannerGroup.update({
      where: {
        id: parseInt(id)
      },
      data: {
        animation,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedGroup)
  } catch (error) {
    console.error("[BANNER_GROUP_ANIMATION_UPDATE]", error)
    if (error instanceof z.ZodError) {
      return new NextResponse("Geçersiz animasyon tipi", { status: 400 })
    }
    return new NextResponse("Internal error", { status: 500 })
  }
} 