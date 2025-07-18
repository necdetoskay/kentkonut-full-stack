"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, MapPin, Building2, Calendar, TrendingUp, Phone, Mail, DollarSign, Package, Loader2, Users, Image as ImageIcon, ExternalLink } from "lucide-react";
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
  };  belgeler: Array<{
    id: string;
    baslik: string;
  }>;resimler: Array<{
    id: string;
    baslik: string;
    dosyaYolu: string;
    altMetin?: string;
    aciklama?: string;
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
        <div className="flex items-center justify-center py-12">
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
          </Card>          {/* Açıklama */}
          {saha.aciklama && (
            <Card>
              <CardHeader>
                <CardTitle>Açıklama</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: saha.aciklama }}
                />
              </CardContent>
            </Card>
          )}          {/* Hafriyat Saha Galerisi - Ana Bölüm */}
          {saha.resimler && saha.resimler.length > 0 && (
            <Card data-gallery-main>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Hafriyat Saha Galerisi
                  </div>
                  <Badge variant="secondary">
                    {saha.resimler.length} Görsel
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {saha.resimler.map((resim, index) => (
                    <div key={resim.id} className="group relative">
                      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 shadow-sm">                        <img
                          src={resim.dosyaYolu}
                          alt={resim.altMetin || resim.baslik}
                          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%236b7280'%3EGörsel Yüklenemedi%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                          <a
                            href={resim.dosyaYolu}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transform hover:scale-110"
                          >
                            <ExternalLink className="h-5 w-5 text-gray-800" />
                          </a>                        </div>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">{resim.baslik}</h4>
                        {resim.aciklama && (
                          <p className="text-xs text-muted-foreground">
                            {resim.aciklama.length > 80 
                              ? `${resim.aciklama.substring(0, 80)}...` 
                              : resim.aciklama
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {saha.resimler.length === 0 && (
                  <div className="text-center py-8">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">Bu saha için henüz görsel yüklenmemiş</p>
                  </div>
                )}
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
                </div>              )}
            </CardContent>
          </Card>          {/* Hafriyat Saha Galerisi */}
          {saha.resimler && saha.resimler.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Galeri Önizleme
                  <Badge variant="secondary" className="ml-auto">
                    {saha.resimler.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {saha.resimler.slice(0, 4).map((resim) => (
                    <div key={resim.id} className="group relative">
                      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">                        <img
                          src={resim.dosyaYolu}
                          alt={resim.altMetin || resim.baslik}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='%236b7280'%3EGörsel Yüklenemedi%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                          <a
                            href={resim.dosyaYolu}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-2 shadow-lg"
                          >
                            <ExternalLink className="h-4 w-4 text-gray-800" />
                          </a>
                        </div>                      </div>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-900">{resim.baslik}</h4>
                        {resim.aciklama && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {resim.aciklama}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}                  
                  {/* Daha fazla resim varsa link göster */}
                  {saha.resimler.length > 4 && (
                    <div className="text-center pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Sayfanın ana galeri bölümüne scroll yap
                          const galleryElement = document.querySelector('[data-gallery-main]');
                          if (galleryElement) {
                            galleryElement.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                      >
                        +{saha.resimler.length - 4} Görsel Daha
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
