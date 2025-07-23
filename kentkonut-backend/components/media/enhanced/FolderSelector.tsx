"use client";

import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Folder, 
  FolderPlus, 
  Image, 
  FileText, 
  Building2, 
  UserCheck,
  FileImage,
  Newspaper,
  Plus,
  Check,
  X
} from "lucide-react";
import { useMediaCategories, MediaCategory } from "@/app/context/MediaCategoryContext";
import { toast } from "sonner";

interface FolderSelectorProps {
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  customFolder?: string;
  onCustomFolderChange?: (folder: string) => void;
  enableCustomFolder?: boolean;
  enableCategoryCreation?: boolean;
  disabled?: boolean;
  className?: string;
  showCategoryInfo?: boolean;
  compact?: boolean;
}

// Icon mapping for categories
const getCategoryIcon = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    'Image': Image,
    'Images': Image,
    'FileText': FileText,
    'Newspaper': Newspaper,
    'Building2': Building2,
    'UserCheck': UserCheck,
    'FileImage': FileImage,
    'Folder': Folder,
  };
  return iconMap[iconName] || Folder;
};

// Default folder paths for categories
const getCategoryPath = (categoryId: number | null, categoryName?: string): string => {
  const pathMap: { [key: number]: string } = {
    1: '/media/bannerlar',      // Bannerlar
    2: '/media/haberler',       // Haberler
    3: '/media/projeler',       // Projeler
    4: '/media/birimler',       // Birimler
    5: '/media/sayfa',          // İçerik Resimleri (Pages)
    6: '/media/kurumsal',       // Kurumsal
  };
  
  if (categoryId && pathMap[categoryId]) {
    return pathMap[categoryId];
  }
  
  if (categoryName) {
    return `/media/${categoryName.toLowerCase().replace(/\s+/g, '-')}`;
  }
  
  return '/media/genel';
};

export function FolderSelector({
  selectedCategoryId,
  onCategoryChange,
  customFolder,
  onCustomFolderChange,
  enableCustomFolder = false,
  enableCategoryCreation = false,
  disabled = false,
  className = "",
  showCategoryInfo = true,
  compact = false
}: FolderSelectorProps) {
  const { categories, isLoading, addCategory } = useMediaCategories();
  const [showCustomFolderInput, setShowCustomFolderInput] = useState(false);
  const [customFolderInput, setCustomFolderInput] = useState(customFolder || "");
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Update custom folder input when prop changes
  useEffect(() => {
    setCustomFolderInput(customFolder || "");
  }, [customFolder]);

  // Handle category selection
  const handleCategorySelect = (value: string) => {
    if (value === "custom") {
      setShowCustomFolderInput(true);
      onCategoryChange(null);
    } else if (value === "new") {
      setShowNewCategoryForm(true);
    } else {
      const categoryId = value === "all" ? null : parseInt(value);
      onCategoryChange(categoryId);
      setShowCustomFolderInput(false);
    }
  };

  // Handle custom folder confirmation
  const handleCustomFolderConfirm = () => {
    if (customFolderInput.trim()) {
      onCustomFolderChange?.(customFolderInput.trim());
      setShowCustomFolderInput(false);
      toast.success(`Özel klasör ayarlandı: ${customFolderInput}`);
    }
  };

  // Handle custom folder cancel
  const handleCustomFolderCancel = () => {
    setCustomFolderInput(customFolder || "");
    setShowCustomFolderInput(false);
    if (selectedCategoryId) {
      // Revert to selected category
    } else {
      onCategoryChange(null);
    }
  };

  // Handle new category creation
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Kategori adı gereklidir");
      return;
    }

    setIsCreatingCategory(true);
    try {
      const newCategory = await addCategory({
        name: newCategoryName.trim(),
        icon: "Folder",
        order: categories.length,
        isBuiltIn: false
      });
      
      onCategoryChange(newCategory.id);
      setNewCategoryName("");
      setShowNewCategoryForm(false);
      toast.success(`Yeni kategori oluşturuldu: ${newCategory.name}`);
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Kategori oluşturulurken hata oluştu");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // Get selected category info
  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
  const selectedPath = customFolder || getCategoryPath(selectedCategoryId, selectedCategory?.name);

  // Get display value for select
  const getSelectValue = () => {
    if (showCustomFolderInput || customFolder) return "custom";
    if (selectedCategoryId === null) return "all";
    return selectedCategoryId.toString();
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Select 
          value={getSelectValue()} 
          onValueChange={handleCategorySelect}
          disabled={disabled || isLoading}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Klasör seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Tüm Klasörler
              </div>
            </SelectItem>
            {categories.map((category) => {
              const CategoryIcon = getCategoryIcon(category.icon);
              return (
                <SelectItem key={category.id} value={category.id.toString()}>
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="w-4 h-4" />
                    {category.name}
                    {category.mediaCount !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        {category.mediaCount}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              );
            })}
            {enableCustomFolder && (
              <SelectItem value="custom">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-4 h-4" />
                  Özel Klasör
                </div>
              </SelectItem>
            )}
            {enableCategoryCreation && (
              <SelectItem value="new">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Yeni Kategori
                </div>
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        {showCategoryInfo && selectedPath && (
          <Badge variant="outline" className="text-xs">
            {selectedPath}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Folder className="w-5 h-5 text-gray-600" />
        <h3 className="text-sm font-medium text-gray-900">Yükleme Klasörü</h3>
      </div>

      {/* Category Selector */}
      <div className="space-y-2">
        <Select 
          value={getSelectValue()} 
          onValueChange={handleCategorySelect}
          disabled={disabled || isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Klasör seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                <div>
                  <div className="font-medium">Tüm Klasörler</div>
                  <div className="text-xs text-gray-500">Genel medya klasörü</div>
                </div>
              </div>
            </SelectItem>
            
            {categories.map((category) => {
              const CategoryIcon = getCategoryIcon(category.icon);
              const categoryPath = getCategoryPath(category.id, category.name);
              
              return (
                <SelectItem key={category.id} value={category.id.toString()}>
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category.name}</span>
                        {category.mediaCount !== undefined && (
                          <Badge variant="secondary" className="text-xs">
                            {category.mediaCount}
                          </Badge>
                        )}
                        {category.isBuiltIn && (
                          <Badge variant="outline" className="text-xs">
                            Sistem
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{categoryPath}</div>
                    </div>
                  </div>
                </SelectItem>
              );
            })}

            {enableCustomFolder && (
              <SelectItem value="custom">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Özel Klasör</div>
                    <div className="text-xs text-gray-500">Kendi klasör yolunuzu belirtin</div>
                  </div>
                </div>
              </SelectItem>
            )}

            {enableCategoryCreation && (
              <SelectItem value="new">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <div>
                    <div className="font-medium">Yeni Kategori</div>
                    <div className="text-xs text-gray-500">Yeni kategori oluştur</div>
                  </div>
                </div>
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        {/* Custom Folder Input */}
        {showCustomFolderInput && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <Input
              placeholder="Klasör yolu (örn: media/ozel-klasor)"
              value={customFolderInput}
              onChange={(e) => setCustomFolderInput(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCustomFolderConfirm();
                } else if (e.key === 'Escape') {
                  handleCustomFolderCancel();
                }
              }}
            />
            <Button
              size="sm"
              onClick={handleCustomFolderConfirm}
              disabled={!customFolderInput.trim()}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCustomFolderCancel}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* New Category Form */}
        {showNewCategoryForm && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <Input
              placeholder="Yeni kategori adı"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateCategory();
                } else if (e.key === 'Escape') {
                  setShowNewCategoryForm(false);
                  setNewCategoryName("");
                }
              }}
            />
            <Button
              size="sm"
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim() || isCreatingCategory}
            >
              {isCreatingCategory ? "..." : <Check className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowNewCategoryForm(false);
                setNewCategoryName("");
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Selected Path Info */}
      {showCategoryInfo && selectedPath && (
        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <Folder className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-800">
            <strong>Hedef:</strong> {selectedPath}
          </span>
        </div>
      )}
    </div>
  );
}
