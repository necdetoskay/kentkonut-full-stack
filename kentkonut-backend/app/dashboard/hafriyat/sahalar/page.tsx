"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, TrendingUp, Users, Building2, Eye, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface HafriyatSaha {
  id: string;
  ad: string;
  konumAdi: string;
  durum: string;
  ilerlemeyuzdesi: number;
  tonBasiUcret: number;
  kdvOrani: number;
  toplamTon: number;
  bolge: {
    ad: string;
    yetkiliKisi: string;
    yetkiliTelefon: string;
  };
  seoLink?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoCanonicalUrl?: string;
}

export default function SahalarPage() {
  const [sahalar, setSahalar] = useState<HafriyatSaha[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSahalar = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/hafriyat-sahalar?aktif=true');
        
        if (!response.ok) {
          throw new Error('Sahalar yüklenemedi');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setSahalar(data.data.sahalar);
        } else {
          throw new Error(data.message || 'Sahalar alınamadı');
        }
      } catch (error) {
        console.error('Sahalar yükleme hatası:', error);
        toast.error(error instanceof Error ? error.message : 'Sahalar yüklenirken bir hata oluştu');
        setSahalar([]); // Hata durumunda boş array set et
      } finally {
        setIsLoading(false);
      }
    };

    fetchSahalar();
  }, []);

  const getStatusColor = (durum: string) => {
    switch (durum) {
      case "DEVAM_EDIYOR":
        return "bg-blue-100 text-blue-800";
      case "TAMAMLANDI":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Loading komponenti
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Sahalar yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Breadcrumb
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Hafriyat Yönetimi", href: "/dashboard/hafriyat" },
          { name: "Hafriyat Sahaları", href: "/dashboard/hafriyat/sahalar" },
        ]}
        className="mb-6"
      />

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hafriyat Sahaları</h1>
          <p className="text-muted-foreground mt-2">
            Maden ve kullanılmayan alanların rehabilitasyonu sahalarını yönetin
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/hafriyat/sahalar/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Saha Ekle
          </Link>
        </Button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Saha</p>
                <p className="text-2xl font-bold">{sahalar.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ortalama İlerleme</p>
                <p className="text-2xl font-bold">
                  {sahalar.length > 0 
                    ? Math.round(sahalar.reduce((acc, saha) => acc + saha.ilerlemeyuzdesi, 0) / sahalar.length)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif Sahalar</p>
                <p className="text-2xl font-bold">
                  {sahalar.filter(saha => saha.durum === "DEVAM_EDIYOR").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bölge Sayısı</p>
                <p className="text-2xl font-bold">
                  {new Set(sahalar.map(saha => saha.bolge.ad)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saha Listesi */}
      {sahalar.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz saha bulunmuyor</h3>
            <p className="text-muted-foreground mb-4">
              İlk hafriyat sahasını oluşturmak için aşağıdaki butona tıklayın.
            </p>
            <Button asChild>
              <Link href="/dashboard/hafriyat/sahalar/yeni">
                <Plus className="mr-2 h-4 w-4" />
                Yeni Saha Ekle
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sahalar.map((saha) => (
            <Card key={saha.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{saha.ad}</CardTitle>
                    <CardDescription className="flex items-center mt-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {saha.konumAdi}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(saha.durum)}>
                    {saha.durum === "DEVAM_EDIYOR" ? "Devam Ediyor" : "Tamamlandı"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* İlerleme Çubuğu */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>İlerleme</span>
                    <span className="font-semibold">{saha.ilerlemeyuzdesi}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(saha.ilerlemeyuzdesi)}`}
                      style={{ width: `${saha.ilerlemeyuzdesi}%` }}
                    ></div>
                  </div>
                </div>

                {/* Ücret Bilgisi */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Ton Başı Ücret</p>
                  <p className="font-semibold text-lg">
                    {saha.tonBasiUcret} TL + KDV
                    <span className="text-sm text-gray-500 ml-1">
                      (Toplam: {saha.tonBasiUcret * (1 + saha.kdvOrani / 100)} TL)
                    </span>
                  </p>
                </div>

                {/* Yetkili Bilgisi */}
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600">Bölge: {saha.bolge.ad}</p>
                  <p className="text-sm text-gray-600">Yetkili: {saha.bolge.yetkiliKisi}</p>
                  <p className="text-sm text-gray-600">Telefon: {saha.bolge.yetkiliTelefon}</p>
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/dashboard/hafriyat/sahalar/${saha.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      Detaylar
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/dashboard/hafriyat/sahalar/${saha.id}/duzenle`}>
                      <Edit className="w-4 h-4 mr-1" />
                      Düzenle
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}        </div>
      )}
    </div>
  );
}