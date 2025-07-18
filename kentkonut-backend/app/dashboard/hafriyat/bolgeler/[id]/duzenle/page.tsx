"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Building2, Users } from "lucide-react";

// Mock data - gerçekte API'den gelecek
const mockBolgeler = [
  {
    id: "1",
    ad: "Gebze Bölgesi",
    aciklama: "Gebze ilçesi ve çevresindeki hafriyat sahaları",
    yetkiliKisi: "Şevki Uzun",
    yetkiliTelefon: "0533 453 8269",
    yetkiliEmail: "sevki.uzun@kentkonut.com",
    aktif: true,
    kurulumTarihi: "2023-03-15"
  },
  {
    id: "2",
    ad: "İzmit Bölgesi", 
    aciklama: "İzmit ilçesi ve çevresindeki hafriyat sahaları",
    yetkiliKisi: "Tahir Aslan",
    yetkiliTelefon: "0545 790 9577",
    yetkiliEmail: "tahir.aslan@kentkonut.com",
    aktif: true,
    kurulumTarihi: "2023-05-20"
  },
  {
    id: "3",
    ad: "Körfez Bölgesi",
    aciklama: "Körfez ilçesi ve çevresindeki hafriyat sahaları", 
    yetkiliKisi: "Serkan Küçük",
    yetkiliTelefon: "0541 223 2479",
    yetkiliEmail: "serkan.kucuk@kentkonut.com",
    aktif: true,
    kurulumTarihi: "2023-01-10"
  }
];

type BolgeEditProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function BolgeEditPage({ params }: BolgeEditProps) {
  const router = useRouter();
  const [currentParams, setCurrentParams] = useState<{ id: string } | null>(null);
  const [originalBolge, setOriginalBolge] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Resolve params asynchronously
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setCurrentParams(resolvedParams);
      
      const bolge = mockBolgeler.find(b => b.id === resolvedParams.id);
      if (!bolge) {
        notFound();
        return;
      }
      
      setOriginalBolge(bolge);
      setIsLoading(false);
    };
    
    resolveParams();
  }, [params]);

  // Show loading state while resolving params
  if (isLoading || !originalBolge || !currentParams) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }
  // Form state
  const [formData, setFormData] = useState({
    ad: "",
    aciklama: "",
    yetkiliKisi: "",
    yetkiliTelefon: "",
    yetkiliEmail: "",
    aktif: true,
    kurulumTarihi: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when originalBolge is available
  useEffect(() => {
    if (originalBolge) {
      setFormData({
        ad: originalBolge.ad,
        aciklama: originalBolge.aciklama,
        yetkiliKisi: originalBolge.yetkiliKisi,
        yetkiliTelefon: originalBolge.yetkiliTelefon,
        yetkiliEmail: originalBolge.yetkiliEmail,
        aktif: originalBolge.aktif,
        kurulumTarihi: originalBolge.kurulumTarihi
      });
    }
  }, [originalBolge]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Burada gerçek API çağrısı olacak
      console.log('Bölge güncelleniyor:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push(`/dashboard/hafriyat/bolgeler/${currentParams?.id}`);
    } catch (error) {
      console.error('Güncelleme hatası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">      <Breadcrumb
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Hafriyat Yönetimi", href: "/dashboard/hafriyat" },
          { name: "Bölge Yönetimi", href: "/dashboard/hafriyat/bolgeler" },
          { name: originalBolge.ad, href: `/dashboard/hafriyat/bolgeler/${currentParams?.id}` },
          { name: "Düzenle", href: `/dashboard/hafriyat/bolgeler/${currentParams?.id}/duzenle` },
        ]}
        className="mb-6"
      />

      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/hafriyat/bolgeler/${currentParams?.id}`}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Geri Dön
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Bölge Düzenle</h1>
          <p className="text-muted-foreground mt-2">
            {originalBolge.ad} bölgesinin bilgilerini güncelleyin
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Temel Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Temel Bilgiler
            </CardTitle>
            <CardDescription>
              Bölgenin temel bilgilerini güncelleyin
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ad">Bölge Adı</Label>
                <Input
                  id="ad"
                  value={formData.ad}
                  onChange={(e) => handleInputChange('ad', e.target.value)}
                  placeholder="Bölge adını girin"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="kurulumTarihi">Kuruluş Tarihi</Label>
                <Input
                  id="kurulumTarihi"
                  type="date"
                  value={formData.kurulumTarihi}
                  onChange={(e) => handleInputChange('kurulumTarihi', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aciklama">Bölge Açıklaması</Label>
              <Textarea
                id="aciklama"
                value={formData.aciklama}
                onChange={(e) => handleInputChange('aciklama', e.target.value)}
                placeholder="Bölge hakkında detaylı açıklama"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="aktif"
                checked={formData.aktif}
                onCheckedChange={(checked) => handleInputChange('aktif', checked)}
              />
              <Label htmlFor="aktif">Bölge Aktif</Label>
            </div>
          </CardContent>
        </Card>

        {/* Yetkili Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Yetkili Bilgileri
            </CardTitle>
            <CardDescription>
              Bölge sorumlusu ve iletişim bilgileri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="yetkiliKisi">Yetkili Kişi</Label>
              <Input
                id="yetkiliKisi"
                value={formData.yetkiliKisi}
                onChange={(e) => handleInputChange('yetkiliKisi', e.target.value)}
                placeholder="Yetkili kişinin adını girin"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="yetkiliTelefon">Telefon</Label>
                <Input
                  id="yetkiliTelefon"
                  value={formData.yetkiliTelefon}
                  onChange={(e) => handleInputChange('yetkiliTelefon', e.target.value)}
                  placeholder="0XXX XXX XX XX"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="yetkiliEmail">E-posta</Label>
                <Input
                  id="yetkiliEmail"
                  type="email"
                  value={formData.yetkiliEmail}
                  onChange={(e) => handleInputChange('yetkiliEmail', e.target.value)}
                  placeholder="ornek@kentkonut.com"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Butonları */}        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" asChild>
            <Link href={`/dashboard/hafriyat/bolgeler/${currentParams?.id}`}>
              İptal
            </Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </Button>
        </div>
      </form>
    </div>
  );
}
