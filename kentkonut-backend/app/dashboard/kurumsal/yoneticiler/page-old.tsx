"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSkeleton } from "@/components/ui/loading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Filter, X, Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Executive {
  id: string;
  name: string;
  title: string;
  position: string;
  biography?: string;
  imageUrl?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  order: number;
  isActive: boolean;
  type: 'PRESIDENT' | 'GENERAL_MANAGER' | 'DIRECTOR' | 'MANAGER';
  createdAt: string;
  updatedAt: string;
}

export default function ExecutivesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [filteredExecutives, setFilteredExecutives] = useState<Executive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [executiveToDelete, setExecutiveToDelete] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // URL parametrelerini kontrol et
  useEffect(() => {
    const type = searchParams.get('type');
    
    if (type) {
      setTypeFilter(type);
    }
  }, [searchParams]);

  // Fetch executives data
  const fetchExecutives = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/yoneticiler');
      
      if (!response.ok) {
        throw new Error('Yöneticiler yüklenirken bir hata oluştu');
      }
      
      const data = await response.json();
      setExecutives(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
      toast.error('Yöneticiler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };
  // Filtreleme logic
  useEffect(() => {
    let filtered = executives;
    
    if (typeFilter !== 'all') {
      filtered = executives.filter(exec => exec.type === typeFilter);
    }
    
    setFilteredExecutives(filtered);
  }, [executives, typeFilter]);
  useEffect(() => {
    fetchExecutives();
  }, []);

  const handleAddExecutive = () => {
    router.push('/dashboard/kurumsal/yoneticiler/form');
  };

  const handleEditExecutive = (executive: Executive) => {
    router.push(`/dashboard/corporate/yoneticiler/form?id=${executive.id}`);
  };

  const handleDeleteClick = (executiveId: string) => {
    setExecutiveToDelete(executiveId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!executiveToDelete) return;

    try {
      const response = await fetch(`/api/yoneticiler/${executiveToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Yönetici silinirken bir hata oluştu');
      }

      await fetchExecutives();
      toast.success("Yönetici başarıyla silindi");
      setIsDeleteDialogOpen(false);
      setExecutiveToDelete(null);
    } catch (error) {
      toast.error("Yönetici silinirken bir hata oluştu");
    }
  };

  const clearTypeFilter = () => {
    setTypeFilter('all');
    // URL'den type parametresini kaldır
    const url = new URL(window.location.href);
    url.searchParams.delete('type');
    window.history.replaceState({}, '', url.toString());
  };

  // İstatistikleri hesapla
  const totalExecutives = executives.length;
  const activeExecutives = executives.filter(exec => exec.isActive).length;
  const inactiveExecutives = totalExecutives - activeExecutives;
  const presidentCount = executives.filter(exec => exec.type === 'PRESIDENT').length;
  const generalManagerCount = executives.filter(exec => exec.type === 'GENERAL_MANAGER').length;
  const directorCount = executives.filter(exec => exec.type === 'DIRECTOR').length;
  const managerCount = executives.filter(exec => exec.type === 'MANAGER').length;

  const getTypeLabel = (type: Executive['type']) => {
    const typeLabels = {
      'PRESIDENT': 'Başkan',
      'GENERAL_MANAGER': 'Genel Müdür',
      'DIRECTOR': 'Direktör',
      'MANAGER': 'Müdür'
    };
    return typeLabels[type] || type;
  };

  const getTypeVariant = (type: Executive['type']) => {
    const variants = {
      'PRESIDENT': 'default',
      'GENERAL_MANAGER': 'secondary',
      'DIRECTOR': 'outline',
      'MANAGER': 'outline'
    } as const;
    return variants[type] || 'outline';
  };  return (
    <div className="container mx-auto py-10">      <Breadcrumb
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Kurumsal", href: "/dashboard/kurumsal" },
          { name: "Yöneticiler", href: "/dashboard/kurumsal/yoneticiler" },
        ]}
        className="mb-4"
      />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Yöneticilerimiz
            {typeFilter !== 'all' && (
              <span className="text-lg font-normal text-muted-foreground ml-2">
                - {getTypeLabel(typeFilter as Executive['type'])}
              </span>
            )}
          </h2>
          <p className="text-muted-foreground">
            Şirket yöneticilerini yönetin
          </p>
        </div>
        <Button onClick={handleAddExecutive}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Yönetici
        </Button>      </div>

      {/* İstatistik Kartları */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Yönetici
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutives}</div>
            <p className="text-xs text-muted-foreground">
              Tüm yöneticiler
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktif Yönetici
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeExecutives}</div>
            <p className="text-xs text-muted-foreground">
              Aktif durumda
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Üst Düzey Yönetici
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presidentCount + generalManagerCount}</div>
            <p className="text-xs text-muted-foreground">
              Başkan ve Genel Müdür
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Orta Kademe
            </CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{directorCount + managerCount}</div>
            <p className="text-xs text-muted-foreground">
              Direktör ve Müdür
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tip filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="PRESIDENT">Başkan</SelectItem>
              <SelectItem value="GENERAL_MANAGER">Genel Müdür</SelectItem>
              <SelectItem value="DIRECTOR">Direktör</SelectItem>
              <SelectItem value="MANAGER">Müdür</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {typeFilter !== 'all' && (
          <Button variant="outline" size="sm" onClick={clearTypeFilter}>
            <X className="mr-2 h-4 w-4" />
            Filtreyi Temizle
          </Button>
        )}
        
        <div className="text-sm text-muted-foreground">
          {filteredExecutives.length} yönetici gösteriliyor
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p className="font-semibold">Hata:</p>
          <p>{error}</p>
          <p className="text-sm mt-2">Lütfen sayfayı yenileyin veya yöneticinize başvurun.</p>
        </div>      ) : executives.length === 0 ? (
        <div className="bg-muted p-8 text-center rounded-md">
          <p className="text-muted-foreground mb-4">Henüz hiç yönetici bulunmuyor.</p>
          <Button onClick={handleAddExecutive}>İlk Yöneticiyi Ekle</Button>
        </div>
      ) : filteredExecutives.length === 0 ? (
        <div className="bg-muted p-8 text-center rounded-md">
          <p className="text-muted-foreground mb-4">
            Seçilen filtreye uygun yönetici bulunamadı.
          </p>
          <Button variant="outline" onClick={clearTypeFilter}>
            Filtreyi Temizle
          </Button>
        </div>
      ) : (        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>Unvan</TableHead>
                <TableHead>Pozisyon</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>E-posta</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead></TableRow>
            </TableHeader>
            <TableBody>{filteredExecutives.map((executive) => (
                <TableRow key={executive.id}>
                  <TableCell className="font-medium">{executive.name}</TableCell>
                  <TableCell>{executive.title}</TableCell>
                  <TableCell>{executive.position}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeVariant(executive.type)}>
                      {getTypeLabel(executive.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{executive.email || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={executive.isActive ? "default" : "secondary"}>
                      {executive.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditExecutive(executive)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(executive.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>))}</TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yöneticiyi Sil</DialogTitle>
            <DialogDescription>
              Bu yöneticiyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}