import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { SayfaArkaPlanClient } from "./_components/client";

// Server Component
const SayfaArkaPlanPage = async () => {
  const data = await prisma.sayfaArkaPlan.findMany({
    orderBy: {
      sayfaUrl: 'asc',
    },
  });

  return (
    <div className="p-8 pt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Üst Ana Menü Arka Plan Yönetimi</CardTitle>
          <Button asChild>
            <Link href="/dashboard/sayfa-arka-plan/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Yeni Ekle
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <SayfaArkaPlanClient data={data} />
        </CardContent>
      </Card>
    </div>
  );
};

export default SayfaArkaPlanPage;
