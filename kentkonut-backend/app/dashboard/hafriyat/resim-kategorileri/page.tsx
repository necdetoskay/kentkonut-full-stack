import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Images, MoreHorizontal, Upload, ImageIcon, Eye, Edit, Trash2 } from "lucide-react";

// Mock data - gerçekte API'den gelecek
const mockResimKategorileri = [
  {
    id: "1",
    ad: "Ön Durum Fotoğrafları",
    aciklama: "Proje başlangıcında çekilen saha durumu ve mevcut görünüm fotoğrafları",
    resimSayisi: 124,
    aktifProjeSayisi: 3,
    durum: "AKTIF",
    kapakResmi: "/api/placeholder/300/200",
    olusturmaTarihi: "2024-01-15",
    sonGuncelleme: "2024-11-20"
  },
  {
    id: "2", 
    ad: "İşlem Aşamaları",
    aciklama: "Hafriyat ve rehabilitasyon işlemlerinin çeşitli aşamalarından fotoğraflar",
    resimSayisi: 89,
    aktifProjeSayisi: 4,
    durum: "AKTIF",
    kapakResmi: "/api/placeholder/300/200",
    olusturmaTarihi: "2024-02-10",
    sonGuncelleme: "2024-11-18"
  },
  {
    id: "3",
    ad: "Son Durum Fotoğrafları",
    aciklama: "Rehabilitasyon tamamlandıktan sonraki saha durumu fotoğrafları",
    resimSayisi: 67,
    aktifProjeSayisi: 2,
    durum: "AKTIF",
    kapakResmi: "/api/placeholder/300/200",
    olusturmaTarihi: "2024-01-20",
    sonGuncelleme: "2024-11-22"
  },
  {
    id: "4",
    ad: "Ekipman ve Araçlar",
    aciklama: "Kullanılan iş makineleri, araçlar ve ekipman fotoğrafları",
    resimSayisi: 45,
    aktifProjeSayisi: 3,
    durum: "AKTIF",
    kapakResmi: "/api/placeholder/300/200",
    olusturmaTarihi: "2024-02-25",
    sonGuncelleme: "2024-11-19"
  },
  {
    id: "5",
    ad: "Çevresel Etkiler",
    aciklama: "Projenin çevresel etkilerini gösteren karşılaştırmalı fotoğraflar",
    resimSayisi: 38,
    aktifProjeSayisi: 2,
    durum: "AKTIF",
    kapakResmi: "/api/placeholder/300/200",
    olusturmaTarihi: "2024-03-01",
    sonGuncelleme: "2024-11-15"
  },
  {
    id: "6",
    ad: "Drone Görüntüleri",
    aciklama: "Havadan çekilen genel saha görüntüleri ve ilerleme takibi",
    resimSayisi: 52,
    aktifProjeSayisi: 3,
    durum: "AKTIF",
    kapakResmi: "/api/placeholder/300/200",
    olusturmaTarihi: "2024-03-15",
    sonGuncelleme: "2024-11-21"
  }
];

type ResimKategorisi = typeof mockResimKategorileri[0];

export default function ResimKategorileriPage() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const aktifKategoriler = mockResimKategorileri.filter(k => k.durum === "AKTIF");
  const toplamResim = mockResimKategorileri.reduce((total, k) => total + k.resimSayisi, 0);

  return (
    <div className="container mx-auto py-6">
      <Breadcrumb
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Hafriyat Yönetimi", href: "/dashboard/hafriyat" },
          { name: "Resim Kategorileri", href: "/dashboard/hafriyat/resim-kategorileri" },
        ]}
        className="mb-6"
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Resim Kategorileri</h2>
          <p className="text-muted-foreground">
            Hafriyat projelerinde kullanılan resim ve medya kategorilerini organize edin
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
            <Images className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockResimKategorileri.length}</div>
            <p className="text-xs text-muted-foreground">
              {aktifKategoriler.length} aktif kategori
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Resim</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toplamResim}</div>
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
            <div className="text-2xl font-bold">Ön Durum</div>
            <p className="text-xs text-muted-foreground">
              124 resim ile
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Projeler</CardTitle>
            <Images className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Resim kullanan proje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Kategori Kartları */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {mockResimKategorileri.map((kategori) => (
          <Card key={kategori.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
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
                  <div className="font-medium text-foreground">{kategori.resimSayisi}</div>
                  <div>Resim</div>
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
                    <Link href={`/dashboard/hafriyat/resim-kategorileri/${kategori.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      Detay
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/hafriyat/resim-kategorileri/${kategori.id}/duzenle`}>
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
          <CardTitle>Resim Kategorileri Detayları</CardTitle>
          <CardDescription>
            Sistemde tanımlı tüm resim kategorileri ve detaylı bilgileri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori Adı</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Resim Sayısı</TableHead>
                <TableHead>Aktif Proje</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Son Güncelleme</TableHead>
                <TableHead className="w-[100px]">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockResimKategorileri.map((kategori) => (
                <TableRow key={kategori.id}>
                  <TableCell className="font-medium">{kategori.ad}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {kategori.aciklama}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {kategori.resimSayisi} resim
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
                          <Link href={`/dashboard/hafriyat/resim-kategorileri/${kategori.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Detaylar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/hafriyat/resim-kategorileri/${kategori.id}/duzenle`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Düzenle
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Upload className="mr-2 h-4 w-4" />
                          Resim Yükle
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Sil
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
