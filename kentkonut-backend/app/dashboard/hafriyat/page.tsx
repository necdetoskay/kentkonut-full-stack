"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Building2, 
  BarChart3, 
  FileText, 
  Image,
  Loader2,
  ArrowRight,
  TrendingUp,
  Users,
  Calendar
} from "lucide-react";

interface HafriyatStats {
  toplamSaha: number;
  aktifSaha: number;
  tamamlananSaha: number;
  toplamBolge: number;
  belgeKategorisi: number;
  resimKategorisi: number;
}

export default function HafriyatDashboard() {
  const [stats, setStats] = useState<HafriyatStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data - gerçek API'den veri çekilecek
    setTimeout(() => {
      setStats({
        toplamSaha: 6,
        aktifSaha: 4,
        tamamlananSaha: 2,
        toplamBolge: 3,
        belgeKategorisi: 5,
        resimKategorisi: 8
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const menuItems = [
    {
      title: "Hafriyat Sahaları",
      description: "Maden ve kullanılmayan alanların rehabilitasyonu sahalarını yönetin",
      icon: MapPin,
      href: "/dashboard/hafriyat/sahalar",
      color: "bg-blue-500",
      stats: stats ? [
        { label: "Toplam Saha", value: stats.toplamSaha },
        { label: "Aktif", value: stats.aktifSaha },
        { label: "Tamamlanan", value: stats.tamamlananSaha }
      ] : [],
      features: ["Saha ekleme/düzenleme", "İlerleme takibi", "Konum yönetimi", "Belge yükleme"],
      isComingSoon: false
    },
    {
      title: "Bölge Yönetimi",
      description: "Hafriyat bölgelerini ve alt kategorilerini yönetin",
      icon: Building2,
      href: "/dashboard/hafriyat/bolgeler",
      color: "bg-green-500",
      stats: stats ? [
        { label: "Toplam Bölge", value: stats.toplamBolge },
        { label: "Aktif Bölge", value: stats.toplamBolge }
      ] : [],
      features: ["Bölge ekleme/düzenleme", "Hiyerarşi yönetimi", "Saha atama", "Bölge istatistikleri"],
      isComingSoon: false
    },
    {
      title: "İstatistikler",
      description: "Hafriyat projelerinin genel performans ve istatistik verileri",
      icon: BarChart3,
      href: "/dashboard/hafriyat/istatistikler",
      color: "bg-purple-500",
      stats: [
        { label: "Raporlar", value: "12" },
        { label: "Analiz", value: "8" }
      ],
      features: ["Performans raporları", "Grafik analizi", "İlerleme takibi", "Karşılaştırma"],
      isComingSoon: false
    },
    {
      title: "Belge Kategorileri",
      description: "Hafriyat projelerinde kullanılan belge türlerini yönetin",
      icon: FileText,
      href: "/dashboard/hafriyat/belge-kategorileri",
      color: "bg-orange-500",
      stats: stats ? [
        { label: "Kategori", value: stats.belgeKategorisi },
        { label: "Aktif", value: stats.belgeKategorisi }
      ] : [],
      features: ["Kategori ekleme/düzenleme", "Belge türü tanımlama", "Sıralama", "Durum yönetimi"],
      isComingSoon: false
    },
    {
      title: "Resim Kategorileri",
      description: "Hafriyat projelerinde kullanılan resim kategorilerini yönetin",
      icon: Image,
      href: "/dashboard/hafriyat/resim-kategorileri",
      color: "bg-pink-500",
      stats: stats ? [
        { label: "Kategori", value: stats.resimKategorisi },
        { label: "Aktif", value: stats.resimKategorisi }
      ] : [],
      features: ["Kategori ekleme/düzenleme", "Resim türü tanımlama", "Galeri yönetimi", "Sıralama"],
      isComingSoon: false
    }
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Breadcrumb
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Hafriyat Yönetimi", href: "/dashboard/hafriyat" },
        ]}
        className="mb-4"
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hafriyat Yönetimi</h2>
          <p className="text-muted-foreground">
            Maden ve kullanılmayan alanların rehabilitasyonu projelerini yönetin
          </p>
        </div>
      </div>

      {/* Genel İstatistikler */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Saha</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.toplamSaha || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.aktifSaha || 0} aktif, {stats?.tamamlananSaha || 0} tamamlandı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Bölge</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.toplamBolge || 0}</div>
            <p className="text-xs text-muted-foreground">
              Aktif bölge sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Belge Kategorisi</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.belgeKategorisi || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tanımlı kategori sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resim Kategorisi</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.resimKategorisi || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tanımlı kategori sayısı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Yönetim Modülleri */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${item.color} text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
                      {item.isComingSoon && (
                        <Badge variant="secondary" className="mt-1">
                          Yakında
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className="text-sm text-muted-foreground mt-2">
                  {item.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* İstatistikler */}
                {item.stats.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {item.stats.map((stat, statIndex) => (
                      <div key={statIndex} className="text-center p-2 bg-muted/50 rounded-md">
                        <div className="text-lg font-bold text-primary">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Özellikler */}
                <div className="space-y-1">
                  {item.features.slice(0, 3).map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                      {feature}
                    </div>
                  ))}
                  {item.features.length > 3 && (
                    <div className="text-xs text-muted-foreground ml-3.5">
                      +{item.features.length - 3} özellik daha
                    </div>
                  )}
                </div>

                {/* Aksiyon Butonu */}
                <div className="pt-2">
                  {item.isComingSoon ? (
                    <Button variant="outline" className="w-full" disabled>
                      Yakında Gelecek
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href={item.href} className="flex items-center justify-center">
                        Yönet
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Son Aktiviteler */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Son Aktiviteler
          </CardTitle>
          <CardDescription>
            Hafriyat modülündeki son işlemler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Körfez Taşocağı sahası güncellendi</span>
              </div>
              <span className="text-xs text-muted-foreground">2 saat önce</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">Yeni belge kategorisi eklendi</span>
              </div>
              <span className="text-xs text-muted-foreground">5 saat önce</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="text-sm">Seferciler Etap 3 sahası tamamlandı</span>
              </div>
              <span className="text-xs text-muted-foreground">1 gün önce</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}