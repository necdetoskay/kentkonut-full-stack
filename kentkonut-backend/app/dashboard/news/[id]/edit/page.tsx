"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"
import { UnifiedTinyMCEEditor } from "@/components/tinymce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon,
  X,
  Plus,
  Upload,
  Video,
  FileText,
  Eye,
  Trash2
} from "lucide-react";
import { LoadingLink } from "@/components/ui/loading-link";
import { toast } from "sonner";
import { GlobalMediaSelector, MediaFile } from "@/components/media/GlobalMediaSelector";
import { QuickAccessLinksManager } from "@/components/quick-access/QuickAccessLinksManager";

interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  active: boolean;
}

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  originalName?: string;
  alt?: string;
  type?: 'IMAGE' | 'VIDEO' | 'PDF' | 'WORD' | 'EMBED';
  embedUrl?: string;
  mimeType?: string;
}

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  published: boolean;
  publishedAt?: string;
  readingTime: number;
  categoryId: number;
  mediaId?: string;
  media?: MediaItem;
  hasQuickAccess?: boolean; // Hızlı erişim aktif mi?
  tags: Array<{
    tag: {
      id: number;
      name: string;
    };
  }>;
  galleryItems: Array<{
    id: number;
    mediaId: string;
    order: number;
    media: MediaItem;
  }>;
}

interface GalleryMediaItem {
  id: string;
  url: string;
  filename: string;
  alt?: string;
  type: 'IMAGE' | 'VIDEO' | 'PDF' | 'WORD' | 'EMBED';
  embedUrl?: string;
  mimeType?: string;
}

const getMediaUrl = (url?: string) => {
  if (!url) return '';
  let normalizedUrl = url;
  if (normalizedUrl.startsWith('http')) return normalizedUrl;
  
  // Remove /public/ prefix if exists
  normalizedUrl = normalizedUrl.replace(/^\/public\//, '/');
  
  // Handle different folder structures based on URL path
  if (normalizedUrl.includes('/banners/')) {
    // Banner images
    normalizedUrl = normalizedUrl.replace(/^\/public\/banners\//, '/banners/');
    normalizedUrl = normalizedUrl.replace(/^\/uploads\/banners\//, '/banners/');
    normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/banners/');
    if (!normalizedUrl.startsWith('/banners/')) {
      normalizedUrl = '/banners/' + normalizedUrl.replace(/^\//, '');
    }
  } else {
    // Default to haberler for other content
    normalizedUrl = normalizedUrl.replace(/^\/public\/haberler\//, '/haberler/');
    normalizedUrl = normalizedUrl.replace(/^\/uploads\/haberler\//, '/haberler/');
    normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/haberler/');
    if (!normalizedUrl.startsWith('/haberler/')) {
      normalizedUrl = '/haberler/' + normalizedUrl.replace(/^\//, '');
    }
  }
  
  return normalizedUrl;
};

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const newsId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [news, setNews] = useState<NewsItem | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    categoryId: "",
    published: false,
    readingTime: 3,
    mediaId: null as string | null,
    tags: [] as string[],
    galleryItems: [] as string[],
    hasQuickAccess: false // Hızlı erişim aktif mi?
  });

  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [newTag, setNewTag] = useState("");
  const [galleryMedias, setGalleryMedias] = useState<GalleryMediaItem[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");
  const [embedTitle, setEmbedTitle] = useState("");
  const [previewMedia, setPreviewMedia] = useState<any | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch news data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsResponse, categoriesResponse] = await Promise.all([
          fetch(`/api/news/${newsId}`),
          fetch("/api/news-categories")
        ]);

        if (newsResponse.ok) {
          const newsData = await newsResponse.json();
          setNews(newsData);
          
          // Populate form with existing data
          setFormData({
            title: newsData.title,
            slug: newsData.slug,
            summary: newsData.summary || "",
            content: newsData.content,
            categoryId: newsData.categoryId.toString(),
            published: newsData.published,
            readingTime: newsData.readingTime,
            mediaId: newsData.mediaId,
            tags: newsData.tags.map((t: any) => t.tag.name),
            galleryItems: newsData.galleryItems.map((g: any) => g.mediaId),
            hasQuickAccess: newsData.hasQuickAccess || false
          });

          // Mevcut galeri medyalarını state'e al
          console.log("🔍 [GALLERY_DEBUG] Raw newsData.galleryItems:", newsData.galleryItems);
          
          if (newsData.galleryItems && newsData.galleryItems.length > 0) {
            const galleryMediaItems = newsData.galleryItems.map((item: any) => {
              console.log("🔍 [GALLERY_DEBUG] Processing gallery item:", item);
              const mediaId = item.media?.id || item.mediaId;
              
              // Media URL mapping düzeltmesi
              let mediaUrl = item.media?.url || '';
              if (mediaUrl && !mediaUrl.startsWith('http')) {
                // Sadece /haberler/ ile başlat, asla /public/ ekleme!
                if (!mediaUrl.startsWith('/haberler/')) {
                  mediaUrl = '/haberler/' + mediaUrl.replace(/^\/+/, '');
                }
              }
              
              const galleryItem = {
                id: String(mediaId), // String'e dönüştür
                url: mediaUrl,
                filename: item.media?.filename || item.media?.originalName || 'Unknown',
                alt: item.media?.alt,
                type: item.media?.type || 'IMAGE',
                embedUrl: item.media?.embedUrl,
                mimeType: item.media?.mimeType
              };
              console.log("🔍 [GALLERY_DEBUG] Mapped gallery item:", galleryItem);
              return galleryItem;
            });
            console.log("🔍 [GALLERY_DEBUG] Final galleryMediaItems:", galleryMediaItems);
            setGalleryMedias(galleryMediaItems);
          } else {
            console.log("🔍 [GALLERY_DEBUG] No gallery items found");
            setGalleryMedias([]);
          }

          if (newsData.media) {
            setSelectedMedia(newsData.media);
          }
        }

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.filter((cat: NewsCategory) => cat.active));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Veri yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    if (newsId) {
      fetchData();
    }
  }, [newsId]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Galeri medya yükleme fonksiyonu
  const handleMediaUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    
    setUploadingMedia(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('categoryId', '1'); // Haberler kategorisi
        formData.append('customFolder', 'haberler');
        
        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const result = await response.json();
          const newMedia: GalleryMediaItem = {
            id: result.data.id,
            url: result.data.url,
            filename: result.data.filename,
            alt: result.data.alt,
            type: result.data.type || 'IMAGE',
            embedUrl: result.data.embedUrl,
            mimeType: result.data.mimeType
          };
          
          setGalleryMedias(prev => [...prev, newMedia]);
        } else {
          toast.error(`${file.name} yüklenirken hata oluştu`);
        }
      }
      toast.success('Medya dosyaları başarıyla yüklendi');
    } catch (error) {
      console.error('Media upload error:', error);
      toast.error('Medya yüklenirken hata oluştu');
    } finally {
      setUploadingMedia(false);
    }
  };

  // Embed video ekleme fonksiyonu
  const handleAddEmbed = async () => {
    if (!embedUrl.trim()) {
      toast.error('Video URL\'si gereklidir');
      return;
    }
    
    setUploadingMedia(true);
    
    try {
      // API'ya embed video gönder
      const formData = new FormData();
      formData.append('embedUrl', embedUrl);
      formData.append('categoryId', '1');
      formData.append('alt', embedTitle || 'Embed Video');
      
      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        const newMedia: GalleryMediaItem = {
          id: result.data.id,
          url: embedUrl,
          filename: embedTitle || 'Embed Video',
          alt: embedTitle || 'Embed Video',
          type: 'EMBED',
          embedUrl: embedUrl,
          mimeType: 'video/embed'
        };
        
        setGalleryMedias(prev => [...prev, newMedia]);
        setEmbedUrl('');
        setEmbedTitle('');
        toast.success('Video embed başarıyla eklendi');
      } else {
        toast.error('Video embed eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Embed add error:', error);
      toast.error('Video embed eklenirken hata oluştu');
    } finally {
      setUploadingMedia(false);
    }
  };

  // Galeri medyasını silme fonksiyonu
  const handleRemoveGalleryMedia = (mediaId: string) => {
    setGalleryMedias(prev => prev.filter(media => media.id !== mediaId));
    toast.success('Medya galeriden kaldırıldı');
  };

  // Medya tipine göre ikon döndürme
  const getMediaIcon = (type: string, mimeType?: string) => {
    if (type === 'EMBED' || mimeType?.startsWith('video/')) {
      return <Video className="h-4 w-4" />;
    } else if (type === 'PDF' || mimeType === 'application/pdf') {
      return <FileText className="h-4 w-4 text-red-600" />;
    } else if (type === 'WORD' || mimeType?.includes('word')) {
      return <FileText className="h-4 w-4 text-blue-600" />;
    } else {
      return <ImageIcon className="h-4 w-4" />;
    }
  };

  // YouTube thumbnail URL oluşturma
  const getYouTubeThumbnail = (embedUrl: string) => {
    if (!embedUrl) return null;
    const match = embedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    const videoId = match ? match[1] : null;
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.categoryId) {
      toast.error("Lütfen gerekli alanları doldurun");
      return;
    }

    setSaving(true);

    try {
      // Galeri medya ID'lerini hazırla
      const galleryMediaIds = galleryMedias.map(media => media.id);
      
      const response = await fetch(`/api/news/${newsId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          categoryId: parseInt(formData.categoryId),
          publishedAt: formData.published ? (news?.publishedAt || new Date().toISOString()) : undefined,
          galleryItems: galleryMediaIds
        }),
      });

      if (response.ok) {
        toast.success("Haber başarıyla güncellendi");
        router.push("/dashboard/news");
      } else {
        const error = await response.text();
        toast.error("Haber güncellenirken hata oluştu: " + error);
      }
    } catch (error) {
      console.error("Error updating news:", error);
      toast.error("Haber güncellenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = (media: any) => {
    setPreviewMedia(media);
    setPreviewOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Haber yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Haber bulunamadı</p>
          <LoadingLink href="/dashboard/news">
            <Button className="mt-4">Haberlere Dön</Button>
          </LoadingLink>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <LoadingLink href="/dashboard/news">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </LoadingLink>
        <div>
          <h1 className="text-3xl font-bold">Haber Düzenle</h1>
          <p className="text-muted-foreground mt-1">"{news.title}" haberini düzenleyin</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Temel Bilgiler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Başlık *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Haber başlığını girin"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    placeholder="url-slug"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="summary">Özet</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => handleInputChange("summary", e.target.value)}
                    placeholder="Haber özeti (isteğe bağlı)"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="content">İçerik *</Label>
                  <UnifiedTinyMCEEditor
                    value={formData.content}
                    onChange={(value) => handleInputChange("content", value)}
                    placeholder="Haber içeriğini yazın"
                    height={400}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Etiketler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Etiket ekle"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Galeri/Medya */}
            <Card>
              <CardHeader>
                <CardTitle>Galeri ve Medya</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Habere resim, video, PDF ve Word dosyaları ekleyebilirsiniz
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mevcut Galeri Önizlemesi */}
                {galleryMedias.length > 0 && (
                  <div className="space-y-2">
                    <Label>Mevcut Medyalar ({galleryMedias.length})</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {galleryMedias.map((media) => {
                        console.log("🖼️ [ADMIN_DEBUG] Rendering media:", media);
                        
                        // Thumbnail URL belirleme
                        let thumbnailUrl = null;
                        if (media.type === 'IMAGE') {
                          thumbnailUrl = getMediaUrl(media.url);
                        } else if (media.type === 'EMBED' && media.embedUrl) {
                          thumbnailUrl = getYouTubeThumbnail(media.embedUrl);
                        }
                        
                        return (
                          <div key={media.id} className="relative group border rounded-lg p-2">
                            {thumbnailUrl ? (
                              <div className="relative w-full h-20 rounded overflow-hidden">
                                <img
                                  src={thumbnailUrl}
                                  alt={media.alt || media.filename}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Thumbnail yüklenemezse fallback göster
                                    const target = e.target as HTMLImageElement;
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `
                                        <div class="w-full h-20 bg-muted rounded flex items-center justify-center">
                                          ${media.type === 'EMBED' ? 
                                            '<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>' : 
                                            '<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5 3v18l12-9L5 3z"/></svg>'
                                          }
                                        </div>
                                      `;
                                    }
                                  }}
                                />
                                {/* YouTube play button overlay */}
                                {media.type === 'EMBED' && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-red-600 bg-opacity-80 rounded-full w-8 h-8 flex items-center justify-center">
                                      <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="w-full h-20 bg-muted rounded flex items-center justify-center">
                                {getMediaIcon(media.type, media.mimeType)}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                              {media.type === 'EMBED' && media.embedUrl ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => window.open(media.embedUrl, '_blank')}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handlePreview(media)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRemoveGalleryMedia(media.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-center mt-1 truncate">
                              {media.filename}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dosya Yükleme */}
                <div className="space-y-2">
                  <Label>Dosya Yükle</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Resim, video, PDF veya Word dosyası seçin
                      </p>
                      <GlobalMediaSelector
                        onSelect={(media: MediaFile) => {
                          const galleryItem: GalleryMediaItem = {
                            id: String(media.id),
                            url: media.url,
                            filename: media.filename || media.originalName,
                            alt: media.alt,
                            type: media.mimeType?.startsWith('image/') ? 'IMAGE' 
                                 : media.mimeType?.startsWith('video/') ? 'VIDEO'
                                 : media.mimeType === 'application/pdf' ? 'PDF'
                                 : media.mimeType?.includes('word') ? 'WORD'
                                 : 'IMAGE',
                            embedUrl: undefined,
                            mimeType: media.mimeType
                          };
                          setGalleryMedias(prev => [...prev, galleryItem]);
                          toast.success('Medya galeriye eklendi');
                        }}
                        acceptedTypes={["image/*", "video/*", ".pdf", ".doc", ".docx"]}
                        defaultCategory="news-images"
                        title="Galeri Medyası Seç"
                        description="Haber galerisine eklemek için medya seçin"
                        buttonText="Galeri Medyası Ekle"
                        customFolder="haberler"
                      />
                  </div>
                </div>
              </div>

                {/* Video Embed Ekleme */}
                <div className="space-y-2">
                  <Label>Video Embed Link</Label>
                  <div className="space-y-2">
                    <Input
                      value={embedUrl}
                      onChange={(e) => setEmbedUrl(e.target.value)}
                      placeholder="YouTube, Vimeo veya başka video URL'si"
                      disabled={uploadingMedia}
                    />
                    <Input
                      value={embedTitle}
                      onChange={(e) => setEmbedTitle(e.target.value)}
                      placeholder="Video başlığı (isteğe bağlı)"
                      disabled={uploadingMedia}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddEmbed}
                      disabled={uploadingMedia || !embedUrl.trim()}
                      className="w-full"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      {uploadingMedia ? 'Ekleniyor...' : 'Video Embed Ekle'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Yayın Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) => handleInputChange("categoryId", e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    required
                  >
                    <option value="">Kategori seçin</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="readingTime">Okuma Süresi (dakika)</Label>
                  <Input
                    id="readingTime"
                    type="number"
                    min="1"
                    value={formData.readingTime}
                    onChange={(e) => handleInputChange("readingTime", parseInt(e.target.value) || 3)}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={formData.published}
                      onCheckedChange={(checked) => handleInputChange("published", checked)}
                    />
                    <Label htmlFor="published">Yayında</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasQuickAccess"
                      checked={formData.hasQuickAccess || false}
                      onCheckedChange={(checked) => handleInputChange("hasQuickAccess", checked)}
                    />
                    <Label htmlFor="hasQuickAccess">Hızlı Erişim Aktif</Label>
                    <span className="text-sm text-gray-500">
                      (Aktif edildiğinde haber için hızlı erişim linkleri yönetilebilir)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Ana Görsel</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedMedia ? (
                  <div className="space-y-2">
                    <img
                      src={getMediaUrl(selectedMedia.url)}
                      alt={selectedMedia.alt || "Ana görsel"}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {selectedMedia.filename}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedMedia(null);
                          handleInputChange("mediaId", null);
                        }}
                      >
                        Kaldır
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Ana görsel seçin</p>
                                      <GlobalMediaSelector
                    onSelect={(media: MediaFile) => {
                      const mediaItem: MediaItem = {
                        id: String(media.id),
                        url: media.url,
                        filename: media.filename,
                        originalName: media.originalName,
                        alt: media.alt,
                        type: media.mimeType?.startsWith('image/') ? 'IMAGE' 
                             : media.mimeType?.startsWith('video/') ? 'VIDEO'
                             : media.mimeType === 'application/pdf' ? 'PDF'
                             : media.mimeType?.includes('word') ? 'WORD'
                             : 'IMAGE',
                        embedUrl: undefined,
                        mimeType: media.mimeType
                      };
                      setSelectedMedia(mediaItem);
                      handleInputChange("mediaId", String(media.id));
                    }}
                      selectedMedia={selectedMedia}
                      buttonText="Medya Seç"
                      title="Ana Görsel Seç"
                      description="Haber için ana görsel seçin veya yükleyin"
                      acceptedTypes={["image/*"]}
                      customFolder="haberler"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Access Links */}
            {formData.hasQuickAccess && news && (
              <QuickAccessLinksManager
                moduleType="news"
                moduleId={news.id}
              />
            )}

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Kaydediliyor..." : "Güncelle"}
                  </Button>
                  <LoadingLink href="/dashboard/news">
                    <Button type="button" variant="outline" className="w-full">
                      İptal
                    </Button>
                  </LoadingLink>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
      {previewOpen && previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setPreviewOpen(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full p-4 relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2 text-2xl" onClick={() => setPreviewOpen(false)}>×</button>
            {previewMedia.type === 'IMAGE' ? (
              <img src={getMediaUrl(previewMedia.url)} alt={previewMedia.alt || previewMedia.filename} className="max-w-full max-h-[70vh] mx-auto rounded" />
            ) : previewMedia.type === 'VIDEO' || (previewMedia.mimeType && previewMedia.mimeType.startsWith('video/')) ? (
              <video src={getMediaUrl(previewMedia.url)} controls className="max-w-full max-h-[70vh] mx-auto rounded" />
            ) : (
              <div className="text-center p-8">Bu dosya türü önizlenemiyor.</div>
            )}
            <div className="mt-4 text-center">
              <h3 className="font-semibold text-lg">{previewMedia.filename}</h3>
              {previewMedia.alt && <p className="text-gray-600 mt-1">{previewMedia.alt}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
