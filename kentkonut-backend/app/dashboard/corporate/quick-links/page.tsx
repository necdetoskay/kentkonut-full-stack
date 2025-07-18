"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ExternalLink, Link as LinkIcon } from "lucide-react";
import QuickLinkFormModal from "@/components/quick-links/QuickLinkFormModal";
import { useQuickLinks } from "@/hooks/useCorporate";
import CorporateTable, { StandardActions, ColumnRenderers } from "@/components/corporate/CorporateTable";
import CorporateErrorBoundary from "@/components/corporate/CorporateErrorBoundary";
import { QuickLink } from "@/types/corporate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuickLinksPage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState<QuickLink | null>(null);

  // Use the new corporate hooks
  const { 
    quickLinks, 
    isLoading, 
    error, 
    statistics,
    actions 
  } = useQuickLinks();

  // Event handlers
  const handleAddLink = () => {
    setLinkToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditLink = (link: QuickLink) => {
    setLinkToEdit(link);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (linkId: string) => {
    setLinkToDelete(linkId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!linkToDelete) return;

    try {
      await actions.delete(linkToDelete);
      setIsDeleteDialogOpen(false);
      setLinkToDelete(null);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    actions.refetch();
  };

  // Table configuration
  const columns = [
    {
      key: 'order',
      label: 'Sıra',
      sortable: true,
      className: 'w-20',
      align: 'center' as const,
    },
    {
      key: 'title',
      label: 'Başlık',
      sortable: true,
    },
    {
      key: 'url',
      label: 'URL',
      render: (url: string) => ColumnRenderers.url(url),
      className: 'max-w-md',
    },
    {
      key: 'description',
      label: 'Açıklama',
      render: (description: string) => 
        description ? ColumnRenderers.truncatedText(description, 40) : '-',
      className: 'max-w-xs',
    },
    {
      key: 'icon',
      label: 'İkon',
      render: (icon: string) => (
        <span className="px-2 py-1 bg-muted rounded text-xs font-mono">
          {icon || 'link'}
        </span>
      ),
      align: 'center' as const,
    },
    {
      key: 'isActive',
      label: 'Durum',
      render: (isActive: boolean) => ColumnRenderers.status(isActive),
      align: 'center' as const,
    },
  ];

  const tableActions = StandardActions.editDelete<QuickLink>(
    handleEditLink,
    (link) => handleDeleteClick(link.id)
  );

  return (
    <CorporateErrorBoundary>
      <div className="container mx-auto py-10">
        {/* Breadcrumb */}
        <Breadcrumb 
          className="mb-6"
          segments={[
            { name: "Dashboard", href: "/dashboard" },
            { name: "Kurumsal", href: "/dashboard/corporate" },
            { name: "Hızlı Erişim Linkleri", href: "/dashboard/corporate/quick-links" }
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Hızlı Erişim Linkleri
            </h1>
            <p className="text-muted-foreground mt-2">
              Frontend'de gösterilecek hızlı erişim linklerini yönetin
            </p>
          </div>
          <Button onClick={handleAddLink}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Link Ekle
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Link</CardTitle>
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total}</div>
              <p className="text-xs text-muted-foreground">
                Tüm linkler
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Linkler</CardTitle>
              <ExternalLink className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.active}</div>
              <p className="text-xs text-muted-foreground">
                Yayında olan linkler
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pasif Linkler</CardTitle>
              <Trash2 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.inactive}</div>
              <p className="text-xs text-muted-foreground">
                Devre dışı linkler
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <CorporateTable
          data={quickLinks}
          columns={columns}
          actions={tableActions}
          loading={isLoading}
          error={error}
          emptyMessage="Henüz hiç hızlı erişim linki bulunmuyor. İlk linkinizi eklemek için yukarıdaki butonu kullanın."
          showRowNumbers={false}
          className="mb-6"
        />

        {/* Quick Link Form Modal */}
        <QuickLinkFormModal
          isOpen={isFormModalOpen}
          onOpenChange={setIsFormModalOpen}
          quickLink={linkToEdit}
          onSuccess={handleFormSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hızlı Erişim Linkini Sil</DialogTitle>
              <DialogDescription>
                Bu hızlı erişim linkini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
