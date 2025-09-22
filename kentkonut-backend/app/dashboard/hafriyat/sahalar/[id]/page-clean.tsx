"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, MapPin, Building2, Calendar, TrendingUp, Phone, Mail, DollarSign, Package, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

interface HafriyatSaha {
  id: string;
  ad: string;
  konumAdi: string;
  enlem: number;
  boylam: number;
  durum: string;
  ilerlemeyuzdesi: number;
  tonBasiUcret: number;
  kdvOrani: number;
  toplamTon?: number;
  tamamlananTon?: number;
  baslangicTarihi?: string;
  tahminibitisTarihi?: string;
  aciklama?: string;
  bolge: {
    id: string;
    ad: string;
    yetkiliKisi: string;
    yetkiliTelefon: string;
    yetkiliEmail?: string;
  };
  belgeler: Array<{
    id: string;
    baslik: string;
    kategori: {
      ad: string;
      ikon: string;
    };
  }>;
  resimler: Array<{
    id: string;
    baslik: string;
    dosyaYolu: string;
  }>;
  _count: {
    belgeler: number;
    resimler: number;
  };
  aktif: boolean;
  olusturulmaTarihi: string;
  guncellemeTarihi: string;
}

type SahaDetayProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function SahaDetayPage({ params }: SahaDetayProps) {
  const router = useRouter();
  const [currentParams, setCurrentParams] = useState<{ id: string } | null>(null);
  const [saha, setSaha] = useState<HafriyatSaha | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSaha = async () => {
      try {
        setIsLoading(true);
        const resolvedParams = await params;
        setCurrentParams(resolvedParams);

        const response = await fetch(`/api/hafriyat-sahalar/${resolvedParams.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
            return;
          }
          throw new Error('Saha bilgileri yüklenemedi');
        }

        const data = await response.json();
        
        if (data.success) {
          setSaha(data.data);
        } else {
          throw new Error(data.message || 'Saha bilgileri alınamadı');
        }
      } catch (error) {
        console.error('Saha yükleme hatası:', error);
        toast.error(error instanceof Error ? error.message : 'Saha yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSaha();
  }, [params]);

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Saha bilgileri yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!saha) {
    return null;
  }

  return (
    <div className="container mx-auto py-6">
      <Breadcrumb
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Hafriyat Yönetimi", href: "/dashboard/hafriyat" },
          { name: "Hafriyat Sahaları", href: "/dashboard/hafriyat/sahalar" },
          { name: saha.ad, href: `/dashboard/hafriyat/sahalar/${saha.id}` },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/hafriyat/sahalar">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri Dön
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{saha.ad}</h1>
            <p className="text-muted-foreground mt-2 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {saha.konumAdi}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(saha.durum)}>
            {saha.durum === "DEVAM_EDIYOR" ? "Devam Ediyor" : "Tamamlandı"}
          </Badge>
          <Link href={`/dashboard/hafriyat/sahalar/${saha.id}/duzenle`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Ana Bilgiler */}
        <div className="lg:col-span-2 space-y-6">
          {/* İlerleme Kartı */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Proje İlerlemesi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tamamlanma Oranı</span>
                  <span className="font-semibold">{saha.ilerlemeyuzdesi}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${getProgressColor(saha.ilerlemeyuzdesi)} transition-all duration-300`}
                    style={{ width: `${saha.ilerlemeyuzdesi}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ton Bilgileri */}
          {(saha.toplamTon || saha.tamamlananTon) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Ton Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{saha.toplamTon?.toLocaleString() || 0}</div>
                    <div className="text-sm text-muted-foreground">Toplam Ton</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{saha.tamamlananTon?.toLocaleString() || 0}</div>
                    <div className="text-sm text-muted-foreground">Tamamlanan</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {((saha.toplamTon || 0) - (saha.tamamlananTon || 0)).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Kalan</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tarih Bilgileri */}
          {(saha.baslangicTarihi || saha.tahminibitisTarihi) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Tarih Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Başlangıç</div>
                    <span className="font-semibold">{formatDate(saha.baslangicTarihi)}</span>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Tahmini Bitiş</div>
                    <span className="font-semibold">{formatDate(saha.tahminibitisTarihi)}</span>
                  </div>
                  {saha.baslangicTarihi && saha.tahminibitisTarihi && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Süre</div>
                      <span className="font-semibold">
                        {Math.ceil((new Date(saha.tahminibitisTarihi).getTime() - new Date(saha.baslangicTarihi).getTime()) / (1000 * 60 * 60 * 24))} gün
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fiyat Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Fiyat Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Ton Başı Fiyat (KDV Hariç)</div>
                  <span className="font-semibold">{formatCurrency(saha.tonBasiUcret)}</span>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">KDV Oranı</div>
                  <span className="font-semibold">%{saha.kdvOrani}</span>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Ton Başı Fiyat (KDV Dahil)</div>
                  <span className="font-semibold">{formatCurrency(saha.tonBasiUcret * (1 + saha.kdvOrani / 100))}</span>
                </div>
                {saha.toplamTon && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Toplam Tutar (KDV Dahil)</div>
                    <span className="font-semibold text-lg text-green-600">
                      {formatCurrency(saha.toplamTon * saha.tonBasiUcret * (1 + saha.kdvOrani / 100))}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Açıklama */}
          {saha.aciklama && (
            <Card>
              <CardHeader>
                <CardTitle>Açıklama</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {saha.aciklama}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sağ Kolon - Yan Bilgiler */}
        <div className="space-y-6">
          {/* Bölge Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Bölge Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Bölge</div>
                <span className="font-semibold">{saha.bolge.ad}</span>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Yetkili Kişi
                </div>
                <span className="font-semibold">{saha.bolge.yetkiliKisi}</span>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1 flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  Telefon
                </div>
                <a href={`tel:${saha.bolge.yetkiliTelefon}`} className="hover:underline">
                  {saha.bolge.yetkiliTelefon}
                </a>
              </div>
              {saha.bolge.yetkiliEmail && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1 flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    E-posta
                  </div>
                  <a href={`mailto:${saha.bolge.yetkiliEmail}`} className="hover:underline">
                    {saha.bolge.yetkiliEmail}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
