"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HighlightsAPI, handleApiError, type Highlight } from "@/utils/highlightsApi";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function DeleteHighlightPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [item, setItem] = useState<Highlight | null>(null);

  const breadcrumbSegments = [
    { name: "Kurumsal", href: "/dashboard/kurumsal" },
    { name: "Öne Çıkanlar", href: "/dashboard/kurumsal/highlights" },
    { name: "Sil", href: "#" },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await HighlightsAPI.getById(id);
        setItem(data);
      } catch (error) {
        const { message } = handleApiError(error);
        toast.error(message || "Kayıt getirilemedi");
        router.push("/dashboard/kurumsal/highlights");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, router]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await HighlightsAPI.delete(id);
      toast.success("Kayıt silindi");
      router.push("/dashboard/kurumsal/highlights");
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message || "Silme işlemi başarısız");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        {/* BREADCRUMB_TO_FIX: <Breadcrumb segments={breadcrumbSegments} homeHref="/dashboard" /> */}
        <div className="py-16 text-center text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      {/* BREADCRUMB_TO_FIX: <Breadcrumb segments={breadcrumbSegments} homeHref="/dashboard" /> */}

      <div className="flex items-center justify-between mt-6 mb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Geri
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Öne Çıkan Sil</h1>
            <p className="text-sm text-muted-foreground">Bu işlem geri alınamaz. Kaydı kalıcı olarak silmek üzeresiniz.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/kurumsal/highlights/${id}/edit`}>
            <Button variant="ghost">Vazgeç</Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="mr-2 h-4 w-4" /> Kalıcı Olarak Sil
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Silinecek Kayıt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Tür</div>
              <Badge variant="outline">{item.sourceType}</Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Sıra</div>
              <div className="font-mono">{item.order}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Durum</div>
              <div>
                <span className={`px-2 py-1 rounded text-xs ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {item.isActive ? 'Aktif' : 'Pasif'}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Başlık</div>
              <div className="truncate">{item.titleOverride || '-'}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-muted-foreground">Alt Başlık</div>
              <div className="truncate text-muted-foreground">{item.subtitleOverride || '-'}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-muted-foreground">Bağlantı (routeOverride)</div>
              <div className="truncate"><a href={item.routeOverride || '#'} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{item.routeOverride || '-'}</a></div>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-md bg-red-50 text-red-700 text-sm">
            Uyarı: Bu işlem, bu ögeyi kalıcı olarak silecek ve geri alınamaz.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}