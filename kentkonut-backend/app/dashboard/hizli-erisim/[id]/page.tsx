
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { HizliErisimOgeClient } from "./_components/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HizliErisimDetayPageProps {
  params: {
    id: string;
  };
}

const HizliErisimDetayPage = async ({ params }: HizliErisimDetayPageProps) => {
  const hizliErisimSayfa = await db.hizliErisimSayfa.findUnique({
    where: {
      id: params.id,
    },
    include: {
      linkler: {
        orderBy: {
          sira: "asc",
        },
      },
    },
  });

  if (!hizliErisimSayfa) {
    return notFound();
  }

  const formattedData = hizliErisimSayfa.linkler.map((link) => ({
    id: link.id,
    title: link.title,
    hedefUrl: link.hedefUrl,
    sira: link.sira,
    clickCount: link.clickCount,
    viewCount: link.viewCount,
    lastClickedAt: link.lastClickedAt?.toLocaleDateString('tr-TR') || '-',
  }));

  return (
    <div className="p-8 pt-6">
        <Link href="/dashboard/hizli-erisim" className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
        </Link>
        <Card>
            <CardHeader>
                <CardTitle>Hızlı Erişim Linkleri: {hizliErisimSayfa.sayfaUrl}</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Bu sayfaya ait hızlı erişim linklerini yönetin.
                </p>
            </CardHeader>
            <CardContent>
                <HizliErisimOgeClient data={formattedData} sayfaId={hizliErisimSayfa.id} />
            </CardContent>
        </Card>
    </div>
  );
};

export default HizliErisimDetayPage;
