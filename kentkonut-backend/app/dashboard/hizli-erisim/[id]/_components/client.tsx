'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertModal } from "@/components/modals/alert-modal";
import { HizliErisimOgeFormModal } from "./form-modal"; // This modal will be created next

// Define the shape of the data we expect
interface OgeData {
  id: string;
  title: string;
  hedefUrl: string;
  sira: number;
  clickCount: number;
  viewCount: number;
  lastClickedAt: string;
}

interface HizliErisimOgeClientProps {
  data: OgeData[];
  sayfaId: string;
}

export const HizliErisimOgeClient: React.FC<HizliErisimOgeClientProps> = ({ data, sayfaId }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedOge, setSelectedOge] = useState<OgeData | null>(null);

  const handleNew = () => {
    setSelectedOge(null);
    setIsModalOpen(true);
  };

  const handleEdit = (oge: OgeData) => {
    setSelectedOge(oge);
    setIsModalOpen(true);
  };

  const handleDelete = (oge: OgeData) => {
    setSelectedOge(oge);
    setIsAlertOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!selectedOge) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/hizli-erisim-ogeleri/${selectedOge.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Link silinirken bir hata oluştu.');
      }

      toast.success("Hızlı erişim linki başarıyla silindi.");
      router.refresh(); // Refresh the page to show changes
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setIsAlertOpen(false);
      setSelectedOge(null);
    }
  };

  return (
    <>
      {/* Alert Modal for Delete Confirmation */}
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={onConfirmDelete}
        loading={loading}
        title="Bu linki silmek istediğinize emin misiniz?"
        description="Bu işlem geri alınamaz."
      />

      {/* Form Modal for Add/Edit */}
      <HizliErisimOgeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedOge}
        sayfaId={sayfaId}
      />

      <div className="flex justify-end mb-4">
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" /> Yeni Link Ekle
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Başlık</TableHead>
              <TableHead>Hedef URL</TableHead>
              <TableHead className="text-center">Tıklanma</TableHead>
              <TableHead className="text-center">Görülme</TableHead>
              <TableHead>Son Tıklanma</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Henüz link eklenmemiş.
                </TableCell>
              </TableRow>
            )}
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>
                    <a href={item.hedefUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {item.hedefUrl}
                    </a>
                </TableCell>
                <TableCell className="text-center">{item.clickCount}</TableCell>
                <TableCell className="text-center">{item.viewCount}</TableCell>
                <TableCell>{item.lastClickedAt}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Menüyü aç</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(item)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(item)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
