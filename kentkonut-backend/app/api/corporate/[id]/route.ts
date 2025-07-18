import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const updateCorporateContentSchema = z.object({
  title: z.string().min(1, "Başlık gerekli").optional(),
  content: z.string().min(1, "İçerik gerekli").optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  icon: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional()
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const validation = updateCorporateContentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      )
    }

    const updatedContent = await db.corporateContent.update({
      where: { id },
      data: validation.data
    })

    return NextResponse.json(updatedContent)
  } catch (error) {
    console.error('Corporate content update error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await db.corporateContent.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Corporate content delete error:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
