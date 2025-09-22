"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RichTextEditor from "@/components/ui/rich-text-editor-tiptap";
import SeoCard from "@/components/ui/seo-card";
import { GlobalMediaSelector } from "@/components/media/GlobalMediaSelector";
import { HafriyatImageUploader } from "@/components/media/HafriyatImageUploader";
import { ArrowLeft, Save, MapPin, Building2, Image, Upload, X, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

// Gallery image type
interface GalleryImage {
  id: number;
  url: string;
  alt: string;
  description: string;
}

interface HafriyatBolge {
  id: number;
  ad: string;
  yetkiliKisi: string;
  yetkiliTelefon: string;
}

export default function YeniSahaPage() {
  const router = useRouter();  // Form state
  const [formData, setFormData] = useState({
    ad: "",
    konumAdi: "",
    enlem: 0,
    boylam: 0,
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
  const [anaResimUrl, setAnaResimUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [bolgeler, setBolgeler] = useState<HafriyatBolge[]>([]);
  const [selectedBolgeId, setSelectedBolgeId] = useState<string>("0");
  const [selectedBolge, setSelectedBolge] = useState<HafriyatBolge | null>(null);  // Galeri state'i
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    const fetchBolgeler = async () => {
      try {
        // Sadece aktif bölgeleri getir
        const response = await fetch('/api/hafriyat-bolgeler?aktif=true');
        if (!response.ok) {
          throw new Error('Bölgeler yüklenemedi');
        }
        const data = await response.json();
        if (data.success) {
          setBolgeler(data.data);
        } else {
          throw new Error(data.message || 'Bölgeler yüklenemedi');
        }
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : 'Bölgeler getirilirken bir hata oluştu.');
      }
    };

    fetchBolgeler();
  }, []);
  useEffect(() => {
    const id = parseInt(selectedBolgeId, 10);
    const bolge = bolgeler.find(b => b.id === id);
    
    setSelectedBolge(bolge || null);
    
    if (bolge) {
      setFormData(prev => ({
        ...prev,
        bolgeId: bolge.id,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        bolgeId: null,
      }));
    }
  }, [selectedBolgeId, bolgeler]);
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
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
        enlem: Number(formData.enlem) || 0,
        boylam: Number(formData.boylam) || 0,
        durum: formData.durum,
        ilerlemeyuzdesi: Number(formData.ilerlemeyuzdesi) || 0,
        tonBasiUcret: Number(formData.tonBasiUcret),
        kdvOrani: Number(formData.kdvOrani),
        bolgeId: formData.bolgeId,
        aciklama: formData.aciklama || '',
      };

      if (anaResimUrl) {
        payload.anaResimUrl = anaResimUrl;
      }

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
      }

      // SEO fields ekle (her zaman gönder, boş olsa bile)
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

      const response = await fetch('/api/hafriyat-sahalar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Saha oluşturulurken bir hata oluştu');
      }

      if (result.success) {
        toast.success('Saha başarıyla oluşturuldu');
        router.push('/dashboard/hafriyat/sahalar');
      } else {
        throw new Error(result.message || 'Saha oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      console.error('Oluşturma hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Saha oluşturulurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Breadcrumb
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Hafriyat Yönetimi", href: "/dashboard/hafriyat" },
          { name: "Hafriyat Sahaları", href: "/dashboard/hafriyat/sahalar" },
          { name: "Yeni Saha", href: "/dashboard/hafriyat/sahalar/yeni" },
        ]}
        className="mb-6"
      />

      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/hafriyat/sahalar">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Geri Dön
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Yeni Saha Ekle</h1>
          <p className="text-muted-foreground mt-2">
            Yeni hafriyat sahası bilgilerini girin
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
              Sahanın temel bilgilerini girin
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="enlem">Enlem</Label>
                <Input id="enlem" type="number" step="0.000001" value={formData.enlem}
                  onChange={(e) => handleInputChange('enlem', parseFloat(e.target.value))} placeholder="40.76" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boylam">Boylam</Label>
                <Input id="boylam" type="number" step="0.000001" value={formData.boylam}
                  onChange={(e) => handleInputChange('boylam', parseFloat(e.target.value))} placeholder="29.92" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aciklama">Proje Açıklaması</Label>
              <RichTextEditor
                content={formData.aciklama}
                onChange={(content) => handleInputChange('aciklama', content)}
                placeholder="Proje hakkında detaylı açıklama yazın..."
                className="min-h-[200px]"
                // Hafriyat klasörü için özel konfigürasyon
                mediaFolder="hafriyat"
              />
              <p className="text-sm text-muted-foreground">
                Editör içindeki resimler /hafriyat klasöründe saklanacaktır.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ana Görsel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Image className="h-5 w-5" /> Ana Görsel</CardTitle>
            <CardDescription>Kartlarda kullanılacak ana görseli galeriden seçin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {anaResimUrl && (
              <img src={anaResimUrl} alt="Ana görsel" className="w-full h-48 object-cover rounded" />
            )}
            <GlobalMediaSelector
              onSelect={(m) => setAnaResimUrl(m.url)}
              customFolder="uploads/media/hafriyat"
              defaultCategory="general"
              trigger={<Button type="button" variant="outline" className="w-full"><Image className="w-4 h-4 mr-2" /> Galeriden Ana Görsel Seç</Button>}
            />
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
        <HafriyatImageUploader
          galleryImages={galleryImages}
          onGalleryChange={setGalleryImages}
          customFolder="uploads/media/hafriyat"
          enableGallery={true}
          maxImages={20}
          aspectRatio={16 / 9}
          title="Hafriyat Saha Galerisi"
          description="Saha ile ilgili fotoğrafları yükleyin ve yönetin"
        />

        {/* Form Butonları */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" asChild>
            <Link href="/dashboard/hafriyat/sahalar">
              İptal
            </Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Oluşturuluyor...' : 'Saha Oluştur'}
          </Button>        </div>
      </form>
    </div>
  );
}
