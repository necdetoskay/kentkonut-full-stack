import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const pageUrl = searchParams.get('url');

        if (!pageUrl) {
            return new NextResponse("Sayfa URL'si gerekli", { status: 400 });
        }

        // Find the HizliErisimSayfa entry for the given URL
        const hizliErisimSayfa = await db.hizliErisimSayfa.findUnique({
                        where: {
                sayfaUrl: pageUrl,
            },
            include: {
                                linkler: {
                    orderBy: {
                        sira: 'asc',
                    },
                },
            },
        });

        if (!hizliErisimSayfa || hizliErisimSayfa.linkler.length === 0) {
            return NextResponse.json(null);
        }

        // Increment viewCount for the links that are about to be displayed
        const linkIds = hizliErisimSayfa.linkler.map(link => link.id);
        if (linkIds.length > 0) {
            await db.hizliErisimOgesi.updateMany({
                where: {
                    id: { in: linkIds },
                },
                data: {
                    viewCount: {
                        increment: 1,
                    },
                },
            });
        }

        return NextResponse.json(hizliErisimSayfa);

    } catch (error) {
        console.error("[HIZLI_ERISIM_FRONTEND_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}