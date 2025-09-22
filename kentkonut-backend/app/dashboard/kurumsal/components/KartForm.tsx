'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Save,
  X,
  Eye,
  Palette,
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { GlobalMediaSelector, GlobalMediaFile } from '@/components/media/GlobalMediaSelector';
import { 
  CorporateCard, 
  CreateCorporateCardData, 
  corporateCardSchema,
  CARD_SIZE_OPTIONS,
  IMAGE_POSITION_OPTIONS,
  BORDER_RADIUS_OPTIONS,
  PRESET_COLOR_THEMES
} from '@/types/corporate-cards';

interface KartFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCorporateCardData) => Promise<void>;
  card?: CorporateCard | null;
  isLoading?: boolean;
}

export default function KartForm({
  isOpen,
  onClose,
  onSubmit,
  card,
  isLoading = false
}: KartFormProps) {
  const [activeTab, setActiveTab] = useState('genel');
  const [previewCard, setPreviewCard] = useState<Partial<CreateCorporateCardData> | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<GlobalMediaFile | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateCorporateCardData>({
    resolver: zodResolver(corporateCardSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      accentColor: '#007bff',
      targetUrl: '',
      openInNewTab: false,
      imagePosition: 'center',
      cardSize: 'medium',
      borderRadius: 'medium',
      isActive: true
    }
  });

  // Watch specific form values for preview
  const title = watch('title');
  const subtitle = watch('subtitle');
  const description = watch('description');
  const imageUrl = watch('imageUrl');
  const backgroundColor = watch('backgroundColor');
  const textColor = watch('textColor');
  const accentColor = watch('accentColor');
  const targetUrl = watch('targetUrl');
  const cardSize = watch('cardSize');
  const borderRadius = watch('borderRadius');
  const imagePosition = watch('imagePosition');

  // Memoize preview card data to prevent unnecessary re-renders
  const previewCardData = useMemo(() => ({
    title,
    subtitle,
    description,
    imageUrl,
    backgroundColor,
    textColor,
    accentColor,
    targetUrl,
    cardSize,
    borderRadius,
    imagePosition
  }), [title, subtitle, description, imageUrl, backgroundColor, textColor, accentColor, targetUrl, cardSize, borderRadius, imagePosition]);

  // Update preview when form values change
  useEffect(() => {
    setPreviewCard(previewCardData);
  }, [previewCardData]);

  // Reset form when card changes
  useEffect(() => {
    if (card) {
      console.log('🔄 Resetting form with card data:', card);
      // Fix invalid enum values from database
      const fixBorderRadius = (value: string) => {
        const validValues = ['none', 'small', 'medium', 'large', 'full'];
        if (validValues.includes(value)) return value;

        // Map old values to new valid values
        switch (value) {
          case 'rounded': return 'medium';
          case 'sharp': return 'none';
          case 'round': return 'large';
          default: return 'medium';
        }
      };

      const fixImagePosition = (value: string) => {
        const validValues = ['center', 'top', 'bottom'];
        return validValues.includes(value) ? value : 'center';
      };

      const fixCardSize = (value: string) => {
        const validValues = ['small', 'medium', 'large'];
        return validValues.includes(value) ? value : 'medium';
      };

      reset({
        title: card.title,
        subtitle: card.subtitle || '',
        description: card.description || '',
        imageUrl: (card.imageUrl && card.imageUrl !== 'null') ? card.imageUrl : '',
        backgroundColor: card.backgroundColor,
        textColor: card.textColor,
        accentColor: card.accentColor,
        targetUrl: card.targetUrl || '',
        openInNewTab: card.openInNewTab,
        imagePosition: fixImagePosition(card.imagePosition),
        cardSize: fixCardSize(card.cardSize),
        borderRadius: fixBorderRadius(card.borderRadius),
        isActive: card.isActive
      });
    } else {
      console.log('🆕 Resetting form for new card');
      reset({
        title: '',
        subtitle: '',
        description: '',
        imageUrl: '',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        accentColor: '#007bff',
        targetUrl: '',
        openInNewTab: false,
        imagePosition: 'center',
        cardSize: 'medium',
        borderRadius: 'medium',
        isActive: true
      });
      setSelectedMedia(null); // Clear selected media for new cards
    }
  }, [card, reset]);

  // Handle media selection
  const handleMediaSelect = (media: GlobalMediaFile) => {
    console.log('📸 Media selected:', media);
    setSelectedMedia(media);
    setValue('imageUrl', media.url, { shouldDirty: true, shouldTouch: true });
    console.log('📝 Form imageUrl updated to:', media.url);
    console.log('📋 Current form values after update:', watch());
    toast.success('Görsel seçildi');
  };

  // Update selected media when card changes (only once per card)
  useEffect(() => {
    if (card?.imageUrl && card.imageUrl !== 'null' && card.imageUrl !== null) {
      console.log('🖼️ Loading existing image for card:', card.id, card.imageUrl);

      // Create a mock media object for existing images
      setSelectedMedia({
        id: 0,
        url: card.imageUrl,
        originalName: 'Mevcut Görsel',
        fileName: 'existing-image',
        fileSize: 0,
        mimeType: 'image/jpeg',
        categoryId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Also set the form value
      setValue('imageUrl', card.imageUrl);
    } else if (card) {
      // Clear media when card has no image or null image
      console.log('🖼️ No image for card:', card.id);
      setSelectedMedia(null);
      setValue('imageUrl', '');
    } else if (!card) {
      // Clear media when no card (new card mode)
      setSelectedMedia(null);
    }
  }, [card?.id, card?.imageUrl, setValue]); // Remove selectedMedia dependency

  const handleFormSubmit = async (data: CreateCorporateCardData) => {
    try {
      console.log('🚀 Form submission started:', {
        isEdit: !!card,
        cardId: card?.id,
        data,
        formErrors: errors
      });

      // Debug: Check current form values vs submitted data
      const currentFormValues = watch();
      console.log('📋 Current form values:', currentFormValues);
      console.log('📤 Submitted data:', data);
      console.log('🖼️ Selected media:', selectedMedia);
      console.log('🔄 ImageUrl comparison:', {
        formValue: currentFormValues.imageUrl,
        submittedValue: data.imageUrl,
        selectedMediaUrl: selectedMedia?.url
      });

      // Check for form validation errors
      if (Object.keys(errors).length > 0) {
        console.error('❌ Form validation errors:', errors);

        // Show error details
        Object.entries(errors).forEach(([field, error]) => {
          console.error(`  - ${field}: ${error.message}`);
        });

        toast.error('Form doğrulama hataları var. Lütfen alanları kontrol edin.');
        return;
      }

      // Sanitize data before submission
      const sanitizedData = {
        ...data,
        borderRadius: ['none', 'small', 'medium', 'large', 'full'].includes(data.borderRadius)
          ? data.borderRadius
          : 'medium',
        imagePosition: ['center', 'top', 'bottom'].includes(data.imagePosition)
          ? data.imagePosition
          : 'center',
        cardSize: ['small', 'medium', 'large'].includes(data.cardSize)
          ? data.cardSize
          : 'medium'
      };

      console.log('📤 Original data:', data);
      console.log('📤 Sanitized data:', sanitizedData);

      console.log('📤 Submitting sanitized data:', sanitizedData);
      await onSubmit(sanitizedData);

      console.log('✅ Form submission successful');
      toast.success(card ? 'Kart başarıyla güncellendi' : 'Kart başarıyla oluşturuldu');

      handleClose();
      reset();
    } catch (error) {
      console.error('❌ Form submission error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Kart kaydedilirken bir hata oluştu'
      );
    }
  };

  const applyColorTheme = (theme: typeof PRESET_COLOR_THEMES[0]) => {
    setValue('backgroundColor', theme.backgroundColor);
    setValue('textColor', theme.textColor);
    setValue('accentColor', theme.accentColor);
    toast.success(`${theme.name} uygulandı`);
  };

  const handleClose = () => {
    setSelectedMedia(null); // Clear selected media when closing
    onClose();
  };



  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {card ? 'Kartı Düzenle' : 'Yeni Kart Oluştur'}
          </DialogTitle>
          <DialogDescription>
            Kurumsal sayfanızda görünecek kartı yapılandırın
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="genel">Genel</TabsTrigger>
              <TabsTrigger value="tasarim">Tasarım</TabsTrigger>
              <TabsTrigger value="baglanti">Bağlantı</TabsTrigger>
              <TabsTrigger value="onizleme">Önizleme</TabsTrigger>
            </TabsList>

            {/* Genel Tab */}
            <TabsContent value="genel" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Başlık *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="Kart başlığı"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="subtitle">Alt Başlık</Label>
                  <Input
                    id="subtitle"
                    {...register('subtitle')}
                    placeholder="Kart alt başlığı"
                  />
                  {errors.subtitle && (
                    <p className="text-sm text-red-600 mt-1">{errors.subtitle.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Kart açıklaması"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <Label>Kart Görseli</Label>
                <div className="space-y-3">
                  {/* Selected Image Preview */}
                  {selectedMedia && (
                    <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                        <img
                          src={selectedMedia.url}
                          alt={selectedMedia.originalName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log('❌ Image load error:', selectedMedia.url);
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                          onLoad={() => {
                            console.log('✅ Image loaded successfully:', selectedMedia.url);
                          }}
                        />
                        <div className="hidden w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {selectedMedia.originalName}
                        </p>
                        <p className="text-xs text-gray-500 break-all">
                          {selectedMedia.url}
                        </p>
                        {selectedMedia.url && !selectedMedia.url.startsWith('http') && !selectedMedia.url.startsWith('/') && (
                          <p className="text-xs text-amber-600 mt-1">
                            ⚠️ Görsel bulunamıyor - URL kontrol edin
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log('🗑️ Removing image...');
                          console.log('🗑️ Before removal - selectedMedia:', selectedMedia);
                          console.log('🗑️ Before removal - form imageUrl:', watch('imageUrl'));

                          setSelectedMedia(null);
                          setValue('imageUrl', '', { shouldDirty: true, shouldTouch: true });

                          console.log('🗑️ After removal - form imageUrl:', watch('imageUrl'));
                          console.log('🗑️ After removal - form values:', watch());

                          toast.success('Görsel kaldırıldı');
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {/* Media Selector */}
                  <GlobalMediaSelector
                    onSelect={handleMediaSelect}
                    selectedMedia={selectedMedia}
                    acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']}
                    defaultCategory="corporate-images"
                    customFolder="media/kurumsal/kartlar"
                    restrictToCategory={false}
                    width={800}
                    height={600}
                    buttonText={selectedMedia ? "Görseli Değiştir" : "Görsel Seç"}
                    title="Kart Görseli Seç"
                    description="Kart için görsel seçin veya yeni görsel yükleyin"
                    showPreview={true}
                    trigger={
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 flex items-center gap-2"
                      >
                        {selectedMedia ? (
                          <>
                            <ImageIcon className="h-4 w-4" />
                            Görseli Değiştir
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Görsel Seç veya Yükle
                          </>
                        )}
                      </Button>
                    }
                  />

                  {/* Manual URL Input (Optional) */}
                  <div className="pt-2 border-t">
                    <Label htmlFor="imageUrl" className="text-xs text-gray-600">
                      Veya manuel URL girin
                    </Label>
                    <Input
                      id="imageUrl"
                      {...register('imageUrl', {
                        onChange: (e) => {
                          // Clear selected media if URL is manually entered
                          if (e.target.value && e.target.value !== selectedMedia?.url) {
                            setSelectedMedia(null);
                          }
                        }
                      })}
                      placeholder="https://example.com/image.jpg"
                      className="mt-1"
                    />
                  </div>
                </div>
                {errors.imageUrl && (
                  <p className="text-sm text-red-600 mt-1">{errors.imageUrl.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>
            </TabsContent>

            {/* Tasarım Tab */}
            <TabsContent value="tasarim" className="space-y-4">
              {/* Renk Temaları */}
              <div>
                <Label>Hazır Temalar</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {PRESET_COLOR_THEMES.map((theme, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      className="h-12 justify-start"
                      onClick={() => applyColorTheme(theme)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: theme.backgroundColor }}
                          />
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: theme.accentColor }}
                          />
                        </div>
                        <span className="text-sm">{theme.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Renk Ayarları */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="backgroundColor">Arka Plan Rengi</Label>
                  <div className="flex gap-2">
                    <Input
                      id="backgroundColor"
                      type="color"
                      {...register('backgroundColor')}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      {...register('backgroundColor')}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="textColor">Metin Rengi</Label>
                  <div className="flex gap-2">
                    <Input
                      id="textColor"
                      type="color"
                      {...register('textColor')}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      {...register('textColor')}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Vurgu Rengi</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      {...register('accentColor')}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      {...register('accentColor')}
                      placeholder="#007bff"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Boyut ve Pozisyon */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Kart Boyutu</Label>
                  <Select
                    value={watch('cardSize')}
                    onValueChange={(value) => setValue('cardSize', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CARD_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size === 'small' ? 'Küçük' : size === 'medium' ? 'Orta' : 'Büyük'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Görsel Pozisyonu</Label>
                  <Select
                    value={watch('imagePosition')}
                    onValueChange={(value) => setValue('imagePosition', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {IMAGE_POSITION_OPTIONS.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos === 'center' ? 'Merkez' : pos === 'top' ? 'Üst' : 'Alt'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Köşe Yuvarlaklığı</Label>
                  <Select
                    value={watch('borderRadius')}
                    onValueChange={(value) => setValue('borderRadius', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BORDER_RADIUS_OPTIONS.map((radius) => (
                        <SelectItem key={radius} value={radius}>
                          {radius === 'none' ? 'Yok' : 
                           radius === 'small' ? 'Küçük' : 
                           radius === 'medium' ? 'Orta' : 
                           radius === 'large' ? 'Büyük' : 'Tam'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Bağlantı Tab */}
            <TabsContent value="baglanti" className="space-y-4">
              <div>
                <Label htmlFor="targetUrl">Hedef URL</Label>
                <Input
                  id="targetUrl"
                  {...register('targetUrl')}
                  placeholder="https://example.com/sayfa"
                />
                {errors.targetUrl && (
                  <p className="text-sm text-red-600 mt-1">{errors.targetUrl.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="openInNewTab"
                  checked={watch('openInNewTab')}
                  onCheckedChange={(checked) => setValue('openInNewTab', checked)}
                />
                <Label htmlFor="openInNewTab">Yeni sekmede aç</Label>
              </div>
            </TabsContent>

            {/* Önizleme Tab */}
            <TabsContent value="onizleme" className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Kart Önizlemesi</h3>
                {previewCard && (
                  <div className="max-w-sm mx-auto">
                    <Card 
                      className="transition-all duration-200 hover:shadow-lg"
                      style={{ 
                        backgroundColor: previewCard.backgroundColor,
                        color: previewCard.textColor 
                      }}
                    >
                      <CardContent className="p-6">
                        {previewCard.imageUrl && (
                          <div className="mb-4">
                            <img 
                              src={previewCard.imageUrl} 
                              alt={previewCard.title}
                              className="w-16 h-16 rounded-full mx-auto object-cover"
                            />
                          </div>
                        )}
                        <h3 className="text-lg font-semibold mb-2">
                          {previewCard.title || 'Kart Başlığı'}
                        </h3>
                        {previewCard.subtitle && (
                          <p className="text-sm opacity-80 mb-2">
                            {previewCard.subtitle}
                          </p>
                        )}
                        {previewCard.description && (
                          <p className="text-sm opacity-70">
                            {previewCard.description}
                          </p>
                        )}
                        {previewCard.targetUrl && (
                          <div className="mt-4">
                            <Badge 
                              style={{ backgroundColor: previewCard.accentColor }}
                              className="text-white"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Bağlantı
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="w-4 h-4 mr-2" />
              İptal
            </Button>


            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
            >
              {(isSubmitting || isLoading) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              <Save className="w-4 h-4 mr-2" />
              {card ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
