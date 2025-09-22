'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Plus } from 'lucide-react';
import Link from 'next/link';
import { BannerGroup } from '@/modules/banner-groups/types/banner-group.types';
import { bannerGroupService } from '@/modules/banner-groups/services/banner-group.service';
import { BannerList } from '@/modules/banner-groups/components/BannerList';
import { toast } from 'sonner';

interface BannerGroupDetailPageProps {
  params: {
    id: string;
  };
}

function getAnimationLabel(animationType: string): string {
  const animationLabels: Record<string, string> = {
    'yok': 'Yok',
    'sol_kaydir': 'Sola Kaydır',
    'sag_kaydir': 'Sağa Kaydır',
    'yukari_kaydir': 'Yukarı Kaydır',
    'asagi_kaydir': 'Aşağı Kaydır',
    'sol_yasli': 'Sola Yaslı',
    'sag_yasli': 'Sağa Yaslı',
    'sol_alt': 'Sol Alt',
    'sag_alt': 'Sağ Alt',
    'sol_ust': 'Sol Üst',
    'sag_ust': 'Sağ Üst',
    'yakinlastir': 'Yakınlaştır',
    'uzaklastir': 'Uzaklaştır',
    'donusum': 'Dönüşüm',
  };
  
  return animationLabels[animationType] || animationType;
}

export default function BannerGroupDetailPage({ params }: BannerGroupDetailPageProps) {
  const router = useRouter();
  const [bannerGroup, setBannerGroup] = useState<BannerGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBannerGroup = async () => {
      try {
        const data = await bannerGroupService.findOne(Number(params.id));
        setBannerGroup(data);
      } catch (err) {
        console.error('Banner grubu yüklenirken hata:', err);
        setError('Banner grubu yüklenirken bir hata oluştu');
        toast.error('Banner grubu yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    loadBannerGroup();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !bannerGroup) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Hata! </strong>
        <span className="block sm:inline">{error || 'Banner grubu bulunamadı'}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/banner-groups">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Banner Gruplarına Dön
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight mt-4">{bannerGroup.name}</h1>
          <p className="text-sm text-muted-foreground">Banner grubu detayları ve yönetimi</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/banner-groups/${bannerGroup.id}/banners/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Banner Ekle
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/banner-groups/${bannerGroup.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Grubu Düzenle
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Temel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">URL Yolu</p>
              <p className="text-sm">{bannerGroup.slug}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Boyut</p>
              <p className="text-sm">{bannerGroup.width} × {bannerGroup.height} piksel</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Oluşturulma Tarihi</p>
              <p className="text-sm">
                {new Date(bannerGroup.createdAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Son Güncelleme</p>
              <p className="text-sm">
                {new Date(bannerGroup.updatedAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Animasyon Ayarları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Animasyon Türü</p>
              <p className="text-sm">{getAnimationLabel(bannerGroup.animationType)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gösterim Süresi</p>
              <p className="text-sm">{bannerGroup.displayDuration} saniye</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Geçiş Süresi</p>
              <p className="text-sm">{bannerGroup.transitionDuration} saniye</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Diğer Ayarlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Durum</p>
                <p className="text-sm">
                  {bannerGroup.isActive ? 'Aktif' : 'Pasif'}
                </p>
              </div>
              <Badge variant={bannerGroup.isActive ? 'default' : 'secondary'}>
                {bannerGroup.isActive ? 'Aktif' : 'Pasif'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Silinebilirlik</p>
                <p className="text-sm">
                  {bannerGroup.silinemez ? 'Silinemez' : 'Silinebilir'}
                </p>
              </div>
              <Badge variant={bannerGroup.silinemez ? 'secondary' : 'outline'}>
                {bannerGroup.silinemez ? 'Korumalı' : 'Standart'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {bannerGroup.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Açıklama</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {bannerGroup.description}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bannerlar</CardTitle>
              <CardDescription>
                Bu gruptaki bannerları aşağıdan yönetebilirsiniz.
              </CardDescription>
            </div>
            <Button size="sm" asChild>
              <Link href={`/dashboard/banner-groups/${bannerGroup.id}/banners/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Ekle
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <BannerList bannerGroupId={bannerGroup.id} />
        </CardContent>
      </Card>
    </div>
  );
}
