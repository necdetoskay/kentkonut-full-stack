
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import * as z from "zod";

const postSchema = z.object({
    title: z.string().min(1),
    hedefUrl: z.string().min(1),
    sayfaId: z.string().cuid(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedData = postSchema.parse(body);

        const newOge = await db.hizliErisimOgesi.create({
            data: {
                title: validatedData.title,
                hedefUrl: validatedData.hedefUrl,
                sayfaId: validatedData.sayfaId,
                // sira will default to 0, can be handled later if ordering is needed
            }
        });

        return NextResponse.json(newOge, { status: 201 });

    } catch (error) {
        console.error("[HIZLI_ERISIM_OGELERI_POST]", error);
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 });
        }
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
