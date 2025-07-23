"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Folder, Plus, Settings, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CategoryForm } from "@/components/media/CategoryForm";
import { MediaGallery } from "@/components/media/MediaGallery";
import { MediaCategoryProvider, useMediaCategories, MediaCategory } from "@/app/context/MediaCategoryContext";
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

function MediaPageContent() {
  const { categories, isLoading, deleteCategory } = useMediaCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<MediaCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<MediaCategory | null>(null);

  // Set default category to "all" when categories change
  useEffect(() => {
    setSelectedCategory("all");
  }, [categories]);

  // Handle category edit
  const handleEditCategory = (category: MediaCategory) => {
    setSelectedCategoryForEdit(category);
    setIsEditCategoryOpen(true);
  };

  // Handle category delete confirmation
  const handleDeleteConfirm = (category: MediaCategory) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  // Handle actual category deletion
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete.id);
      toast.success("Kategori başarıyla silindi");
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      toast.error("Kategori silinirken bir hata oluştu");
    }
  };

  // Get icon component for a category
  const getCategoryIcon = (iconName: string) => {
    const LucideIcons = require("lucide-react");
    return iconName && LucideIcons[iconName] ? LucideIcons[iconName] : Folder;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Medya Yönetimi</h1>
          <p className="text-muted-foreground mt-1">Tüm medya dosyalarınızı tek bir yerden yönetin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAddCategoryOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Kategori Ekle
          </Button>
        </div>
      </div>

      {/* Kategori Sekmeleri */}
      <Tabs defaultValue={selectedCategory} value={selectedCategory} onValueChange={setSelectedCategory}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">
              <Folder className="h-4 w-4 mr-2" />
              Tümü
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                {categories.reduce((total, cat) => total + (cat.mediaCount || 0), 0)}
              </span>
            </TabsTrigger>

            {/* Dynamic categories from database */}
            {categories.map((category) => {
              const CategoryIcon = getCategoryIcon(category.icon);
              return (
                <TabsTrigger key={category.id} value={`category-${category.id}`} className="group relative">
                  <CategoryIcon className="h-4 w-4 mr-2" />
                  <div className="flex items-center">
                    {category.name}
                    {category.mediaCount !== undefined && (
                      <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                        {category.mediaCount}
                      </span>
                    )}
                    {category.isBuiltIn && (
                      <span className="ml-1 text-xs bg-primary/20 text-primary px-1 py-0.5 rounded-sm">
                        Sistem
                      </span>
                    )}
                  </div>

                  {/* Category actions dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div
                        className="h-6 w-6 absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Settings className="h-3 w-3" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleEditCategory(category);
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        disabled={category.isBuiltIn}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!category.isBuiltIn) {
                            handleDeleteConfirm(category);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value={selectedCategory} className="flex-1 mt-2">
          <MediaGallery
            categoryId={selectedCategory === "all" ? undefined : parseInt(selectedCategory.replace("category-", ""))}
            showUploader={true}
            selectionMode={true}
            useEnhancedUploader={true}
          />
        </TabsContent>
      </Tabs>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Kategori Ekle</DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSuccess={() => {
              setIsAddCategoryOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kategori Düzenle</DialogTitle>
          </DialogHeader>
          {selectedCategoryForEdit && (
            <CategoryForm
              initialData={selectedCategoryForEdit}
              onSuccess={() => {
                setIsEditCategoryOpen(false);
                setSelectedCategoryForEdit(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategori Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete?.isBuiltIn ? (
                <>
                  <div className="text-destructive font-medium mb-2">Bu kategori silinemez!</div>
                  <p><strong>{categoryToDelete?.name}</strong> kategorisi sistem tarafından oluşturulmuş bir kategoridir ve silinemez.</p>
                </>
              ) : categoryToDelete?.mediaCount && categoryToDelete.mediaCount > 0 ? (
                <>
                  <div className="text-amber-600 font-medium mb-2">Dikkat!</div>
                  <p><strong>{categoryToDelete?.name}</strong> kategorisinde <strong>{categoryToDelete.mediaCount}</strong> medya dosyası bulunmaktadır.</p>
                  <p className="mt-2 text-sm">Bu kategoriyi silmek için önce medya dosyalarını başka bir kategoriye taşıyın veya silin.</p>
                </>
              ) : (
                <><strong>{categoryToDelete?.name}</strong> kategorisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
              {categoryToDelete?.isBuiltIn || (categoryToDelete?.mediaCount && categoryToDelete.mediaCount > 0) ? 'Tamam' : 'İptal'}
            </AlertDialogCancel>
            {!categoryToDelete?.isBuiltIn && (!categoryToDelete?.mediaCount || categoryToDelete.mediaCount === 0) && (
              <AlertDialogAction
                onClick={handleDeleteCategory}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sil
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Export the MediaPageContent as the default component
export default MediaPageContent;
