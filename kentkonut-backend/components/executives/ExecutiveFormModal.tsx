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
import RichTextEditor from '@/components/ui/rich-text-editor-tiptap';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
}

interface ExecutiveFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  executive?: Executive | null;
  onSuccess: () => void;
}

const ExecutiveFormModal = ({
  isOpen,
  onOpenChange,
  executive,
  onSuccess,
}: ExecutiveFormModalProps) => {
  const [isLoading, setIsLoading] = useState(false);  const [formData, setFormData] = useState<{
    name: string;
    title: string;
    position: string;
    biography: string;
    imageUrl: string;
    email: string;
    phone: string;
    linkedIn: string;
    order: number;
    isActive: boolean;
    type: 'PRESIDENT' | 'GENERAL_MANAGER' | 'DIRECTOR' | 'MANAGER';
  }>({
    name: "",
    title: "",
    position: "",
    biography: "",
    imageUrl: "",
    email: "",
    phone: "",
    linkedIn: "",
    order: 0,
    isActive: true,
    type: "MANAGER",
  });

  // Reset form when modal opens/closes or executive changes
  useEffect(() => {
    if (isOpen) {
      if (executive) {
        // Edit mode
        setFormData({
          name: executive.name || "",
          title: executive.title || "",
          position: executive.position || "",
          biography: executive.biography || "",
          imageUrl: executive.imageUrl || "",
          email: executive.email || "",
          phone: executive.phone || "",
          linkedIn: executive.linkedIn || "",
          order: executive.order || 0,
          isActive: executive.isActive,
          type: executive.type,
        });
      } else {
        // Add mode
        setFormData({
          name: "",
          title: "",
          position: "",
          biography: "",
          imageUrl: "",
          email: "",
          phone: "",
          linkedIn: "",
          order: 0,
          isActive: true,
          type: "MANAGER",
        });
      }
    }
  }, [isOpen, executive]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = executive
        ? `/api/yoneticiler/${executive.id}`
        : '/api/yoneticiler';
      
      const method = executive ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'İşlem başarısız');
      }

      toast.success(
        executive
          ? 'Yönetici başarıyla güncellendi'
          : 'Yönetici başarıyla eklendi'
      );
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'İşlem başarısız oldu'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const typeOptions = [
    { value: 'PRESIDENT', label: 'Başkan' },
    { value: 'GENERAL_MANAGER', label: 'Genel Müdür' },
    { value: 'DIRECTOR', label: 'Direktör' },
    { value: 'MANAGER', label: 'Müdür' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {executive ? 'Yönetici Düzenle' : 'Yeni Yönetici Ekle'}
          </DialogTitle>
          <DialogDescription>
            {executive
              ? 'Yönetici bilgilerini güncelleyin.'
              : 'Yeni yönetici bilgilerini girin.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Unvan *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Örn: Genel Müdür"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Pozisyon *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Örn: İnsan Kaynakları Müdürü"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tip *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tip seçin" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="ornek@kentkonut.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+90 555 123 45 67"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedIn">LinkedIn</Label>
              <Input
                id="linkedIn"
                type="url"
                value={formData.linkedIn}
                onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Profil Fotoğrafı URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Sıralama</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Durum</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">
                  {formData.isActive ? 'Aktif' : 'Pasif'}
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="biography">Biyografi</Label>
            <RichTextEditor
              content={formData.biography}
              onChange={(content) => handleInputChange('biography', content)}
              minHeight="200px"
              placeholder="Yönetici hakkında detaylı bilgi..."
            />
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
              {executive ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExecutiveFormModal;
