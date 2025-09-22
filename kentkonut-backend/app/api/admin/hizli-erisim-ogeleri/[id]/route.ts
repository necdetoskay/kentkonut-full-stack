
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import * as z from "zod";

// Schema for PUT request validation
const putSchema = z.object({
    title: z.string().min(1),
    hedefUrl: z.string().min(1),
});

// --- UPDATE an existing link ---
export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        if (!params.id) {
            return new NextResponse("ID Gerekli", { status: 400 });
        }

        const body = await req.json();
        const validatedData = putSchema.parse(body);

        const updatedOge = await db.hizliErisimOgesi.update({
            where: { id: params.id },
            data: {
                title: validatedData.title,
                hedefUrl: validatedData.hedefUrl,
            }
        });

        return NextResponse.json(updatedOge);

    } catch (error) {
        console.error("[HIZLI_ERISIM_OGESI_PUT]", error);
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 });
        }
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


// --- DELETE a link ---
export async function DELETE(
    req: Request, // req is not used but required by the function signature
    { params }: { params: { id: string } }
) {
    try {
        if (!params.id) {
            return new NextResponse("ID Gerekli", { status: 400 });
        }

        await db.hizliErisimOgesi.delete({
            where: { id: params.id },
        });

        return new NextResponse("Link başarıyla silindi", { status: 200 });

    } catch (error) {
        console.error("[HIZLI_ERISIM_OGESI_DELETE]", error);
        // Handle cases where the item to be deleted is not found
        if ((error as any).code === 'P2025') { 
            return new NextResponse("Silinecek link bulunamadı", { status: 404 });
        }
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
