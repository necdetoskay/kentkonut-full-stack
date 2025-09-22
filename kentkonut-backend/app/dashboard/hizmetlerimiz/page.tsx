"use client";

import { useState, useEffect } from "react";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/ui/loading";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  ArrowUpDown,
  List
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ServiceCard } from "@/types";
import { ServiceCardForm } from "./components/ServiceCardForm";
import { SortableServiceCardList } from "./components/SortableServiceCardList";
import { ServiceCardImage } from "./components/ServiceCardImage";

interface ServiceCardStats {
  total: number;
  active: number;
  featured: number;
  totalClicks: number;
}

export default function HizmetlerimizPage() {
  const [serviceCards, setServiceCards] = useState<ServiceCard[]>([]);
  const [stats, setStats] = useState<ServiceCardStats>({
    total: 0,
    active: 0,
    featured: 0,
    totalClicks: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<ServiceCard | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<ServiceCard | null>(null);
  const [sortMode, setSortMode] = useState(false);

  // Fetch service cards data
  const fetchServiceCards = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("isActive", statusFilter);
      }
      if (featuredFilter !== "all") {
        params.append("isFeatured", featuredFilter);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      params.append("limit", "100"); // Get all cards for admin

      const response = await fetch(`/api/hizmetlerimiz?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setServiceCards(data.data || []);

        // Calculate stats
        const cards = data.data || [];
        const newStats = {
          total: cards.length,
          active: cards.filter((card: ServiceCard) => card.isActive).length,
          featured: cards.filter((card: ServiceCard) => card.isFeatured).length,
          totalClicks: cards.reduce((sum: number, card: ServiceCard) => sum + card.clickCount, 0)
        };
        setStats(newStats);
      } else {
        toast.error("Hizmet kartları yüklenirken hata oluştu");
      }
    } catch (error) {
      console.error("Error fetching service cards:", error);
      toast.error("Hizmet kartları yüklenirken hata oluştu");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchServiceCards();
      setLoading(false);
    };
    loadData();
  }, [statusFilter, featuredFilter, searchTerm]);

  // Delete service card
  const handleDeleteCard = async () => {
    if (!cardToDelete) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/hizmetlerimiz/${cardToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Hizmet kartı başarıyla silindi");
        fetchServiceCards();
      } else {
        toast.error("Hizmet kartı silinirken hata oluştu");
      }
    } catch (error) {
      console.error("Error deleting service card:", error);
      toast.error("Hizmet kartı silinirken hata oluştu");
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setCardToDelete(null);
    }
  };

  // Toggle active status
  const toggleActiveStatus = async (card: ServiceCard) => {
    try {
      const response = await fetch(`/api/hizmetlerimiz/${card.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !card.isActive,
        }),
      });

      if (response.ok) {
        toast.success(`Hizmet kartı ${!card.isActive ? 'aktif' : 'pasif'} edildi`);
        fetchServiceCards();
      } else {
        toast.error("Durum güncellenirken hata oluştu");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Durum güncellenirken hata oluştu");
    }
  };

  // Toggle featured status
  const toggleFeaturedStatus = async (card: ServiceCard) => {
    try {
      const response = await fetch(`/api/hizmetlerimiz/${card.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isFeatured: !card.isFeatured,
        }),
      });

      if (response.ok) {
        toast.success(`Hizmet kartı ${!card.isFeatured ? 'öne çıkarıldı' : 'öne çıkarmadan kaldırıldı'}`);
        fetchServiceCards();
      } else {
        toast.error("Öne çıkarma durumu güncellenirken hata oluştu");
      }
    } catch (error) {
      console.error("Error toggling featured status:", error);
      toast.error("Öne çıkarma durumu güncellenirken hata oluştu");
    }
  };

  // Reorder service cards
  const handleReorder = async (cardIds: number[]) => {
    try {
      const response = await fetch('/api/hizmetlerimiz/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardIds }),
      });

      if (response.ok) {
        toast.success('Sıralama güncellendi');
        // Refresh the data to get updated display orders
        fetchServiceCards();
      } else {
        toast.error('Sıralama güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Error reordering cards:', error);
      toast.error('Sıralama güncellenirken hata oluştu');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <LoadingSkeleton rows={8} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hizmetlerimiz</h1>
            <p className="text-gray-600">
              Website'de görüntülenen hizmet kartlarını yönetin
            </p>
          </div>
        </div>
        <Button onClick={() => {
          setEditingCard(null);
          setFormOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Hizmet Kartı
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kart</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif Kartlar</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Öne Çıkan</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.featured}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Tıklama</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalClicks}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <div className="h-6 w-6 bg-purple-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Hizmet kartlarında ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </select>
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="all">Tüm Kartlar</option>
                <option value="true">Öne Çıkan</option>
                <option value="false">Normal</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Cards List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hizmet Kartları Listesi</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={!sortMode ? "default" : "outline"}
                size="sm"
                onClick={() => setSortMode(false)}
              >
                <List className="h-4 w-4 mr-2" />
                Liste
              </Button>
              <Button
                variant={sortMode ? "default" : "outline"}
                size="sm"
                onClick={() => setSortMode(true)}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sırala
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {serviceCards.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Henüz hizmet kartı bulunmuyor
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                İlk hizmet kartınızı oluşturarak başlayın.
              </p>
              <div className="mt-6">
                <Button onClick={() => {
                  setEditingCard(null);
                  setFormOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Hizmet Kartını Oluştur
                </Button>
              </div>
            </div>
          ) : sortMode ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="font-medium">Sıralama Modu</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Hizmet kartlarını sürükleyip bırakarak yeniden sıralayabilirsiniz.
                </p>
              </div>
              <SortableServiceCardList
                cards={serviceCards}
                onReorder={handleReorder}
                onEdit={(card) => {
                  setEditingCard(card);
                  setFormOpen(true);
                }}
                onDelete={(card) => {
                  setCardToDelete(card);
                  setDeleteDialogOpen(true);
                }}
                onToggleActive={toggleActiveStatus}
                onToggleFeatured={toggleFeaturedStatus}
                formatDate={formatDate}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {serviceCards.map((card) => (
                <div key={card.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <ServiceCardImage
                        src={card.imageUrl}
                        alt={card.altText || card.title}
                        title={card.title}
                        fallbackColor={card.color}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                            {card.title}
                          </h3>
                          {card.shortDescription && (
                            <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                              {card.shortDescription}
                            </p>
                          )}

                          {/* Meta info */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div>Sıra: {card.displayOrder}</div>
                            <div>{card.clickCount} tıklama</div>
                            <div>Oluşturulma: {formatDate(card.createdAt.toString())}</div>
                          </div>

                          {/* Status badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant={card.isActive ? "default" : "secondary"}
                              className={card.isActive ? "bg-green-600" : ""}
                            >
                              {card.isActive ? "Aktif" : "Pasif"}
                            </Badge>
                            {card.isFeatured && (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                                <Star className="h-3 w-3 mr-1" />
                                Öne Çıkan
                              </Badge>
                            )}
                            {card.color && (
                              <div className="flex items-center gap-1">
                                <div
                                  className="w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: card.color }}
                                ></div>
                                <span className="text-xs text-muted-foreground">{card.color}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingCard(card);
                                setFormOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleActiveStatus(card)}
                            >
                              {card.isActive ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Pasif Yap
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Aktif Yap
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleFeaturedStatus(card)}
                            >
                              {card.isFeatured ? (
                                <>
                                  <StarOff className="h-4 w-4 mr-2" />
                                  Öne Çıkarmayı Kaldır
                                </>
                              ) : (
                                <>
                                  <Star className="h-4 w-4 mr-2" />
                                  Öne Çıkar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setCardToDelete(card);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hizmet Kartını Sil</AlertDialogTitle>
            <AlertDialogDescription>
              "{cardToDelete?.title}" adlı hizmet kartını silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCard}
              className="bg-destructive text-destructive-foreground"
              disabled={deleteLoading}
            >
              {deleteLoading ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Service Card Form */}
      <ServiceCardForm
        open={formOpen}
        onOpenChange={setFormOpen}
        card={editingCard}
        onSuccess={fetchServiceCards}
      />
    </div>
  );
}
