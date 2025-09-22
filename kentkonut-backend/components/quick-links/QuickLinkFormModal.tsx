"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { QuickLink } from "@/types/corporate";
import { QuickLinkValidationSchema } from "@/utils/corporateValidation";
import { CorporateAPI } from "@/utils/corporateApi";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface QuickLinkFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  quickLink?: QuickLink | null;
  onSuccess: () => void;
}

const iconOptions = [
  { value: "link", label: "Link" },
  { value: "external-link", label: "Dış Link" },
  { value: "user-check", label: "Kullanıcı" },
  { value: "building-2", label: "Bina" },
  { value: "target", label: "Hedef" },
  { value: "trending-up", label: "Grafik" },
  { value: "shield", label: "Kalkan" },
  { value: "book-open", label: "Kitap" },
  { value: "home", label: "Ev" },
  { value: "phone", label: "Telefon" },
  { value: "mail", label: "Email" },
  { value: "map-pin", label: "Konum" },
];

const QuickLinkFormModal = ({
  isOpen,
  onOpenChange,
  quickLink,
  onSuccess,
}: QuickLinkFormModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<{
    title: string;
    url: string;
    description: string;
    icon: string;
    order: number;
    isActive: boolean;
  }>({
    title: "",
    url: "",
    description: "",
    icon: "link",
    order: 0,
    isActive: true,
  });
  // Reset form when modal opens/closes or quickLink changes
  useEffect(() => {
    if (isOpen) {
      if (quickLink) {
        // Edit mode
        setFormData({
          title: quickLink.title || "",
          url: quickLink.url || "",
          description: quickLink.description || "",
          icon: quickLink.icon || "link",
          order: quickLink.order || 0,
          isActive: quickLink.isActive,
        });
      } else {
        // Add mode
        setFormData({
          title: "",
          url: "",
          description: "",
          icon: "link",
          order: 0,
          isActive: true,
        });
      }
      // Clear validation errors when modal opens
      setValidationErrors({});
    }
  }, [isOpen, quickLink]);// Validation function
  const validateForm = (): boolean => {
    try {
      QuickLinkValidationSchema.parse(formData);
      setValidationErrors({});
      return true;
    } catch (error: any) {
      const errors: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const field = err.path[0];
          errors[field] = err.message;
        });
      }
      setValidationErrors(errors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error("Lütfen form hatalarını düzeltin");
      return;
    }
    
    setIsLoading(true);    try {
      let result;
      if (quickLink?.id) {
        // Update existing quick link
        result = await CorporateAPI.quickLinks.update(quickLink.id, formData);
      } else {
        // Create new quick link
        result = await CorporateAPI.quickLinks.create(formData);
      }

      toast.success(
        quickLink 
          ? "Hızlı erişim linki başarıyla güncellendi"
          : "Hızlı erişim linki başarıyla oluşturuldu"
      );
      
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: "",
        url: "",
        description: "",
        icon: "link",
        order: 0,
        isActive: true,
      });
      setValidationErrors({});
    } catch (error) {
      console.error('Quick Link Form - Submit error:', error);
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {quickLink ? "Hızlı Erişim Linki Düzenle" : "Yeni Hızlı Erişim Linki"}
          </DialogTitle>
          <DialogDescription>
            {quickLink 
              ? "Mevcut hızlı erişim linkini düzenleyin" 
              : "Yeni bir hızlı erişim linki ekleyin"
            }
          </DialogDescription>
        </DialogHeader>        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Show general validation errors */}
          {Object.keys(validationErrors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Lütfen aşağıdaki hataları düzeltin ve tekrar deneyin.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4">
            {/* Başlık */}
            <div className="space-y-2">
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Örn: Genel Müdür"
                required
                className={validationErrors.title ? "border-red-500" : ""}
              />
              {validationErrors.title && (
                <p className="text-sm text-red-500">{validationErrors.title}</p>
              )}
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="Örn: /dashboard/kurumsal/yoneticiler?type=GENERAL_MANAGER"
                required
                className={validationErrors.url ? "border-red-500" : ""}
              />
              {validationErrors.url && (
                <p className="text-sm text-red-500">{validationErrors.url}</p>
              )}
            </div>

            {/* Açıklama */}
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Linkin açıklaması (opsiyonel)"
                rows={3}
                className={validationErrors.description ? "border-red-500" : ""}
              />
              {validationErrors.description && (
                <p className="text-sm text-red-500">{validationErrors.description}</p>
              )}
            </div>            {/* İkon ve Sıra */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">İkon</Label>
                <Select 
                  value={formData.icon} 
                  onValueChange={(value) => handleInputChange('icon', value)}
                >
                  <SelectTrigger className={validationErrors.icon ? "border-red-500" : ""}>
                    <SelectValue placeholder="İkon seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.icon && (
                  <p className="text-sm text-red-500">{validationErrors.icon}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Sıra</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  className={validationErrors.order ? "border-red-500" : ""}
                />
                {validationErrors.order && (
                  <p className="text-sm text-red-500">{validationErrors.order}</p>
                )}
              </div>
            </div>

            {/* Aktif/Pasif */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {quickLink ? "Güncelle" : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickLinkFormModal;
