"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RichTextEditor from "@/components/ui/rich-text-editor-tiptap";
import { MediaSelector } from "@/components/media/MediaSelector";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface Executive {
  id: string;
  name: string;
  title: string;
  position: string;
  slug?: string;
  type: 'PRESIDENT' | 'GENERAL_MANAGER' | 'DIRECTOR' | 'MANAGER';
  email?: string;
  phone?: string;
  imageUrl?: string;
  biography?: string;
  linkedIn?: string;
  order: number;
  isActive: boolean;
  quickLinks?: QuickLink[];
}

interface QuickLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
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
];

export default function ExecutiveFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const executiveId = searchParams.get('id');
  const isEditMode = !!executiveId;

  console.log('ExecutiveFormPage rendering:', { executiveId, isEditMode });

  const [isLoading, setIsLoading] = useState(false);
  const [isQuickLinksLoading, setIsQuickLinksLoading] = useState(false);
  const [executive, setExecutive] = useState<Executive | null>(null);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    position: "",
    slug: "",
    type: "DIRECTOR" as Executive['type'],
    email: "",
    phone: "",
    imageUrl: "",
    biography: "",
    linkedIn: "",
    order: 0,
    isActive: true,
  });

  // Quick Link form state
  const [isQuickLinkModalOpen, setIsQuickLinkModalOpen] = useState(false);
  const [editingQuickLink, setEditingQuickLink] = useState<QuickLink | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);

  const [quickLinkForm, setQuickLinkForm] = useState({
    title: "",
    url: "",
    description: "",
    icon: "link",
    order: 0,
    isActive: true,
  });
  const handleInputChange = (field: string, value: any) => {
    console.log('Form field changed:', { field, value });
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const fetchExecutive = async () => {
    if (!executiveId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/executives/${executiveId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Executive not found`);
      }
      
      const data = await response.json();
      console.log('Executive data received:', data);
      const executive = data.data;
      
      if (!executive) {
        throw new Error('No executive data in response');
      }
      
      setExecutive(executive);
      setFormData({
        name: executive.name || "",
        title: executive.title || "",
        position: executive.position || "",
        slug: executive.slug || "",
        type: executive.type || "DIRECTOR",
        email: executive.email || "",
        phone: executive.phone || "",
        imageUrl: executive.imageUrl || "",
        biography: executive.biography || "",
        linkedIn: executive.linkedIn || "",
        order: executive.order || 0,
        isActive: executive.isActive ?? true,
      });    } catch (error) {
      console.error("fetchExecutive error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Yönetici bilgileri yüklenirken hata oluştu: ${errorMessage}`);
      
      // Don't redirect immediately, give user time to see the error
      setTimeout(() => {
        router.push("/dashboard/corporate/executives");
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchQuickLinks = async () => {
    if (!executiveId) return;

    setIsQuickLinksLoading(true);
    try {
      // Use the correct API URL with fallback
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const cacheBuster = new Date().getTime();
      const quickLinksEndpoint = `${apiUrl}/api/quick-links?executiveId=${executiveId}&t=${cacheBuster}`;
      
      console.log('📡 Executive Form - Quick Links API request to:', quickLinksEndpoint);
      
      const response = await fetch(quickLinksEndpoint);
      console.log('📡 Executive Form - Quick Links API status:', response.status);
      
      if (!response.ok) throw new Error(`Failed to fetch quick links: ${response.status}`);
      
      const data = await response.json();
      console.log('📡 Executive Form - Quick Links API response received:', data);
      
      // Check if data is an array directly or nested in data property
      let linksArray = Array.isArray(data) ? data : (data.data || []);
      
      console.log('📡 Executive Form - Quick Links processed:', {
        count: linksArray.length,
        first: linksArray.length > 0 ? linksArray[0] : null
      });
      
      setQuickLinks(linksArray);
    } catch (error) {
      console.error("Quick links fetch error:", error);
    } finally {
      setIsQuickLinksLoading(false);
    }
  };  useEffect(() => {
    console.log('useEffect triggered:', { isEditMode, executiveId });
    if (isEditMode) {
      console.log('Starting fetch operations...');
      
      // Fetch executive first, then quick links
      const loadData = async () => {
        await fetchExecutive();
        
        console.log('Executive fetched, now loading quick links...');
        await fetchQuickLinks();
        
        console.log('Both executive and quick links loaded');
      };
      
      loadData();
    }
  }, [executiveId, isEditMode]);const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode ? `/api/executives/${executiveId}` : '/api/executives';

      console.log('Submitting form data:', formData);
      console.log('ImageUrl specifically:', formData.imageUrl);
      console.log('ImageUrl type:', typeof formData.imageUrl);
      console.log('ImageUrl length:', formData.imageUrl?.length);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        
        let errorMessage = errorData.error || `HTTP ${response.status}: Submit failed`;
        if (errorData.message) {
          errorMessage += ` - ${errorData.message}`;
        }
        if (errorData.details && Array.isArray(errorData.details)) {
          const detailMessages = errorData.details.map((detail: any) => 
            `${detail.path?.join('.') || 'field'}: ${detail.message}`
          ).join(', ');
          errorMessage += ` - Details: ${detailMessages}`;
        }
        
        throw new Error(errorMessage);
      }

      toast.success(isEditMode ? "Yönetici güncellendi" : "Yönetici oluşturuldu");
      
      // Edit mode'da sayfada kal, yeni ekleme modunda liste sayfasına git
      if (!isEditMode) {
        router.push("/dashboard/corporate/executives");
      }
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Kaydetme hatası: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  const handleQuickLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executiveId) return;

    setIsLoading(true);
    try {
      const method = editingQuickLink ? 'PUT' : 'POST';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const url = editingQuickLink 
        ? `${apiUrl}/api/quick-links/${editingQuickLink.id}`
        : `${apiUrl}/api/quick-links`;

      console.log('📡 Executive Form - Making Quick Link API request:', {
        method,
        url,
        formData: {...quickLinkForm, executiveId}
      });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...quickLinkForm,
          executiveId
        })
      });

      console.log('📡 Executive Form - Quick Link submit response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Quick Link API Error:', errorText);
        throw new Error(`Failed to save quick link: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('📡 Executive Form - Quick Link created/updated successfully:', responseData);

      toast.success(
        editingQuickLink 
          ? "Hızlı erişim linki güncellendi" 
          : "Hızlı erişim linki eklendi"
      );
      
      setIsQuickLinkModalOpen(false);
      setEditingQuickLink(null);
      setQuickLinkForm({
        title: "",
        url: "",
        description: "",
        icon: "link",
        order: 0,
        isActive: true,
      });
      
      // Wait a moment to ensure the server has processed the change
      setTimeout(() => {
        console.log('📡 Executive Form - Refreshing quick links after submit');
        fetchQuickLinks();
      }, 500);
    } catch (error) {
      console.error("Quick Link submit error:", error);
      toast.error("Bir hata oluştu: " + (error instanceof Error ? error.message : "Bilinmeyen hata"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLinkEdit = (link: QuickLink) => {
    setEditingQuickLink(link);
    setQuickLinkForm({
      title: link.title,
      url: link.url,
      description: link.description || "",
      icon: link.icon || "link",
      order: link.order,
      isActive: link.isActive,
    });
    setIsQuickLinkModalOpen(true);
  };
  const handleQuickLinkDelete = async (linkId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const url = `${apiUrl}/api/quick-links/${linkId}`;
      
      console.log('📡 Executive Form - Deleting Quick Link:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
      });

      console.log('📡 Executive Form - Delete response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Quick Link Delete Error:', errorText);
        throw new Error(`Link silinirken hata oluştu: ${response.status}`);
      }

      toast.success("Hızlı erişim linki silindi");
      
      // Wait a moment to ensure the server has processed the deletion
      setTimeout(() => {
        console.log('📡 Executive Form - Refreshing quick links after deletion');
        fetchQuickLinks();
        setIsDeleteDialogOpen(false);
        setLinkToDelete(null);
      }, 500);
    } catch (error) {
      console.error("Quick Link delete error:", error);
      toast.error("Link silinirken hata oluştu: " + (error instanceof Error ? error.message : "Bilinmeyen hata"));
    }
  };

  const getTypeLabel = (type: Executive['type']) => {
    const typeLabels = {
      'PRESIDENT': 'Başkan',
      'GENERAL_MANAGER': 'Genel Müdür',
      'DIRECTOR': 'Direktör',
      'MANAGER': 'Müdür'
    };
    return typeLabels[type] || type;
  };

  if (isLoading && isEditMode) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-10">
      <Breadcrumb 
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Kurumsal", href: "/dashboard/corporate" },
          { name: "Yöneticiler", href: "/dashboard/corporate/executives" },
          { name: isEditMode ? "Yönetici Düzenle" : "Yeni Yönetici", href: "" }
        ]} 
        className="mb-4" 
      />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Yönetici Düzenle' : 'Yeni Yönetici Ekle'}
            </h2>
            <p className="text-muted-foreground">
              {isEditMode ? 'Mevcut yönetici bilgilerini düzenleyin' : 'Yeni bir yönetici ekleyin'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Executive Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Yönetici Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Temel Bilgiler */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ad Soyad *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Unvan *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Genel Müdür"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Pozisyon *</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      placeholder="İnsan Kaynakları Departmanı"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">SEO URL (Slug)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="john-doe"
                    />
                    <p className="text-xs text-muted-foreground">
                      Boş bırakırsanız otomatik olarak isimden oluşturulur
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tip *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleInputChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRESIDENT">Başkan</SelectItem>
                        <SelectItem value="GENERAL_MANAGER">Genel Müdür</SelectItem>
                        <SelectItem value="DIRECTOR">Direktör</SelectItem>
                        <SelectItem value="MANAGER">Müdür</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order">Sıra</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* İletişim Bilgileri */}
                <Separator />
                <h3 className="text-lg font-semibold">İletişim Bilgileri</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="john@kentkonut.com"
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedIn">LinkedIn Profili</Label>
                  <Input
                    id="linkedIn"
                    value={formData.linkedIn}
                    onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>

                {/* Diğer Bilgiler */}
                <Separator />
                <h3 className="text-lg font-semibold">Diğer Bilgiler</h3>                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Ana Fotoğraf</Label>
                  {formData.imageUrl && (
                    <div className="mb-4 p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center gap-4">
                        <img 
                          src={formData.imageUrl} 
                          alt="Seçilen fotoğraf" 
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Seçilen fotoğraf:</p>
                          <p className="text-xs text-muted-foreground truncate max-w-md">
                            {formData.imageUrl}
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => handleInputChange('imageUrl', '')}
                          >
                            Fotoğrafı Kaldır
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}                  <MediaSelector
                    selectedMedia={formData.imageUrl ? { 
                      id: formData.imageUrl, 
                      url: formData.imageUrl, 
                      originalName: "Seçilen resim", 
                      filename: "seçilen-resim.jpg",
                      mimeType: "image/jpeg",
                      size: 0,
                      alt: "Yönetici fotoğrafı",
                      caption: "",
                      category: 7,
                      createdAt: new Date().toISOString()
                    } as any : null}
                    onSelect={(media) => {
                      console.log('Media selected:', media);
                      handleInputChange('imageUrl', media.url);
                    }}
                    acceptedTypes={['image/*']}
                    title="Yönetici Fotoğrafı Seçin"
                    description="Kurumsal klasöründen yönetici fotoğrafı seçin"
                    filterToCategory={7} // Sadece Kurumsal kategori gösterilir
                  />
                </div><div className="space-y-2">
                  <Label htmlFor="biography">Biyografi</Label>
                  <RichTextEditor
                    content={formData.biography}
                    onChange={(content) => handleInputChange('biography', content)}
                    placeholder="Yönetici hakkında detaylı bilgi..."
                    className="min-h-[200px]"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Aktif</Label>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? "Güncelle" : "Oluştur"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Hızlı Erişim Linkleri</CardTitle>
                <Button 
                  size="sm"
                  onClick={() => {
                    setEditingQuickLink(null);
                    setQuickLinkForm({
                      title: "",
                      url: "",
                      description: "",
                      icon: "link",
                      order: 0,
                      isActive: true,
                    });
                    setIsQuickLinkModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ekle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isQuickLinksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : quickLinks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Henüz hızlı erişim linki yok
                  </p>
                  <Button 
                    size="sm"
                    onClick={() => setIsQuickLinkModalOpen(true)}
                  >
                    İlk Linki Ekle
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {quickLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-start justify-between p-3 border rounded-lg bg-card"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={link.isActive ? "default" : "secondary"} className="text-xs">
                            {link.icon}
                          </Badge>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm truncate">{link.title}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-full">
                              {link.url}
                            </p>
                            {link.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {link.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleQuickLinkEdit(link)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setLinkToDelete(link.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-destructive hover:text-destructive h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Link Form Modal */}
      <Dialog open={isQuickLinkModalOpen} onOpenChange={setIsQuickLinkModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingQuickLink ? 'Hızlı Erişim Linki Düzenle' : 'Yeni Hızlı Erişim Linki'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleQuickLinkSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ql-title">Başlık *</Label>
              <Input
                id="ql-title"
                value={quickLinkForm.title}
                onChange={(e) => setQuickLinkForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="CV İndir"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ql-url">URL *</Label>
              <Input
                id="ql-url"
                value={quickLinkForm.url}
                onChange={(e) => setQuickLinkForm(prev => ({ ...prev, url: e.target.value }))}
                placeholder="/dashboard/corporate/executives"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ql-description">Açıklama</Label>
              <Textarea
                id="ql-description"
                value={quickLinkForm.description}
                onChange={(e) => setQuickLinkForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Opsiyonel açıklama"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ql-icon">İkon</Label>
                <Select 
                  value={quickLinkForm.icon} 
                  onValueChange={(value) => setQuickLinkForm(prev => ({ ...prev, icon: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ql-order">Sıra</Label>
                <Input
                  id="ql-order"
                  type="number"
                  value={quickLinkForm.order}
                  onChange={(e) => setQuickLinkForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ql-active"
                checked={quickLinkForm.isActive}
                onCheckedChange={(checked) => setQuickLinkForm(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="ql-active">Aktif</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsQuickLinkModalOpen(false)}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingQuickLink ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hızlı Erişim Linkini Sil</DialogTitle>
            <DialogDescription>
              Bu linki silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={() => linkToDelete && handleQuickLinkDelete(linkToDelete)}
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
