import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { BannerItem } from './BannerItem';
import { bannerService } from '../services/banner.service';
import { Banner } from '../types/banner.types';
import { Loader2 } from 'lucide-react';

interface BannerListProps {
  bannerGroupId: number;
}

export function BannerList({ bannerGroupId }: BannerListProps) {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBanners = async () => {
    try {
      setIsLoading(true);
      const data = await bannerService.findAllByGroupId(bannerGroupId);
      setBanners(data);
    } catch (err) {
      console.error('Bannerlar yüklenirken hata:', err);
      setError('Bannerlar yüklenirken bir hata oluştu');
      toast.error('Bannerlar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, [bannerGroupId]);

  const handleDelete = async (id: number) => {
    if (!confirm('Bu bannerı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await bannerService.delete(id);
      toast.success('Banner başarıyla silindi');
      loadBanners();
    } catch (error) {
      console.error('Banner silinirken hata:', error);
      toast.error(error instanceof Error ? error.message : 'Banner silinirken bir hata oluştu');
    }
  };

  const handleStatusChange = async (id: number, isActive: boolean) => {
    try {
      await bannerService.toggleStatus(id, isActive);
      toast.success(`Banner başarıyla ${isActive ? 'aktif' : 'pasif'} hale getirildi`);
      loadBanners();
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
      toast.error('Durum güncellenirken bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Hata! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Bannerlar</h2>
        <Button asChild>
          <Link to={`/dashboard/banner-groups/${bannerGroupId}/banners/new`}>
            Yeni Banner Ekle
          </Link>
        </Button>
      </div>

      {banners.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">Henüz hiç banner bulunmuyor.</p>
          <Button className="mt-4" asChild>
            <Link to={`/dashboard/banner-groups/${bannerGroupId}/banners/new`}>
              İlk Bannerı Ekle
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => (
            <BannerItem
              key={banner.id}
              banner={banner}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
