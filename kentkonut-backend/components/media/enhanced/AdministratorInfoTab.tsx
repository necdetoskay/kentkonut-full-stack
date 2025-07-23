"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Upload, 
  Image as ImageIcon, 
  Save, 
  UserCheck, 
  Mail, 
  Phone, 
  Building,
  Briefcase,
  FileText,
  Camera,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { GlobalMediaFile } from "../GlobalMediaSelector";
import { MediaBrowserSimple } from "../MediaBrowserSimple";

// Executive types matching the existing system
export const EXECUTIVE_TYPES = [
  { value: 'PRESIDENT', label: 'Başkan' },
  { value: 'GENERAL_MANAGER', label: 'Genel Müdür' },
  { value: 'DIRECTOR', label: 'Direktör' },
  { value: 'MANAGER', label: 'Müdür' },
  { value: 'DEPARTMENT', label: 'Bölüm Müdürü' },
  { value: 'STRATEGY', label: 'Strateji Müdürü' },
  { value: 'GOAL', label: 'Hedef Müdürü' }
] as const;

export type ExecutiveType = typeof EXECUTIVE_TYPES[number]['value'];

interface AdministratorData {
  name: string;
  title: string;
  position: string;
  type: ExecutiveType;
  email: string;
  phone: string;
  linkedIn: string;
  biography: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

interface AdministratorInfoTabProps {
  onAdministratorSave?: (data: AdministratorData & { imageFile?: GlobalMediaFile }) => void;
  initialData?: Partial<AdministratorData>;
  className?: string;
  disabled?: boolean;
}

export function AdministratorInfoTab({
  onAdministratorSave,
  initialData,
  className = "",
  disabled = false
}: AdministratorInfoTabProps) {
  // Form state
  const [formData, setFormData] = useState<AdministratorData>({
    name: "",
    title: "",
    position: "",
    type: "MANAGER",
    email: "",
    phone: "",
    linkedIn: "",
    biography: "",
    imageUrl: "",
    order: 0,
    isActive: true,
    ...initialData
  });

  // UI state
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GlobalMediaFile | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Ad Soyad gereklidir";
    }

    if (!formData.title.trim()) {
      errors.title = "Unvan gereklidir";
    }

    if (!formData.position.trim()) {
      errors.position = "Pozisyon gereklidir";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Geçerli bir e-posta adresi girin";
    }

    if (formData.linkedIn && !formData.linkedIn.includes('linkedin.com')) {
      errors.linkedIn = "Geçerli bir LinkedIn URL'si girin";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof AdministratorData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle image selection
  const handleImageSelect = (files: GlobalMediaFile[]) => {
    if (files.length === 0) return;

    const selectedFile = files[0];
    
    // Validate image file
    if (!selectedFile.mimeType.startsWith('image/')) {
      toast.error('Lütfen bir resim dosyası seçin');
      return;
    }

    setSelectedImage(selectedFile);
    handleFieldChange('imageUrl', selectedFile.url);
    setShowMediaBrowser(false);
    toast.success('Profil fotoğrafı seçildi');
  };

  // Handle form save
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    setIsValidating(true);
    
    try {
      await onAdministratorSave?.({
        ...formData,
        imageFile: selectedImage || undefined
      });
      
      toast.success('Yönetici bilgileri kaydedildi');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Kaydetme sırasında hata oluştu');
    } finally {
      setIsValidating(false);
    }
  };

  // Get type label
  const getTypeLabel = (type: ExecutiveType): string => {
    return EXECUTIVE_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Yönetici Bilgileri</h3>
        </div>
        <p className="text-sm text-gray-600">
          Yönetici profil bilgilerini ve fotoğrafını yönetin
        </p>
      </div>

      {/* Profile Photo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Profil Fotoğrafı
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Image Preview */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              {formData.imageUrl ? (
                <img
                  src={formData.imageUrl}
                  alt="Profil fotoğrafı"
                  className="w-full h-full object-cover rounded-full border-2 border-gray-200"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-gray-200 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">
                    {formData.name ? formData.name.charAt(0) : '?'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMediaBrowser(true)}
                disabled={disabled}
                className="flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Fotoğraf Seç
              </Button>
              
              {selectedImage && (
                <div className="mt-2">
                  <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                    <CheckCircle className="w-3 h-3" />
                    {selectedImage.originalName}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Image Info */}
          <Alert>
            <ImageIcon className="h-4 w-4" />
            <AlertDescription>
              Desteklenen formatlar: JPG, PNG, WebP. Önerilen boyut: 400x400 piksel.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Temel Bilgiler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                disabled={disabled}
                className={validationErrors.name ? 'border-red-500' : ''}
              />
              {validationErrors.name && (
                <p className="text-sm text-red-500">{validationErrors.name}</p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Unvan *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Örn: Genel Müdür"
                disabled={disabled}
                className={validationErrors.title ? 'border-red-500' : ''}
              />
              {validationErrors.title && (
                <p className="text-sm text-red-500">{validationErrors.title}</p>
              )}
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label htmlFor="position">Pozisyon *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleFieldChange('position', e.target.value)}
                placeholder="Örn: İnsan Kaynakları Müdürü"
                disabled={disabled}
                className={validationErrors.position ? 'border-red-500' : ''}
              />
              {validationErrors.position && (
                <p className="text-sm text-red-500">{validationErrors.position}</p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Tip</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleFieldChange('type', value as ExecutiveType)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tip seçin" />
                </SelectTrigger>
                <SelectContent>
                  {EXECUTIVE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            İletişim Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="ornek@sirket.com"
                disabled={disabled}
                className={validationErrors.email ? 'border-red-500' : ''}
              />
              {validationErrors.email && (
                <p className="text-sm text-red-500">{validationErrors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="+90 555 123 45 67"
                disabled={disabled}
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="linkedIn">LinkedIn Profili</Label>
              <Input
                id="linkedIn"
                value={formData.linkedIn}
                onChange={(e) => handleFieldChange('linkedIn', e.target.value)}
                placeholder="https://linkedin.com/in/kullanici-adi"
                disabled={disabled}
                className={validationErrors.linkedIn ? 'border-red-500' : ''}
              />
              {validationErrors.linkedIn && (
                <p className="text-sm text-red-500">{validationErrors.linkedIn}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Biography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Biyografi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="biography">Kısa Biyografi</Label>
            <Textarea
              id="biography"
              value={formData.biography}
              onChange={(e) => handleFieldChange('biography', e.target.value)}
              placeholder="Yöneticinin kısa biyografisini yazın..."
              rows={4}
              disabled={disabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Ayarlar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order */}
            <div className="space-y-2">
              <Label htmlFor="order">Sıralama</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => handleFieldChange('order', parseInt(e.target.value) || 0)}
                placeholder="0"
                disabled={disabled}
              />
            </div>

            {/* Active Status */}
            <div className="space-y-2">
              <Label htmlFor="isActive">Durum</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleFieldChange('isActive', checked)}
                  disabled={disabled}
                />
                <Label htmlFor="isActive" className="text-sm">
                  {formData.isActive ? 'Aktif' : 'Pasif'}
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={disabled || isValidating}
          className="flex items-center gap-2"
        >
          {isValidating ? (
            <>
              <AlertCircle className="w-4 h-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Yönetici Bilgilerini Kaydet
            </>
          )}
        </Button>
      </div>

      {/* Media Browser Modal */}
      <MediaBrowserSimple
        isOpen={showMediaBrowser}
        onClose={() => setShowMediaBrowser(false)}
        onSelect={handleImageSelect}
        multiple={false}
        allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
        categoryFilter={6} // Kurumsal category ID
        title="Profil Fotoğrafı Seç"
        className="z-50"
      />
    </div>
  );
}
