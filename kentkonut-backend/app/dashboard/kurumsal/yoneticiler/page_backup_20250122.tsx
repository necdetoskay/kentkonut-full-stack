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
import { Plus, Edit, Trash2, Filter, X, Users, UserCheck, UserX, TrendingUp, ExternalLink } from "lucide-react";
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
    router.push('/dashboard/kurumsal/yoneticiler/form');
  };

  const handleEditExecutive = (executive: Executive) => {
    router.push(`/dashboard/kurumsal/yoneticiler/form?id=${executive.id}`);
  };

  const handleDeleteClick = (executiveId: string) => {
    setExecutiveToDelete(executiveId);
    setIsDeleteDialogOpen(true);
  };

  const handleExecutiveClick = (executive: Executive) => {
    if (executive.page && executive.page.isActive) {
      // Navigate to the linked page
      router.push(`/dashboard/pages/${executive.page.id}`);
    }
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
            { name: "Kurumsal", href: "/dashboard/kurumsal" },
            { name: "Yöneticiler", href: "/dashboard/kurumsal/yoneticiler" },
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

        {/* Grid Layout */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tekrar Dene
            </Button>
          </div>
        ) : executives.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {typeFilter !== 'all'
                ? "Seçilen filtreye uygun yönetici bulunamadı."
                : "Henüz hiç yönetici bulunmuyor."}
            </p>
            <Button onClick={handleAddExecutive}>
              <Plus className="mr-2 h-4 w-4" />
              İlk Yöneticiyi Ekle
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
            {executives.map((executive) => (
              <Card
                key={executive.id}
                className={`group transition-all duration-200 hover:shadow-lg ${
                  executive.page ? 'cursor-pointer hover:scale-105' : ''
                }`}
                onClick={() => handleExecutiveClick(executive)}
              >
                <CardContent className="p-6 text-center relative">
                  {/* Profile Image */}
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    {executive.imageUrl ? (
                      <img
                        src={executive.imageUrl}
                        alt={executive.name}
                        className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {executive.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    {executive.page && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <ExternalLink className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="mb-2">
                    <Badge variant={getTypeVariant(executive.type)} className="text-xs">
                      {getTypeLabel(executive.type)}
                    </Badge>
                  </div>

                  {/* Name */}
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {executive.name}
                  </h3>

                  {/* Position */}
                  <p className="text-sm text-gray-600 mb-3">
                    {executive.position}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditExecutive(executive);
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(executive.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-2 right-2">
                    <div className={`w-3 h-3 rounded-full ${
                      executive.isActive ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                </CardContent>
              </Card>
            ))}
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
    </CorporateErrorBoundary>
  );
}
