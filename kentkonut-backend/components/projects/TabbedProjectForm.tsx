"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Save,
  MapPin,
  Image as ImageIcon,
  Tag,
  FileText,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  X,
  Info
} from "lucide-react";
import { ProjectStatus, PROJECT_STATUS_LABELS } from "@/types";
import { GlobalMediaSelector, GlobalMediaFile } from "@/components/media/GlobalMediaSelector";
import { MediaGallerySelector } from "@/components/media/MediaGallerySelector";
import { NewProjectGalleryManager } from "@/components/projects/NewProjectGalleryManager";
import RichTextEditor from "@/components/ui/rich-text-editor-tiptap";
import { QuickAccessLinksManager } from "@/components/quick-access/QuickAccessLinksManager";

interface ProjectFormData {
  title: string;
  slug: string;
  summary: string;
  content: string;
  status: ProjectStatus;
  latitude: string;
  longitude: string;
  locationName: string;
  province: string;
  district: string;
  address: string;
  published: boolean;
  publishedAt: string;
  readingTime: number;
  tags: string;
  bannerUrl?: string;
  hasQuickAccess?: boolean; // Hızlı erişim aktif mi?
  yil?: string;
  blokDaireSayisi?: string;
}

interface TabbedProjectFormProps {
  initialData?: ProjectFormData;
  selectedMedia?: GlobalMediaFile | null;
  selectedGalleryItems?: GlobalMediaFile[];
  onSubmit: (data: ProjectFormData, media: GlobalMediaFile | null, galleryItems: GlobalMediaFile[]) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
  projectId?: number; // Mevcut proje ID'si (edit mode için)
}

interface TabValidation {
  basic: boolean;
  content: boolean;
  location: boolean;
  media: boolean;
}

export function TabbedProjectForm({
  initialData,
  selectedMedia: initialSelectedMedia,
  selectedGalleryItems: initialSelectedGalleryItems = [],
  onSubmit,
  submitLabel = "Kaydet",
  loading = false,
  projectId
}: TabbedProjectFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<ProjectFormData>(
    initialData || {
      title: "",
      slug: "",
      summary: "",
      content: "",
      status: ProjectStatus.ONGOING,
      latitude: "",
      longitude: "",
      locationName: "",
      province: "",
      district: "",
      address: "",
      published: false,
      publishedAt: "",
      readingTime: 3,
      tags: "",
      bannerUrl: "",
      hasQuickAccess: false, // Hızlı erişim aktif mi?
      yil: "",
      blokDaireSayisi: "",
    }
  );
  const [selectedMedia, setSelectedMedia] = useState<GlobalMediaFile | null>(initialSelectedMedia || null);
  const [selectedGalleryItems, setSelectedGalleryItems] = useState<GlobalMediaFile[]>(initialSelectedGalleryItems);
  const [selectedBannerMedia, setSelectedBannerMedia] = useState<GlobalMediaFile | null>(null);
  const [tabValidation, setTabValidation] = useState<TabValidation>({
    basic: false,
    content: false,
    location: false,
    media: false
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title
    if (field === "title") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const getMediaUrl = (url?: string) => {
    if (!url) return '';
    let normalizedUrl = url;
    if (normalizedUrl.startsWith('http')) return normalizedUrl;

    // Remove common prefixes
    normalizedUrl = normalizedUrl.replace(/^\/public\//, '/');
    normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/');

    // Ensure it starts with /
    if (!normalizedUrl.startsWith('/')) {
      normalizedUrl = '/' + normalizedUrl;
    }

    return normalizedUrl;
  };

  // Validate each tab
  useEffect(() => {
    const validation: TabValidation = {
      basic: !!(formData.title && formData.slug),
      content: !!formData.content,
      location: true, // Location is optional
      media: true // Media is optional
    };
    setTabValidation(validation);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    if (!tabValidation.basic || !tabValidation.content) {
      toast.error("Lütfen gerekli alanları doldurun");

      // Navigate to first invalid tab
      if (!tabValidation.basic) {
        setActiveTab("basic");
      } else if (!tabValidation.content) {
        setActiveTab("content");
      }
      return;
    }

    // Convert gallery items to the correct format
    const galleryItemsForSubmit = selectedGalleryItems.map((item: any) => ({
      id: item.id,
      mediaId: item.mediaId,
      title: item.title,
      description: item.description,
      parentId: item.parentId,
      order: item.order,
      isFolder: item.isFolder
    }));

    // Update form data with banner URL
    const formDataWithBanner = {
      ...formData,
      bannerUrl: selectedBannerMedia?.url || ''
    };

    await onSubmit(formDataWithBanner, selectedMedia, galleryItemsForSubmit);
  };

  const getTabIcon = (tabKey: keyof TabValidation, defaultIcon: any) => {
    if (tabValidation[tabKey]) {
      return CheckCircle;
    }
    return defaultIcon;
  };

  const getTabVariant = (tabKey: keyof TabValidation) => {
    if (!tabValidation[tabKey] && (tabKey === 'basic' || tabKey === 'content')) {
      return "destructive";
    }
    return tabValidation[tabKey] ? "default" : "secondary";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${formData.hasQuickAccess ? 'grid-cols-5' : 'grid-cols-4'} mb-6`}>
          <TabsTrigger value="basic" className="flex items-center gap-2">
            {getTabIcon('basic', FileText) === CheckCircle ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Temel Bilgiler</span>
            <span className="sm:hidden">Temel</span>
            {!tabValidation.basic && (
              <AlertCircle className="h-3 w-3 text-red-500" />
            )}
          </TabsTrigger>

          <TabsTrigger value="content" className="flex items-center gap-2">
            {getTabIcon('content', Tag) === CheckCircle ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Tag className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">İçerik</span>
            <span className="sm:hidden">İçerik</span>
            {!tabValidation.content && (
              <AlertCircle className="h-3 w-3 text-red-500" />
            )}
          </TabsTrigger>

          <TabsTrigger value="location" className="flex items-center gap-2">
            {getTabIcon('location', MapPin) === CheckCircle ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Konum</span>
            <span className="sm:hidden">Konum</span>
          </TabsTrigger>

          <TabsTrigger value="media" className="flex items-center gap-2">
            {getTabIcon('media', Settings) === CheckCircle ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Settings className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Medya & Ayarlar</span>
            <span className="sm:hidden">Ayarlar</span>
          </TabsTrigger>
          {formData.hasQuickAccess && (
            <TabsTrigger value="quickaccess" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Hızlı Erişim</span>
              <span className="sm:hidden">Erişim</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Temel Bilgiler
                {!tabValidation.basic && (
                  <Badge variant="destructive" className="ml-2">
                    Gerekli alanlar eksik
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">
                  Başlık *
                  {!formData.title && (
                    <span className="text-red-500 ml-1">Gerekli</span>
                  )}
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Proje başlığı"
                  className={!formData.title ? "border-red-300" : ""}
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">
                  Slug *
                  {!formData.slug && (
                    <span className="text-red-500 ml-1">Gerekli</span>
                  )}
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  placeholder="proje-slug"
                  className={!formData.slug ? "border-red-300" : ""}
                  required
                />
              </div>

              <div>
                <Label htmlFor="summary">Özet</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => handleInputChange("summary", e.target.value)}
                  placeholder="Proje özeti"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="status">Proje Durumu</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value as ProjectStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProjectStatus.ONGOING}>
                      {PROJECT_STATUS_LABELS[ProjectStatus.ONGOING]}
                    </SelectItem>
                    <SelectItem value={ProjectStatus.COMPLETED}>
                      {PROJECT_STATUS_LABELS[ProjectStatus.COMPLETED]}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Yıl ve Blok/Daire Sayısı Alanları */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="yil">Yıl</Label>
                  <Input
                    id="yil"
                    value={formData.yil || ''}
                    onChange={(e) => handleInputChange("yil", e.target.value)}
                    placeholder="Örn: 2023 veya 2022-2024"
                  />
                </div>
                <div>
                  <Label htmlFor="blokDaireSayisi">Blok/Daire Sayısı</Label>
                  <Input
                    id="blokDaireSayisi"
                    value={formData.blokDaireSayisi || ''}
                    onChange={(e) => handleInputChange("blokDaireSayisi", e.target.value)}
                    placeholder="Örn: 5 Blok, 150 Daire"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                İçerik ve Etiketler
                {!tabValidation.content && (
                  <Badge variant="destructive" className="ml-2">
                    İçerik gerekli
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <RichTextEditor
                  content={formData.content}
                  onChange={(value: string) => handleInputChange("content", value)}
                  placeholder="Proje içeriğini yazın... Biçimlendirme araçlarını kullanarak metninizi zenginleştirebilir ve resim ekleyebilirsiniz."
                />
                {!formData.content && (
                  <p className="text-red-500 text-sm mt-1">İçerik gerekli</p>
                )}
              </div>

              <div>
                <Label htmlFor="tags">Etiketler</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange("tags", e.target.value)}
                  placeholder="etiket1, etiket2, etiket3"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Etiketleri virgülle ayırın
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Konum Bilgileri
                <Badge variant="outline" className="ml-2">
                  Opsiyonel
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="province">İl</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) => handleInputChange("province", e.target.value)}
                    placeholder="Örn: İstanbul"
                  />
                </div>
                <div>
                  <Label htmlFor="district">İlçe</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                    placeholder="Örn: Kadıköy"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Adres</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Detaylı adres bilgisi"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="locationName">Konum Adı (Opsiyonel)</Label>
                <Input
                  id="locationName"
                  value={formData.locationName}
                  onChange={(e) => handleInputChange("locationName", e.target.value)}
                  placeholder="Örn: İstanbul, Türkiye"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Enlem (Opsiyonel)</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange("latitude", e.target.value)}
                    placeholder="41.0082"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Boylam (Opsiyonel)</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange("longitude", e.target.value)}
                    placeholder="28.9784"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media & Settings Tab */}
        <TabsContent value="media" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Ana Görsel
                  <Badge variant="outline" className="ml-2">
                    Opsiyonel
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Selection/Upload Area */}
                <div className="space-y-3">
                  <GlobalMediaSelector
                    onSelect={setSelectedMedia}
                    defaultCategory="project-images"
                    restrictToCategory={true}
                    customFolder="media/projeler"
                    trigger={
                      <Button variant="outline" className="w-full h-12 flex items-center gap-2">
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

                  {!selectedMedia && (
                    <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        Proje için ana görsel seçin
                      </p>
                      <p className="text-xs text-gray-500">
                        Mevcut medya galerisinden seçin veya yeni görsel yükleyin
                      </p>
                    </div>
                  )}
                </div>

                {/* Selected Image Preview */}
                {selectedMedia && (
                  <div className="space-y-3">
                    <div className="relative group">
                      <img
                        src={getMediaUrl(selectedMedia.url, 'media/projeler')}
                        alt={selectedMedia.alt || selectedMedia.filename}
                        className="w-full h-48 object-cover rounded-lg border shadow-sm"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          onClick={() => setSelectedMedia(null)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Kaldır
                        </Button>
                      </div>
                    </div>

                    {/* Image Information */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1 text-sm">
                          <p className="font-medium text-blue-900">
                            {selectedMedia.filename}
                          </p>
                          {selectedMedia.alt && (
                            <p className="text-blue-700">
                              <span className="font-medium">Alt Metin:</span> {selectedMedia.alt}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-blue-600">
                            <span>Dosya: {selectedMedia.filename}</span>
                            {selectedMedia.url && (
                              <span>URL: {selectedMedia.url.split('/').pop()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Publication Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Yayın Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => handleInputChange("published", checked)}
                  />
                  <Label htmlFor="published">Yayınla</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasQuickAccess"
                    checked={formData.hasQuickAccess || false}
                    onCheckedChange={(checked) => handleInputChange("hasQuickAccess", checked)}
                  />
                  <Label htmlFor="hasQuickAccess">Hızlı Erişim Aktif</Label>
                  <span className="text-sm text-gray-500">
                    (Aktif edildiğinde proje için hızlı erişim linkleri yönetilebilir)
                  </span>
                </div>

                {formData.published && (
                  <div>
                    <Label htmlFor="publishedAt">Yayın Tarihi</Label>
                    <Input
                      id="publishedAt"
                      type="datetime-local"
                      value={formData.publishedAt}
                      onChange={(e) => handleInputChange("publishedAt", e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="readingTime" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Okuma Süresi (dakika)
                  </Label>
                  <Input
                    id="readingTime"
                    type="number"
                    min="1"
                    value={formData.readingTime}
                    onChange={(e) => handleInputChange("readingTime", parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Banner Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Banner Resmi
                  <Badge variant="outline" className="ml-2">
                    Opsiyonel
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Banner Image Selection/Upload Area */}
                <div className="space-y-3">
                  <GlobalMediaSelector
                    onSelect={setSelectedBannerMedia}
                    defaultCategory="project-banners"
                    restrictToCategory={true}
                    customFolder="media/projeler/banners"
                    placeholder="Banner resmi seçin..."
                  />
                  
                  {selectedBannerMedia && (
                    <div className="relative">
                      <img
                        src={selectedBannerMedia.url}
                        alt={selectedBannerMedia.filename}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setSelectedBannerMedia(null);
                          handleInputChange('bannerUrl', '');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {selectedBannerMedia.filename}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  <Info className="h-3 w-3 inline mr-1" />
                  Banner resmi proje sayfasının üst kısmında görüntülenir
                </div>
              </CardContent>
            </Card>
          </div>

        </TabsContent>

        {/* Project Gallery Management - TAMAMEN FORM DIŞINDA */}
        {console.log('[TABBED_FORM] projectId:', projectId, 'typeof:', typeof projectId)}
        {projectId && (
          <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Proje Galerisi Yönetimi</h3>
                <p className="text-sm text-gray-600">
                  Galeri yönetimi için ayrı sayfaya yönlendiriliyorsunuz
                </p>
              </div>
              <Button
                onClick={() => {
                  console.log('[GALLERY_REDIRECT] Redirecting to gallery management');
                  window.open(`/dashboard/projects/${projectId}/gallery`, '_blank');
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Galeri Yönetimi
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              <p>• Hiyerarşik galeri yapısı oluşturun</p>
              <p>• Medyaları organize edin</p>
              <p>• Alt galeriler ekleyin</p>
            </div>
          </div>
        )}

        {!projectId && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Proje Galerisi Yönetimi
                <Badge variant="outline" className="ml-2">
                  Hiyerarşik Galeri
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Proje için hiyerarşik galeri yapısı oluşturun ve medyaları organize edin
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <p>Galeri yönetimi için önce projeyi kaydedin.</p>
                <p className="text-sm mt-2">Proje kaydedildikten sonra galeri yönetimi aktif olacaktır.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Access Tab */}
        {formData.hasQuickAccess && projectId && (
          <TabsContent value="quickaccess" className="space-y-6">
            <QuickAccessLinksManager
              moduleType="project"
              moduleId={projectId}
            />
          </TabsContent>
        )}

        {formData.hasQuickAccess && !projectId && (
          <TabsContent value="quickaccess" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Hızlı Erişim Linkleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Hızlı erişim linkleri yönetimi için önce projeyi kaydedin.
                  </p>
                  <p className="text-sm text-gray-500">
                    Proje kaydedildikten sonra bu sekme aktif olacaktır.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Submit Button */}
      <div className="flex justify-end pt-6 border-t">
        <Button type="submit" disabled={loading} size="lg">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              İşleniyor...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
