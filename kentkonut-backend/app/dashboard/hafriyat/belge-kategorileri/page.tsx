import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, FileStack, MoreHorizontal, Download, Upload, Eye, Edit } from "lucide-react";

// Mock data - gerçekte API'den gelecek
const mockBelgeKategorileri = [
  {
    id: "1",
    ad: "İzin Belgeleri",
    aciklama: "Çevresel etki değerlendirmesi, yapı ruhsatı ve işletme izni belgeleri",
    belgeSayisi: 45,
    aktifProjeSayisi: 3,
    durum: "AKTIF",
    olusturmaTarihi: "2024-01-15",
    sonGuncelleme: "2024-11-20"
  },
  {
    id: "2", 
    ad: "Teknik Raporlar",
    aciklama: "Jeolojik etüt, toprak analizi ve stabilite raporları",
    belgeSayisi: 28,
    aktifProjeSayisi: 2,
    durum: "AKTIF",
    olusturmaTarihi: "2024-02-10",
    sonGuncelleme: "2024-11-18"
  },
  {
    id: "3",
    ad: "Çevresel Belgeler",
    aciklama: "Çevresel izleme raporları ve rehabilitasyon planları",
    belgeSayisi: 32,
    aktifProjeSayisi: 4,
    durum: "AKTIF",
    olusturmaTarihi: "2024-01-20",
    sonGuncelleme: "2024-11-22"
  },
  {
    id: "4",
    ad: "Mali Belgeler",
    aciklama: "Proje maliyetleri, ödeme belgeleri ve faturalar",
    belgeSayisi: 67,
    aktifProjeSayisi: 5,
    durum: "AKTIF",
    olusturmaTarihi: "2024-02-25",
    sonGuncelleme: "2024-11-19"
  },
  {
    id: "5",
    ad: "Yasal Belgeler",
    aciklama: "Sözleşmeler, protokoller ve yasal düzenlemeler",
    belgeSayisi: 23,
    aktifProjeSayisi: 3,
    durum: "AKTIF",
    olusturmaTarihi: "2024-03-01",
    sonGuncelleme: "2024-11-15"
  }
];

type BelgeKategorisi = typeof mockBelgeKategorileri[0];

export default function BelgeKategorileriPage() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const aktifKategoriler = mockBelgeKategorileri.filter(k => k.durum === "AKTIF");
  const toplamBelge = mockBelgeKategorileri.reduce((total, k) => total + k.belgeSayisi, 0);

  return (
    <div className="container mx-auto py-6">
      <Breadcrumb
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Hafriyat Yönetimi", href: "/dashboard/hafriyat" },
          { name: "Belge Kategorileri", href: "/dashboard/hafriyat/belge-kategorileri" },
        ]}
        className="mb-6"
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Belge Kategorileri</h2>
          <p className="text-muted-foreground">
            Hafriyat projelerinde kullanılan belge türlerini organize edin
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kategori
        </Button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kategori</CardTitle>
            <FileStack className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockBelgeKategorileri.length}</div>
            <p className="text-xs text-muted-foreground">
              {aktifKategoriler.length} aktif kategori
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Belge</CardTitle>
            <FileStack className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toplamBelge}</div>
            <p className="text-xs text-muted-foreground">
              Tüm kategorilerde
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Çok Kullanılan</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Mali Belgeler</div>
            <p className="text-xs text-muted-foreground">
              67 belge ile
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Projeler</CardTitle>
            <FileStack className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Belge kullanan proje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Kategori Kartları */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {mockBelgeKategorileri.map((kategori) => (
          <Card key={kategori.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{kategori.ad}</CardTitle>
                <Badge variant={kategori.durum === "AKTIF" ? "default" : "secondary"}>
                  {kategori.durum}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {kategori.aciklama}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
                <div>
                  <div className="font-medium text-foreground">{kategori.belgeSayisi}</div>
                  <div>Belge</div>
                </div>
                <div>
                  <div className="font-medium text-foreground">{kategori.aktifProjeSayisi}</div>
                  <div>Aktif Proje</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {formatDate(kategori.sonGuncelleme)}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/hafriyat/belge-kategorileri/${kategori.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      Detay
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/hafriyat/belge-kategorileri/${kategori.id}/duzenle`}>
                      <Edit className="w-4 h-4 mr-1" />
                      Düzenle
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detaylı Tablo */}
      <Card>
        <CardHeader>
          <CardTitle>Belge Kategorileri Detayları</CardTitle>
          <CardDescription>
            Sistemde tanımlı tüm belge kategorileri ve detaylı bilgileri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori Adı</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Belge Sayısı</TableHead>
                <TableHead>Aktif Proje</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Son Güncelleme</TableHead>
                <TableHead className="w-[100px]">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBelgeKategorileri.map((kategori) => (
                <TableRow key={kategori.id}>
                  <TableCell className="font-medium">{kategori.ad}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {kategori.aciklama}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {kategori.belgeSayisi} belge
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {kategori.aktifProjeSayisi} proje
                  </TableCell>
                  <TableCell>
                    <Badge variant={kategori.durum === "AKTIF" ? "default" : "secondary"}>
                      {kategori.durum}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(kategori.sonGuncelleme)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Menüyü aç</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/hafriyat/belge-kategorileri/${kategori.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Detaylar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/hafriyat/belge-kategorileri/${kategori.id}/duzenle`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Düzenle
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Belgeleri İndir
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Upload className="mr-2 h-4 w-4" />
                          Belge Yükle
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
