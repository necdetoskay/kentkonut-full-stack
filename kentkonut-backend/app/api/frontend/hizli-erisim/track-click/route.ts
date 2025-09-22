import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import * as z from "zod";

const postSchema = z.object({
    id: z.string().cuid(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedData = postSchema.parse(body);

        await db.hizliErisimOgesi.update({
            where: {
                id: validatedData.id,
            },
            data: {
                clickCount: {
                    increment: 1,
                },
                lastClickedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("[HIZLI_ERISIM_TRACK_CLICK_POST]", error);
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 });
        }
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}