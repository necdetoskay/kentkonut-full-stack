"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RichTextEditor from "@/components/ui/rich-text-editor-tiptap";
import SeoCard from "@/components/ui/seo-card";
import { GlobalMediaSelector } from "@/components/media/GlobalMediaSelector";
import { ArrowLeft, Save, MapPin, Building2, Image, Eye, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

// Gallery image type
interface GalleryImage {
  id: number;
  url: string;
  alt: string;
  description: string;
}

// Hafriyat Bolge interface
interface HafriyatBolge {
  id: number;
  ad: string;
  yetkiliKisi: string;
  yetkiliTelefon: string;
}

type SahaEditProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function SahaEditPage({ params }: SahaEditProps) {
  const router = useRouter();
  const [currentParams, setCurrentParams] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Form state
  const [formData, setFormData] = useState({
    ad: "",
    konumAdi: "",
    durum: "DEVAM_EDIYOR",
    ilerlemeyuzdesi: 0,
    tonBasiUcret: 65,
    kdvOrani: 20,
    baslangicTarihi: "",
    tahminibitisTarihi: "",
    toplamTon: 0,
    tamamlananTon: 0,
    bolgeId: null as number | null,
    aciklama: "",
    // SEO Fields
    seoLink: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    seoCanonicalUrl: ""
  });
  const [bolgeler, setBolgeler] = useState<HafriyatBolge[]>([]);
  const [selectedBolgeId, setSelectedBolgeId] = useState<string>("0");
  const [selectedBolge, setSelectedBolge] = useState<HafriyatBolge | null>(null);

  // Gallery state
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  // Data fetching and initialization
  useEffect(() => {
    const resolveAndFetch = async () => {
      try {
        setIsLoading(true);
        const resolvedParams = await params;
        setCurrentParams(resolvedParams);        // Fetch saha data from API
        console.log('🔍 Fetching saha data for ID:', resolvedParams.id);
        const [sahaRes, bolgelerRes] = await Promise.all([
          fetch(`/api/hafriyat-sahalar/${resolvedParams.id}`),
          fetch('/api/hafriyat-bolgeler?aktif=true')
        ]);
        
        console.log('📊 API Response status:', {
          saha: { status: sahaRes.status, ok: sahaRes.ok },
          bolgeler: { status: bolgelerRes.status, ok: bolgelerRes.ok }
        });// Handle saha response
        if (!sahaRes.ok) {
          if (sahaRes.status === 404) {
            notFound();
            return;
          }
          const errorText = await sahaRes.text();
          console.error('Saha API Error:', {
            status: sahaRes.status,
            statusText: sahaRes.statusText,
            body: errorText
          });
          throw new Error(`Saha bilgileri yüklenemedi (${sahaRes.status}): ${sahaRes.statusText}`);
        }
        const sahaData = await sahaRes.json();
        if (!sahaData.success) throw new Error(sahaData.message);
        const saha = sahaData.data;

        // Handle bolgeler response
        if (!bolgelerRes.ok) throw new Error('Bölgeler yüklenemedi');
        const bolgelerData = await bolgelerRes.json();
        if (!bolgelerData.success) throw new Error(bolgelerData.message || 'Bölgeler alınamadı.');
        
        setBolgeler(bolgelerData.data);
        
        // Initialize form with fetched data
        setFormData({
          ad: saha.ad,
          konumAdi: saha.konumAdi,
          durum: saha.durum,
          ilerlemeyuzdesi: saha.ilerlemeyuzdesi,
          tonBasiUcret: Number(saha.tonBasiUcret),
          kdvOrani: saha.kdvOrani,
          baslangicTarihi: saha.baslangicTarihi ? saha.baslangicTarihi.split('T')[0] : "",
          tahminibitisTarihi: saha.tahminibitisTarihi ? saha.tahminibitisTarihi.split('T')[0] : "",
          toplamTon: Number(saha.toplamTon),
          tamamlananTon: Number(saha.tamamlananTon),
          bolgeId: saha.bolgeId,
          aciklama: saha.aciklama || "",
          seoLink: saha.seoLink || "",
          seoTitle: saha.seoTitle || "",
          seoDescription: saha.seoDescription || "",
          seoKeywords: saha.seoKeywords || "",
          seoCanonicalUrl: saha.seoCanonicalUrl || ""
        });
        
        if (saha.bolgeId) {
          setSelectedBolgeId(saha.bolgeId.toString());
          setSelectedBolge(saha.bolge);
        }

        // Convert resimler to gallery format if available
        if (saha.resimler && saha.resimler.length > 0) {
          const galleryImages = saha.resimler.map((resim: any) => ({
            id: resim.id,
            url: resim.dosyaYolu,
            alt: resim.altMetin || resim.baslik || 'Saha görseli',
            description: resim.aciklama || ''
          }));
          setGalleryImages(galleryImages);
        }

      } catch (error) {
        console.error("Veri yükleme hatası:", error);
        toast.error(error instanceof Error ? error.message : 'Veriler yüklenirken bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    resolveAndFetch();
  }, [params]);
  // Update form data when a new region is selected
  useEffect(() => {
    if (bolgeler.length === 0) return;

    const id = parseInt(selectedBolgeId, 10);
    const bolge = bolgeler.find(b => b.id === id);
    
    setSelectedBolge(bolge || null);
    
    if (bolge) {
      setFormData(prev => ({
        ...prev,
        bolgeId: bolge.id,
      }));
    } else if (id === 0) {
      setFormData(prev => ({
        ...prev,
        bolgeId: null,
      }));
    }
  }, [selectedBolgeId, bolgeler]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (uploadedFiles: any[]) => {
    const newImages = uploadedFiles.map(file => ({
      id: file.id,
      url: file.url,
      alt: file.alt || file.originalName || 'Saha görseli',
      description: file.caption || ''
    }));
    setGalleryImages(prev => [...prev, ...newImages]);
    toast.success(`${uploadedFiles.length} fotoğraf galeriye eklendi`);
  };

  const handleImageDelete = (imageId: number) => {
    setGalleryImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleImageView = (image: GalleryImage) => {
    setSelectedImage(image);
    setIsImageDialogOpen(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!currentParams?.id) {
        throw new Error('Saha ID bulunamadı');
      }

      // Form validasyonu
      if (!formData.ad.trim()) {
        toast.error('Saha adı gereklidir');
        return;
      }
      if (!formData.konumAdi.trim()) {
        toast.error('Konum adı gereklidir');
        return;
      }
      if (!formData.bolgeId) {
        toast.error('Bölge seçimi gereklidir');
        return;
      }      // API payload hazırla - sadece boş olmayan değerleri gönder
      const payload: any = {
        ad: formData.ad,
        konumAdi: formData.konumAdi,
        durum: formData.durum,
        ilerlemeyuzdesi: Number(formData.ilerlemeyuzdesi) || 0,
        tonBasiUcret: Number(formData.tonBasiUcret),
        kdvOrani: Number(formData.kdvOrani),
        bolgeId: formData.bolgeId,
        aciklama: formData.aciklama || '',
      };

      // Sadece değer girilmişse ton miktarlarını ekle
      if (formData.toplamTon && formData.toplamTon > 0) {
        payload.toplamTon = Number(formData.toplamTon);
      }
      if (formData.tamamlananTon && formData.tamamlananTon >= 0) {
        payload.tamamlananTon = Number(formData.tamamlananTon);
      }      // Sadece değer girilmişse tarihleri ekle
      if (formData.baslangicTarihi) {
        payload.baslangicTarihi = new Date(formData.baslangicTarihi).toISOString();
      }
      if (formData.tahminibitisTarihi) {
        payload.tahminibitisTarihi = new Date(formData.tahminibitisTarihi).toISOString();
      }      // SEO fields ekle (her zaman gönder, boş olsa bile)
      payload.seoTitle = formData.seoTitle || '';
      payload.seoDescription = formData.seoDescription || '';
      payload.seoKeywords = formData.seoKeywords || '';
      payload.seoLink = formData.seoLink || '';
      payload.seoCanonicalUrl = formData.seoCanonicalUrl || '';

      // Galeri resimlerini ekle
      if (galleryImages.length > 0) {
        payload.resimler = galleryImages.map(img => ({
          url: img.url,
          alt: img.alt,
          description: img.description
        }));
      }

      const response = await fetch(`/api/hafriyat-sahalar/${currentParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Saha güncellenirken bir hata oluştu');
      }      if (result.success) {
        toast.success('Saha başarıyla güncellendi');
        router.push(`/dashboard/hafriyat/sahalar/${currentParams.id}`);
      } else {
        throw new Error(result.message || 'Saha güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Saha güncellenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!currentParams) {
      return notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <Breadcrumb
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Hafriyat Yönetimi", href: "/dashboard/hafriyat" },
          { name: "Hafriyat Sahaları", href: "/dashboard/hafriyat/sahalar" },
          { name: formData.ad, href: `/dashboard/hafriyat/sahalar/${currentParams?.id}` },
          { name: "Düzenle", href: `/dashboard/hafriyat/sahalar/${currentParams?.id}/duzenle` },
        ]}
        className="mb-6"
      />

      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/hafriyat/sahalar`}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Geri Dön
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Saha Düzenle</h1>
          <p className="text-muted-foreground mt-2">
            {formData.ad} sahasının bilgilerini güncelleyin
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Temel Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Temel Bilgiler
            </CardTitle>
            <CardDescription>
              Sahanın temel bilgilerini güncelleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ad">Saha Adı *</Label>
                <Input
                  id="ad"
                  value={formData.ad}
                  onChange={(e) => handleInputChange('ad', e.target.value)}
                  placeholder="Saha adını girin"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="durum">Durum</Label>
                <Select value={formData.durum} onValueChange={(value) => handleInputChange('durum', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEVAM_EDIYOR">Devam Ediyor</SelectItem>
                    <SelectItem value="TAMAMLANDI">Tamamlandı</SelectItem>
                    <SelectItem value="BEKLEMEDE">Beklemede</SelectItem>
                    <SelectItem value="IPTAL">İptal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="konumAdi">Konum *</Label>
              <Input
                id="konumAdi"
                value={formData.konumAdi}
                onChange={(e) => handleInputChange('konumAdi', e.target.value)}
                placeholder="Saha konumunu girin"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aciklama">Proje Açıklaması</Label>
              <RichTextEditor
                content={formData.aciklama}
                onChange={(content) => handleInputChange('aciklama', content)}
                placeholder="Proje hakkında detaylı açıklama yazın..."
                className="min-h-[200px]"
                mediaFolder="hafriyat"
              />
              <p className="text-sm text-muted-foreground">
                Editör içindeki resimler /hafriyat klasöründe saklanacaktır.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* İlerleme ve Miktar Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>İlerleme ve Miktar</CardTitle>
            <CardDescription>
              Projenin ilerleme durumu ve miktar bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ilerlemeyuzdesi">İlerleme Yüzdesi (%)</Label>
                <Input
                  id="ilerlemeyuzdesi"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.ilerlemeyuzdesi}
                  onChange={(e) => handleInputChange('ilerlemeyuzdesi', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="toplamTon">Toplam Ton</Label>
                <Input
                  id="toplamTon"
                  type="number"
                  min="0"
                  placeholder="Toplam ton miktarı (opsiyonel)"
                  value={formData.toplamTon || ''}
                  onChange={(e) => handleInputChange('toplamTon', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tamamlananTon">Tamamlanan Ton</Label>
                <Input
                  id="tamamlananTon"
                  type="number"
                  min="0"
                  placeholder="Tamamlanan ton miktarı (opsiyonel)"
                  value={formData.tamamlananTon || ''}
                  onChange={(e) => handleInputChange('tamamlananTon', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Kalan Ton Bilgisi - Sadece geçerli değerler varsa göster */}
            {formData.toplamTon > 0 && formData.tamamlananTon >= 0 && (
              <div className="space-y-2">
                <Label>Kalan Ton</Label>
                <div className="flex items-center h-10 px-3 py-2 border border-input bg-muted rounded-md">
                  <span className="text-sm">
                    {Math.max(0, (formData.toplamTon || 0) - (formData.tamamlananTon || 0)).toLocaleString()} ton
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tarih Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>Tarih Bilgileri</CardTitle>
            <CardDescription>
              Proje başlangıç ve bitiş tarihleri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baslangicTarihi">Başlangıç Tarihi</Label>
                <Input
                  id="baslangicTarihi"
                  type="date"
                  placeholder="Proje başlangıç tarihi (opsiyonel)"
                  value={formData.baslangicTarihi}
                  onChange={(e) => handleInputChange('baslangicTarihi', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tahminibitisTarihi">Tahmini Bitiş Tarihi</Label>
                <Input
                  id="tahminibitisTarihi"
                  type="date"
                  placeholder="Proje bitiş tarihi (opsiyonel)"
                  value={formData.tahminibitisTarihi}
                  onChange={(e) => handleInputChange('tahminibitisTarihi', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ücret Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>Ücret Bilgileri</CardTitle>
            <CardDescription>
              Ton başı ücret ve KDV bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tonBasiUcret">Ton Başı Ücret (TL) *</Label>
                <Input
                  id="tonBasiUcret"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.tonBasiUcret}
                  onChange={(e) => handleInputChange('tonBasiUcret', parseFloat(e.target.value))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="kdvOrani">KDV Oranı (%)</Label>
                <Input
                  id="kdvOrani"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.kdvOrani}
                  onChange={(e) => handleInputChange('kdvOrani', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">KDV Dahil Ton Başı Ücret:</span>
                <span className="text-lg font-bold">
                  {(formData.tonBasiUcret * (1 + formData.kdvOrani / 100)).toFixed(2)} TL
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium">Toplam Proje Maliyeti:</span>
                <span className="text-xl font-bold text-green-600">
                  {(formData.toplamTon * formData.tonBasiUcret * (1 + formData.kdvOrani / 100)).toLocaleString()} TL
                </span>
              </div>
            </div>
          </CardContent>
        </Card>        {/* Bölge Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bölge Bilgileri
            </CardTitle>
            <CardDescription>
              Saha için bir bölge seçin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bolgeId">Bölge Adı *</Label>
              <Select
                onValueChange={setSelectedBolgeId}
                value={selectedBolgeId}
                required
              >
                <SelectTrigger id="bolgeId">
                  <SelectValue placeholder="Bir bölge seçin" />
                </SelectTrigger>
                <SelectContent>
                  {bolgeler.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">Yükleniyor...</p>
                  ) : (
                    <>
                      <SelectItem value="0">Bölge Seç</SelectItem>
                      {bolgeler.map((bolge) => (
                        <SelectItem key={bolge.id} value={bolge.id.toString()}>
                          {bolge.ad}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Seçili bölgenin yetkili bilgilerini göster */}
            {selectedBolge && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Bölge Yetkili Bilgileri:</h4>                <div className="space-y-1 text-sm text-blue-800">
                  <p><strong>Yetkili Kişi:</strong> {selectedBolge.yetkiliKisi}</p>
                  <p><strong>Telefon:</strong> {selectedBolge.yetkiliTelefon}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SEO Optimizasyonu */}
        <SeoCard
          formData={formData}
          onFieldChange={handleInputChange}
        />        {/* Hafriyat Saha Galerisi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Hafriyat Saha Galerisi
            </CardTitle>
            <CardDescription>
              Saha ile ilgili fotoğrafları yükleyin ve yönetin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">            <div className="space-y-4">
              <GlobalMediaSelector
                onSelect={(media) => {
                  const newImage = {
                    id: Date.now(),
                    url: media.url,
                    alt: media.alt || 'Hafriyat saha görseli',
                    description: media.caption || ''
                  };
                  setGalleryImages(prev => [...prev, newImage]);
                  toast.success('Resim galeriye eklendi');
                }}
                customFolder="uploads/media/hafriyat"
                defaultCategory="general"
                trigger={
                  <Button type="button" variant="outline" className="w-full">
                    <Image className="w-4 h-4 mr-2" />
                    Hafriyat Galerisi'nden Seç
                  </Button>
                }
                title="Hafriyat Galerisi"
                description="Hafriyat klasöründen resim seçin veya yeni resim yükleyin"
                acceptedTypes={['image/*']}
                targetWidth={800}
                targetHeight={450}
              />
            </div>

            {galleryImages.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Yüklenen Resimler ({galleryImages.length})</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleImageView(image)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => handleImageDelete(image.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground truncate" title={image.alt}>
                          {image.alt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Butonları */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" asChild>
            <Link href={`/dashboard/hafriyat/sahalar`}>
              İptal
            </Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </Button>
        </div>
      </form>

      {/* Resim Görüntüleme Modal */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Resim Görüntüle</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.alt}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="image-alt">Resim Açıklaması</Label>
                  <Input
                    id="image-alt"
                    value={selectedImage.alt}
                    onChange={(e) => {
                      const newAlt = e.target.value;
                      setSelectedImage(prev => prev ? {...prev, alt: newAlt} : null);
                      setGalleryImages(prev => 
                        prev.map(img => 
                          img.id === selectedImage.id 
                            ? {...img, alt: newAlt}
                            : img
                        )
                      );
                    }}
                    placeholder="Resim açıklaması girin"
                  />
                </div>
                <div>
                  <Label htmlFor="image-description">Detaylı Açıklama</Label>
                  <Input
                    id="image-description"
                    value={selectedImage.description}
                    onChange={(e) => {
                      const newDesc = e.target.value;
                      setSelectedImage(prev => prev ? {...prev, description: newDesc} : null);
                      setGalleryImages(prev => 
                        prev.map(img => 
                          img.id === selectedImage.id 
                            ? {...img, description: newDesc}
                            : img
                        )
                      );
                    }}
                    placeholder="Detaylı açıklama girin (opsiyonel)"
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
