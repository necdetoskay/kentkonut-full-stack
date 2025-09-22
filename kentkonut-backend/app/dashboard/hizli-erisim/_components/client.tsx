"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HizliErisimSayfa } from "@prisma/client";
import Link from "next/link";

// Prisma'dan gelen tipe ek olarak _count alanını da ekliyoruz.
interface HizliErisimSayfaWithCount extends HizliErisimSayfa {
    _count: {
        linkler: number;
    };
}

interface HizliErisimMenuClientProps {
    data: HizliErisimSayfaWithCount[];
}

export const HizliErisimMenuClient: React.FC<HizliErisimMenuClientProps> = ({ data }) => {
    
    const handleDelete = (id: string) => {
        // TODO: Silme işlemi için API ve mutation eklenecek.
        if (confirm("Bu menüyü ve içindeki tüm linkleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
            console.log("Silinecek ID:", id);
            alert("Silme işlemi henüz tamamlanmadı.");
        }
    }

    return (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sayfa URL</TableHead>
                <TableHead>Menü Başlığı</TableHead>
                <TableHead>Link Sayısı</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((sayfa) => (
                <TableRow key={sayfa.id}>
                  <TableCell className="font-mono">{sayfa.sayfaUrl}</TableCell>
                  <TableCell>{sayfa.baslik}</TableCell>
                  <TableCell>{sayfa._count.linkler}</TableCell>
                  <TableCell>{sayfa.aktif ? 'Aktif' : 'Pasif'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild className="mr-2">
                      <Link href={`/dashboard/hizli-erisim/${sayfa.id}`}>Linkleri Yönet</Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(sayfa.id)}
                    >
                      Sil
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
    );
}
