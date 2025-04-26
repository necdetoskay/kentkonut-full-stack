"use client"

import { useState, useEffect, createContext, useContext } from "react";
import { auth } from "@/lib/auth";
import { redirect, useRouter } from "next/navigation";
import { db } from "@/lib/db";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BannerGroupForm } from "./banner-group-form";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/ui/breadcrumb"

// Dialog açık olup olmadığını takip etmek için bir context oluşturuyoruz
export const DialogContext = createContext({
  isDialogOpen: false,
  setIsDialogOpen: (value: boolean) => {}
});

export default function BannersPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bannerGroups, setBannerGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Herhangi bir dialog'un açık olup olmadığını takip eden state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Form değişiklik durumunu takip eden state
  const [isFormDirty, setIsFormDirty] = useState(false);

  const breadcrumbItems = [
    { title: "Bannerlar" }
  ]

  useEffect(() => {
    fetchBannerGroups();
  }, []);

  // Dialog açılıp kapandığında global state'i güncelliyoruz
  useEffect(() => {
    setIsDialogOpen(open);
  }, [open]);

  const fetchBannerGroups = async () => {
    try {
      const response = await fetch("/api/banner-groups");
      if (!response.ok) {
        throw new Error("Banner grupları yüklenirken bir hata oluştu");
      }
      const data = await response.json();
      setBannerGroups(data);
    } catch (error) {
      console.error("Banner grupları yüklenirken hata:", error);
      toast.error("Banner grupları yüklenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    setOpen(false);
    setIsFormDirty(false); // Form gönderildiğinde değişiklik durumunu sıfırla
    fetchBannerGroups();
  };

  // Formun dışına tıklandığında veya ESC ile çıkış yapıldığında yönetim
  const handleOpenChange = (openState: boolean) => {
    // Eğer kapanmak isteniyorsa (openState = false)
    if (!openState) {
      // Sadece form değiştiyse onay isteyelim
      if (isFormDirty) {
        if (confirm("Formu kapatmak istediğinize emin misiniz? Kaydedilmemiş veriler kaybolacaktır.")) {
          setOpen(false);
          setIsFormDirty(false); // Kapatıldığında değişiklik durumunu sıfırla
        }
      } else {
        // Form değişmediyse doğrudan kapatabiliriz
        setOpen(false);
      }
    } else {
      setOpen(openState);
      setIsFormDirty(false); // Yeni form açıldığında değişiklik durumunu sıfırla
    }
  };

  // Form değişiklik durumunu izlemek için
  const handleFormChange = (isDirty: boolean) => {
    setIsFormDirty(isDirty);
  };

  // Satıra tıklama işlemi, sadece dialog açık değilse çalışacak
  const handleRowClick = (row: any) => {
    if (!isDialogOpen) {
      router.push(`/dashboard/banners/${row.id}`);
    }
  };

  return (
    <DialogContext.Provider value={{ isDialogOpen, setIsDialogOpen }}>
      <div className="container mx-auto py-10">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Banner Grupları</h2>
            <p className="text-muted-foreground">
              Web sitesinde görüntülenecek banner gruplarını yönetin
            </p>
          </div>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>Yeni Banner Grubu</Button>
            </DialogTrigger>
            <DialogContent 
              className="sm:max-w-[600px]"
            >
              <DialogHeader>
                <DialogTitle>Yeni Banner Grubu</DialogTitle>
                <DialogDescription>
                  Banner grubunun özelliklerini belirleyin. Oluşturduktan sonra
                  gruba banner ekleyebilirsiniz.
                </DialogDescription>
              </DialogHeader>
              <BannerGroupForm onSuccess={handleSuccess} onFormChange={handleFormChange} />
            </DialogContent>
          </Dialog>
        </div>
        <DataTable 
          columns={columns} 
          data={bannerGroups} 
          onRowClick={handleRowClick}
        />
      </div>
    </DialogContext.Provider>
  );
} 