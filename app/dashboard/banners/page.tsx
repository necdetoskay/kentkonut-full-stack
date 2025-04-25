"use client"

import { useState, useEffect } from "react";
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

export default function BannersPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bannerGroups, setBannerGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBannerGroups();
  }, []);

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
    fetchBannerGroups();
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Banner Grupları</h2>
          <p className="text-muted-foreground">
            Web sitesinde görüntülenecek banner gruplarını yönetin
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Yeni Banner Grubu</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Yeni Banner Grubu</DialogTitle>
              <DialogDescription>
                Banner grubunun özelliklerini belirleyin. Oluşturduktan sonra
                gruba banner ekleyebilirsiniz.
              </DialogDescription>
            </DialogHeader>
            <BannerGroupForm onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable 
        columns={columns} 
        data={bannerGroups} 
        onRowClick={(row) => router.push(`/dashboard/banners/${row.id}`)}
      />
    </div>
  );
} 