import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, MapPin, Building2, Calendar, DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "Hafriyat İstatistikleri",
  description: "Hafriyat projelerinin genel istatistiklerini ve performans verilerini görüntüleyin",
};

// Mock data - gerçekte API'den gelecek
const mockIstatistikler = {
  toplamSaha: 6,
  aktifSaha: 3,
  tamamlananSaha: 2,
  bekleyenSaha: 1,
  toplamTonaj: 2450000,
  aylikTonaj: 185000,
  toplamGelir: 159250000,
  aylikGelir: 12025000,
  ortalamIlerleme: 65,
  projeksiyonlar: {
    gelecekAyTonaj: 195000,
    yilSonuTahminiTonaj: 2850000,
    yilSonuGelirTahmini: 185250000
  }
};

const mockAylikVeriler = [
  { ay: "Ocak", tonaj: 180000, gelir: 11700000 },
  { ay: "Şubat", tonaj: 165000, gelir: 10725000 },
  { ay: "Mart", tonaj: 195000, gelir: 12675000 },
  { ay: "Nisan", tonaj: 210000, gelir: 13650000 },
  { ay: "Mayıs", tonaj: 185000, gelir: 12025000 },
];

const mockBolgeIstatistikleri = [
  {
    bolge: "Körfez Bölgesi",
    sahaSayisi: 2,
    toplamTonaj: 950000,
    ortalamIlerleme: 85,
    durum: "YÜKSELİŞ"
  },
  {
    bolge: "Gebze Bölgesi", 
    sahaSayisi: 2,
    toplamTonaj: 890000,
    ortalamIlerleme: 70,
    durum: "DÜŞÜŞ"
  },
  {
    bolge: "İzmit Bölgesi",
    sahaSayisi: 2,
    toplamTonaj: 610000,
    ortalamIlerleme: 45,
    durum: "KARIŞIK"
  }
];

export default async function HafriyatIstatistiklerPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(num);
  };

  return (
    <div className="container mx-auto py-10">      <Breadcrumb
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Hafriyat Yönetimi", href: "/dashboard/hafriyat" },
          { name: "İstatistikler", href: "/dashboard/hafriyat/istatistikler" },
        ]}
        className="mb-4"
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hafriyat İstatistikleri</h2>
          <p className="text-muted-foreground">
            Hafriyat projelerinin genel performans ve istatistik verileri
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
            <div className="text-2xl font-bold">{mockIstatistikler.toplamSaha}</div>
            <p className="text-xs text-muted-foreground">
              {mockIstatistikler.aktifSaha} aktif, {mockIstatistikler.tamamlananSaha} tamamlandı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tonaj</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(mockIstatistikler.toplamTonaj)} ton</div>
            <p className="text-xs text-muted-foreground">
              Bu ay: {formatNumber(mockIstatistikler.aylikTonaj)} ton
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockIstatistikler.toplamGelir)}</div>
            <p className="text-xs text-muted-foreground">
              Bu ay: {formatCurrency(mockIstatistikler.aylikGelir)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama İlerleme</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">%{mockIstatistikler.ortalamIlerleme}</div>
            <Progress value={mockIstatistikler.ortalamIlerleme} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Aylık Performans */}
        <Card>
          <CardHeader>
            <CardTitle>Aylık Performans</CardTitle>
            <CardDescription>Son 5 ayın tonaj ve gelir verileri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAylikVeriler.map((veri, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{veri.ay}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatNumber(veri.tonaj)} ton
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(veri.gelir)}</div>
                    <div className="text-sm text-muted-foreground">
                      {Math.round(veri.gelir / veri.tonaj)} ₺/ton
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bölge Performansı */}
        <Card>
          <CardHeader>
            <CardTitle>Bölge Performansı</CardTitle>
            <CardDescription>Bölgelerin genel durumu ve performansı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockBolgeIstatistikleri.map((bolge, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{bolge.bolge}</div>
                    <Badge variant={
                      bolge.durum === "YÜKSELİŞ" ? "default" :
                      bolge.durum === "DÜŞÜŞ" ? "destructive" : "secondary"
                    }>
                      {bolge.durum === "YÜKSELİŞ" && <TrendingUp className="w-3 h-3 mr-1" />}
                      {bolge.durum === "DÜŞÜŞ" && <TrendingDown className="w-3 h-3 mr-1" />}
                      {bolge.durum}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <div>{bolge.sahaSayisi} saha</div>
                    <div>{formatNumber(bolge.toplamTonaj)} ton</div>
                    <div>%{bolge.ortalamIlerleme} ilerleme</div>
                  </div>
                  <Progress value={bolge.ortalamIlerleme} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projeksiyonlar */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Projeksiyonlar</CardTitle>
          <CardDescription>Gelecek dönem tahminleri ve hedefler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(mockIstatistikler.projeksiyonlar.gelecekAyTonaj)} ton
              </div>
              <p className="text-sm text-muted-foreground">Gelecek Ay Tahmini</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(mockIstatistikler.projeksiyonlar.yilSonuTahminiTonaj)} ton
              </div>
              <p className="text-sm text-muted-foreground">Yıl Sonu Tonaj Tahmini</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(mockIstatistikler.projeksiyonlar.yilSonuGelirTahmini)}
              </div>
              <p className="text-sm text-muted-foreground">Yıl Sonu Gelir Tahmini</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
