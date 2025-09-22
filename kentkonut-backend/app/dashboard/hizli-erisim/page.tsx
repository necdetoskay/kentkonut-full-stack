import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/lib/db";
import { HizliErisimMenuClient } from "./_components/client";

// Bu sayfa sunucu tarafında çalışır (Server Component)
const HizliErisimDashboardPage = async () => {

  // Veriyi doğrudan veritabanından çekiyoruz.
  const data = await db.hizliErisimSayfa.findMany({
    orderBy: {
      sayfaUrl: 'asc',
    },
    include: {
      _count: {
        select: { linkler: true },
      },
    },
  });

  return (
    <div className="p-8 pt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Hızlı Erişim Menüleri</CardTitle>
          <Button asChild>
            <Link href="/dashboard/hizli-erisim/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Yeni Menü Ekle
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
            {/* 
                İşlemler (silme gibi) client-side interaktivite gerektirdiği için,
                tabloyu ve içeriğini bir Client Component içine taşıyoruz.
                Bu, Next.js App Router için standart bir pratiktir.
            */}
          <HizliErisimMenuClient data={data} />
        </CardContent>
      </Card>
    </div>
  );
};

export default HizliErisimDashboardPage;
