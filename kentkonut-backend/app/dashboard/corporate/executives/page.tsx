"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Plus, Edit, Trash2, Filter, X, Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExecutives } from "@/hooks/useCorporate";
import CorporateTable, { StandardActions, ColumnRenderers } from "@/components/corporate/CorporateTable";
import CorporateErrorBoundary from "@/components/corporate/CorporateErrorBoundary";
import { Executive, ExecutiveType, EXECUTIVE_TYPES } from "@/types/corporate";

export default function ExecutivesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [executiveToDelete, setExecutiveToDelete] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Initialize filter from URL params
  useState(() => {
    const type = searchParams.get('type');
    if (type) {
      setTypeFilter(type);
    }
  });

  // Use the new corporate hooks with filters
  const { 
    executives, 
    allExecutives,
    isLoading, 
    error, 
    statistics,
    actions 
  } = useExecutives({
    type: typeFilter === 'all' ? undefined : typeFilter as ExecutiveType
  });

  // Event handlers
  const handleAddExecutive = () => {
    router.push('/dashboard/corporate/executives/form');
  };

  const handleEditExecutive = (executive: Executive) => {
    router.push(`/dashboard/corporate/executives/form?id=${executive.id}`);
  };

  const handleDeleteClick = (executiveId: string) => {
    setExecutiveToDelete(executiveId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!executiveToDelete) return;

    try {
      await actions.delete(executiveToDelete);
      setIsDeleteDialogOpen(false);
      setExecutiveToDelete(null);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const clearTypeFilter = () => {
    setTypeFilter('all');
    // Remove type parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('type');
    window.history.replaceState({}, '', url.toString());
  };

  const getTypeLabel = (type: ExecutiveType): string => {
    return EXECUTIVE_TYPES.find(t => t.value === type)?.label || type;
  };

  const getTypeVariant = (type: ExecutiveType) => {
    const variants = {
      'PRESIDENT': 'default',
      'GENERAL_MANAGER': 'secondary',
      'DIRECTOR': 'outline',
      'MANAGER': 'outline'
    } as const;
    return variants[type] || 'outline';
  };

  // Table configuration
  const columns = [
    {
      key: 'name',
      label: 'Ad Soyad',
      sortable: true,
      render: (name: string) => (
        <span className="font-medium">{name}</span>
      ),
    },
    {
      key: 'title',
      label: 'Unvan',
      sortable: true,
    },
    {
      key: 'position',
      label: 'Pozisyon',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Tip',
      render: (type: ExecutiveType) => (
        <Badge variant={getTypeVariant(type)}>
          {getTypeLabel(type)}
        </Badge>
      ),
      align: 'center' as const,
    },
    {
      key: 'email',
      label: 'E-posta',
      render: (email: string) => 
        email ? ColumnRenderers.email(email) : '-',
    },
    {
      key: 'isActive',
      label: 'Durum',
      render: (isActive: boolean) => ColumnRenderers.status(isActive),
      align: 'center' as const,
    },
  ];

  const tableActions = StandardActions.editDelete<Executive>(
    handleEditExecutive,
    (executive) => handleDeleteClick(executive.id)
  );

  return (
    <CorporateErrorBoundary>
      <div className="container mx-auto py-10">
        {/* Breadcrumb */}
        <Breadcrumb
          segments={[
            { name: "Dashboard", href: "/dashboard" },
            { name: "Kurumsal", href: "/dashboard/corporate" },
            { name: "Yöneticiler", href: "/dashboard/corporate/executives" },
          ]}
          className="mb-4"
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Yöneticilerimiz
              {typeFilter !== 'all' && (
                <span className="text-lg font-normal text-muted-foreground ml-2">
                  - {getTypeLabel(typeFilter as ExecutiveType)}
                </span>
              )}
            </h1>
            <p className="text-muted-foreground mt-2">
              Şirket yöneticilerini yönetin
            </p>
          </div>
          <Button onClick={handleAddExecutive}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Yönetici
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Yönetici
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total}</div>
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
              <div className="text-2xl font-bold">{statistics.active}</div>
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
              <div className="text-2xl font-bold">
                {statistics.types.president + statistics.types.generalManager}
              </div>
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
              <div className="text-2xl font-bold">
                {statistics.types.director + statistics.types.manager}
              </div>
              <p className="text-xs text-muted-foreground">
                Direktör ve Müdür
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tip filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {EXECUTIVE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
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
            {executives.length} yönetici gösteriliyor
          </div>
        </div>

        {/* Data Table */}
        <CorporateTable
          data={executives}
          columns={columns}
          actions={tableActions}
          loading={isLoading}
          error={error}
          emptyMessage={
            typeFilter !== 'all' 
              ? "Seçilen filtreye uygun yönetici bulunamadı."
              : "Henüz hiç yönetici bulunmuyor. İlk yöneticiyi eklemek için yukarıdaki butonu kullanın."
          }
          showRowNumbers={false}
          className="mb-6"
        />

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
    </CorporateErrorBoundary>
  );
}
