import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin, Users, Phone, Building2, Edit, ArrowLeft, Mail, Calendar, TrendingUp, Eye } from "lucide-react";

// Mock data - gerçekte API'den gelecek
const mockBolgeler = [
  {
    id: "1",
    ad: "Gebze Bölgesi",
    aciklama: "Gebze ilçesi ve çevresindeki hafriyat sahaları",
    yetkiliKisi: "Şevki Uzun",
    yetkiliTelefon: "0533 453 8269",
    yetkiliEmail: "sevki.uzun@kentkonut.com",
    aktif: true,
    kurulumTarihi: "2023-03-15",
    sahalar: [
      { id: "1", ad: "Sepetçiler 3. Etap", ilerlemeyuzdesi: 95, durum: "DEVAM_EDIYOR", tonBasiUcret: 65 },
      { id: "2", ad: "Balçık Rehabilite", ilerlemeyuzdesi: 87, durum: "DEVAM_EDIYOR", tonBasiUcret: 65 },
      { id: "3", ad: "Dilovası Lot Alanı", ilerlemeyuzdesi: 70, durum: "DEVAM_EDIYOR", tonBasiUcret: 65 }
    ],
    istatistikler: {
      toplamSaha: 3,
      aktifSaha: 3,
      tamamlananSaha: 0,
      toplamTon: 45000,
      tamamlananTon: 38250
    }
  },
  {
    id: "2",
    ad: "İzmit Bölgesi", 
    aciklama: "İzmit ilçesi ve çevresindeki hafriyat sahaları",
    yetkiliKisi: "Tahir Aslan",
    yetkiliTelefon: "0545 790 9577",
    yetkiliEmail: "tahir.aslan@kentkonut.com",
    aktif: true,
    kurulumTarihi: "2023-05-20",
    sahalar: [
      { id: "4", ad: "Ketenciler Rehabilite", ilerlemeyuzdesi: 10, durum: "DEVAM_EDIYOR", tonBasiUcret: 65 }
    ],
    istatistikler: {
      toplamSaha: 1,
      aktifSaha: 1,
      tamamlananSaha: 0,
      toplamTon: 18500,
      tamamlananTon: 1850
    }
  },
  {
    id: "3",
    ad: "Körfez Bölgesi",
    aciklama: "Körfez ilçesi ve çevresindeki hafriyat sahaları", 
    yetkiliKisi: "Serkan Küçük",
    yetkiliTelefon: "0541 223 2479",
    yetkiliEmail: "serkan.kucuk@kentkonut.com",
    aktif: true,
    kurulumTarihi: "2023-01-10",
    sahalar: [
      { id: "5", ad: "Körfez Taşocağı", ilerlemeyuzdesi: 90, durum: "DEVAM_EDIYOR", tonBasiUcret: 65 },
      { id: "6", ad: "Maden Taş Ocağı", ilerlemeyuzdesi: 50, durum: "DEVAM_EDIYOR", tonBasiUcret: 65 }
    ],
    istatistikler: {
      toplamSaha: 2,
      aktifSaha: 2,
      tamamlananSaha: 0,
      toplamTon: 30000,
      tamamlananTon: 21000
    }
  }
];

type BolgeDetailProps = {
  params: {
    id: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined
  }
};

export default function BolgeDetailPage({ params }: BolgeDetailProps) {
  const bolge = mockBolgeler.find(b => b.id === params.id);
  
  if (!bolge) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const ortalamaIlerleme = Math.round(
    bolge.sahalar.reduce((acc, s) => acc + s.ilerlemeyuzdesi, 0) / bolge.sahalar.length
  );

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

  return (
    <div className="container mx-auto py-6">
      <Breadcrumb
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Hafriyat Yönetimi", href: "/dashboard/hafriyat" },
          { name: "Bölge Yönetimi", href: "/dashboard/hafriyat/bolgeler" },
          { name: bolge.ad, href: `/dashboard/hafriyat/bolgeler/${bolge.id}` },
        ]}
        className="mb-6"
      />

      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/hafriyat/bolgeler">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Geri Dön
              </Link>
            </Button>
            <Badge variant={bolge.aktif ? "default" : "secondary"}>
              {bolge.aktif ? "Aktif" : "Pasif"}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{bolge.ad}</h1>
          <p className="text-muted-foreground mt-2">
            {bolge.aciklama}
          </p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/hafriyat/bolgeler/${bolge.id}/duzenle`}>
            <Edit className="mr-2 h-4 w-4" />
            Düzenle
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Genel İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Saha</p>
                  <p className="text-2xl font-bold">{bolge.istatistikler.toplamSaha}</p>
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
                  <p className="text-2xl font-bold">{ortalamaIlerleme}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Aktif Saha</p>
                  <p className="text-2xl font-bold">{bolge.istatistikler.aktifSaha}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tamamlanan Ton</p>
                  <p className="text-2xl font-bold">{bolge.istatistikler.tamamlananTon.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bölge Bilgileri */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Bölge Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kuruluş Tarihi:</span>
                <span className="font-semibold">{formatDate(bolge.kurulumTarihi)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durum:</span>
                <Badge variant={bolge.aktif ? "default" : "secondary"}>
                  {bolge.aktif ? "Aktif" : "Pasif"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Toplam Kapasite:</span>
                <span className="font-semibold">{bolge.istatistikler.toplamTon.toLocaleString()} ton</span>
              </div>
              <div className="flex justify-between border-t pt-4">
                <span className="text-muted-foreground">Tamamlanma Oranı:</span>
                <span className="font-semibold text-green-600">
                  {Math.round((bolge.istatistikler.tamamlananTon / bolge.istatistikler.toplamTon) * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Yetkili Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">{bolge.yetkiliKisi}</p>
                  <p className="text-sm text-muted-foreground">Bölge Sorumlusu</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <a href={`tel:${bolge.yetkiliTelefon}`} className="hover:underline">
                  {bolge.yetkiliTelefon}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <a href={`mailto:${bolge.yetkiliEmail}`} className="hover:underline">
                  {bolge.yetkiliEmail}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sahalar Listesi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bölgedeki Sahalar
            </CardTitle>
            <CardDescription>
              Bu bölgeye bağlı hafriyat sahaları ve ilerleme durumları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bolge.sahalar.map((saha) => (
                <div key={saha.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{saha.ad}</h4>
                      <p className="text-sm text-muted-foreground">
                        Ton başı ücret: {saha.tonBasiUcret} TL
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(saha.durum)}>
                        {saha.durum === "DEVAM_EDIYOR" ? "Devam Ediyor" : "Tamamlandı"}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/hafriyat/sahalar/${saha.id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          Detay
                        </Link>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>İlerleme</span>
                      <span className="font-semibold">{saha.ilerlemeyuzdesi}%</span>
                    </div>
                    <Progress 
                      value={saha.ilerlemeyuzdesi} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
