"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ServiceCard, ServiceCardFormData } from "@/types";
import { Loader2, Upload, Link as LinkIcon, X } from "lucide-react";
import { GlobalMediaSelector, GlobalMediaFile } from "@/components/media/GlobalMediaSelector";

interface ServiceCardFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: ServiceCard | null;
  onSuccess: () => void;
}

export function ServiceCardForm({ open, onOpenChange, card, onSuccess }: ServiceCardFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<GlobalMediaFile | null>(null);
  const [formData, setFormData] = useState<ServiceCardFormData>({
    title: "",
    description: "",
    shortDescription: "",
    slug: "",
    imageUrl: "",
    altText: "",
    targetUrl: "",
    isExternal: false,
    color: "#4F772D",
    backgroundColor: "",
    textColor: "",
    isActive: true,
    isFeatured: false,
    displayOrder: 0,
    metaTitle: "",
    metaDescription: "",
  });

  // Handle media selection
  const handleMediaSelect = (media: GlobalMediaFile) => {
    setSelectedMedia(media);
  };

  const clearSelectedMedia = () => {
    setSelectedMedia(null);
    setFormData(prev => ({
      ...prev,
      imageUrl: "",
      altText: ""
    }));
  };

  // Update form data when media is selected
  useEffect(() => {
    if (selectedMedia) {
      setFormData(prev => ({
        ...prev,
        imageUrl: selectedMedia.url,
        altText: selectedMedia.alt || selectedMedia.originalName
      }));
    }
  }, [selectedMedia]);

  // Reset form when dialog opens/closes or card changes
  useEffect(() => {
    if (open) {
      if (card) {
        // Edit mode - populate form with existing data
        setFormData({
          title: card.title,
          description: card.description || "",
          shortDescription: card.shortDescription || "",
          slug: card.slug,
          imageUrl: card.imageUrl,
          altText: card.altText || "",
          targetUrl: card.targetUrl || "",
          isExternal: card.isExternal,
          color: card.color,
          backgroundColor: card.backgroundColor || "",
          textColor: card.textColor || "",
          isActive: card.isActive,
          isFeatured: card.isFeatured,
          displayOrder: card.displayOrder,
          metaTitle: card.metaTitle || "",
          metaDescription: card.metaDescription || "",
        });
        // Reset selected media when editing
        setSelectedMedia(null);
      } else {
        // Create mode - reset to defaults
        setFormData({
          title: "",
          description: "",
          shortDescription: "",
          slug: "",
          imageUrl: "",
          altText: "",
          targetUrl: "",
          isExternal: false,
          color: "#4F772D",
          backgroundColor: "",
          textColor: "",
          isActive: true,
          isFeatured: false,
          displayOrder: 0,
          metaTitle: "",
          metaDescription: "",
        });
        setSelectedMedia(null);
      }
    }
  }, [open, card]);

  const handleInputChange = (field: keyof ServiceCardFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    handleInputChange('title', title);
    // Auto-generate slug if not manually set
    if (!formData.slug || formData.slug === generateSlug(formData.title)) {
      handleInputChange('slug', generateSlug(title));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Başlık gereklidir");
      return;
    }
    
    if (!formData.imageUrl.trim()) {
      toast.error("Görsel URL'si gereklidir");
      return;
    }

    setLoading(true);
    
    try {
      const url = card ? `/api/hizmetlerimiz/${card.id}` : '/api/hizmetlerimiz';
      const method = card ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(card ? 'Hizmet kartı güncellendi' : 'Hizmet kartı oluşturuldu');
        onSuccess();
        onOpenChange(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Error saving service card:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {card ? 'Hizmet Kartını Düzenle' : 'Yeni Hizmet Kartı'}
          </DialogTitle>
          <DialogDescription>
            {card ? 'Mevcut hizmet kartını düzenleyin' : 'Yeni bir hizmet kartı oluşturun'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Temel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Hizmet kartı başlığı"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="url-friendly-slug"
                />
              </div>

              <div>
                <Label htmlFor="shortDescription">Kısa Açıklama</Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Kart üzerinde görünecek kısa açıklama"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="description">Detaylı Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Hizmet hakkında detaylı bilgi"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Visual Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Görsel Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hizmet Görseli *</Label>
                <div className="mt-2">
                  <GlobalMediaSelector
                    onSelect={handleMediaSelect}
                    selectedMedia={selectedMedia}
                    defaultCategory="service-images"
                    targetWidth={400}
                    targetHeight={300}
                    width={400}
                    height={300}
                    buttonText="Hizmet Görseli Seç"
                    title="Hizmet Görseli Seç"
                    description="Hizmet kartı için görsel seçin veya yükleyin"
                    acceptedTypes={['image/*']}
                    restrictToCategory={true}
                    customFolder="services"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Önerilen boyut: 400×300px veya 4:3 oranında
                </p>
              </div>

              {/* Selected Image Preview */}
              {(selectedMedia || formData.imageUrl) && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <Label className="text-sm font-medium">
                      {selectedMedia ? "Yeni Seçilen Görsel" : "Mevcut Görsel"}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearSelectedMedia}
                      title={selectedMedia ? "Seçimi temizle" : "Görseli kaldır"}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-20 h-15 bg-white border rounded overflow-hidden flex-shrink-0">
                      <img
                        src={selectedMedia?.url || formData.imageUrl}
                        alt={selectedMedia?.alt || formData.altText || "Seçili görsel"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xNSAxMi0zLTMtMy4wMDEgMy0yLTItNCAzdjJoMTJ2LTJ6IiBmaWxsPSIjOWNhM2FmIi8+CjxjaXJjbGUgY3g9IjEwLjUiIGN5PSI4LjUiIHI9IjEuNSIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4K";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {selectedMedia?.originalName || (card ? card.title : "Mevcut görsel")}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {selectedMedia?.url || formData.imageUrl}
                      </p>
                      {selectedMedia && (
                        <p className="text-xs text-gray-500">
                          {selectedMedia.width}×{selectedMedia.height}px
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="altText">Alt Text</Label>
                <Input
                  id="altText"
                  value={formData.altText}
                  onChange={(e) => handleInputChange('altText', e.target.value)}
                  placeholder="Görsel açıklaması (erişilebilirlik için)"
                />
              </div>

              <div>
                <Label htmlFor="color">Ana Renk</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-20"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="#4F772D"
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Link Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bağlantı Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="targetUrl">Hedef URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="targetUrl"
                    value={formData.targetUrl}
                    onChange={(e) => handleInputChange('targetUrl', e.target.value)}
                    placeholder="/hizmetler/konut-hizmetleri veya https://example.com"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isExternal"
                  checked={formData.isExternal}
                  onCheckedChange={(checked) => handleInputChange('isExternal', checked)}
                />
                <Label htmlFor="isExternal">Harici bağlantı (yeni sekmede açılır)</Label>
              </div>
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Görüntüleme Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="displayOrder">Görüntüleme Sırası</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                />
                <Label htmlFor="isFeatured">Öne çıkan</Label>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {card ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
