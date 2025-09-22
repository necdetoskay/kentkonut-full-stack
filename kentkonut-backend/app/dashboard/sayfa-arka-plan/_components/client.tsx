'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SayfaArkaPlan } from "@prisma/client";
import Link from "next/link";
import { Edit, Trash } from "lucide-react";
import Image from "next/image";

interface SayfaArkaPlanClientProps {
    data: SayfaArkaPlan[];
}

export const SayfaArkaPlanClient: React.FC<SayfaArkaPlanClientProps> = ({ data }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const onDelete = async (id: number) => {
        if (confirm("Bu kaydı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
            try {
                setLoading(true);
                await axios.delete(`/api/sayfa-arka-plan/${id}`);
                toast.success("Kayıt başarıyla silindi.");
                router.refresh();
            } catch (error) {
                toast.error("Bir hata oluştu. Kayıt silinemedi.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sayfa URL</TableHead>
                <TableHead>Resim URL</TableHead>
                <TableHead>Önizleme</TableHead>
                <TableHead className="text-right w-[120px]">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono">{record.sayfaUrl}</TableCell>
                  <TableCell className="font-mono max-w-[300px] truncate">{record.resimUrl}</TableCell>
                  <TableCell>
                    <Image
                        src={record.resimUrl}
                        alt={`Arka plan resmi`}
                        width={150}
                        height={40}
                        className="object-cover rounded-md aspect-video"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="icon" asChild className="mr-2">
                      <Link href={`/dashboard/sayfa-arka-plan/${record.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => onDelete(record.id)}
                      disabled={loading}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
    );
}