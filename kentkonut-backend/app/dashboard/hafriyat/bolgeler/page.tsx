import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, MapPin, Users, Phone, Building2, TrendingUp, Eye, Edit } from "lucide-react";

// Mock data - gerçekte API'den gelecek
const mockBolgeler = [
  {
    id: "1",
    ad: "Gebze Bölgesi",
    aciklama: "Gebze ilçesi ve çevresindeki hafriyat sahaları",
    yetkiliKisi: "Şevki Uzun",
    yetkiliTelefon: "0533 453 8269",
    aktif: true,
    sahalar: [
      { ad: "Sepetçiler 3. Etap", ilerlemeyuzdesi: 95 },
      { ad: "Balçık Rehabilite", ilerlemeyuzdesi: 87 },
      { ad: "Dilovası Lot Alanı", ilerlemeyuzdesi: 70 }
    ]
  },
  {
    id: "2",
    ad: "İzmit Bölgesi", 
    aciklama: "İzmit ilçesi ve çevresindeki hafriyat sahaları",
    yetkiliKisi: "Tahir Aslan",
    yetkiliTelefon: "0545 790 9577",
    aktif: true,
    sahalar: [
      { ad: "Ketenciler Rehabilite", ilerlemeyuzdesi: 10 }
    ]
  },
  {
    id: "3",
    ad: "Körfez Bölgesi",
    aciklama: "Körfez ilçesi ve çevresindeki hafriyat sahaları", 
    yetkiliKisi: "Serkan Küçük",
    yetkiliTelefon: "0541 223 2479",
    aktif: true,
    sahalar: [
      { ad: "Körfez Taşocağı", ilerlemeyuzdesi: 90 },
      { ad: "Maden Taş Ocağı", ilerlemeyuzdesi: 50 }
    ]
  }
];

type Bolge = typeof mockBolgeler[0];

export default function BolgelerPage() {
  const aktifBolgeler = mockBolgeler.filter(b => b.aktif);
  const toplamSaha = mockBolgeler.reduce((total, b) => total + b.sahalar.length, 0);
  const ortalamaIlerleme = Math.round(
    mockBolgeler.reduce((total, b) => 
      total + b.sahalar.reduce((sahaTotal, s) => sahaTotal + s.ilerlemeyuzdesi, 0) / b.sahalar.length, 0
    ) / mockBolgeler.length
  );

  return (
    <div className="container mx-auto py-6">
      <Breadcrumb
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Hafriyat Yönetimi", href: "/dashboard/hafriyat" },
          { name: "Bölge Yönetimi", href: "/dashboard/hafriyat/bolgeler" },
        ]}
        className="mb-6"
      />

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bölge Yönetimi</h1>
          <p className="text-muted-foreground mt-2">
            Hafriyat sahalarının bölgesel organizasyonunu yönetin
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Bölge Ekle
        </Button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Bölge</p>
                <p className="text-2xl font-bold">{mockBolgeler.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif Bölge</p>
                <p className="text-2xl font-bold">{aktifBolgeler.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Saha</p>
                <p className="text-2xl font-bold">{toplamSaha}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ortalama İlerleme</p>
                <p className="text-2xl font-bold">{ortalamaIlerleme}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bölge Listesi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockBolgeler.map((bolge) => (
          <Card key={bolge.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{bolge.ad}</CardTitle>
                  <CardDescription className="mt-2">
                    {bolge.aciklama}
                  </CardDescription>
                </div>
                <Badge variant={bolge.aktif ? "default" : "secondary"}>
                  {bolge.aktif ? "Aktif" : "Pasif"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Saha Bilgileri */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Sahalar ({bolge.sahalar.length})</span>
                  <span className="font-semibold">
                    Ort: {Math.round(bolge.sahalar.reduce((acc, s) => acc + s.ilerlemeyuzdesi, 0) / bolge.sahalar.length)}%
                  </span>
                </div>
                <div className="space-y-2">
                  {bolge.sahalar.slice(0, 2).map((saha, index) => (
                    <div key={index} className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="truncate">{saha.ad}</span>
                        <span>{saha.ilerlemeyuzdesi}%</span>
                      </div>
                      <Progress value={saha.ilerlemeyuzdesi} className="h-1" />
                    </div>
                  ))}
                  {bolge.sahalar.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      +{bolge.sahalar.length - 2} saha daha...
                    </p>
                  )}
                </div>
              </div>

              {/* Yetkili Bilgisi */}
              <div className="border-t pt-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Users className="h-4 w-4" />
                  <span>{bolge.yetkiliKisi}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{bolge.yetkiliTelefon}</span>
                </div>
              </div>

              {/* Aksiyon Butonları */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  asChild
                >
                  <Link href={`/dashboard/hafriyat/bolgeler/${bolge.id}`}>
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
                  <Link href={`/dashboard/hafriyat/bolgeler/${bolge.id}/duzenle`}>
                    <Edit className="w-4 h-4 mr-1" />
                    Düzenle
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
