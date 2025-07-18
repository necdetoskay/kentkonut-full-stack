import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { BannerGroupItem } from './BannerGroupItem';
import { bannerGroupService } from '../services/banner-group.service';
import { BannerGroup } from '../types/banner-group.types';

export function BannerGroupList() {
  const navigate = useNavigate();
  const [bannerGroups, setBannerGroups] = useState<BannerGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBannerGroups = async () => {
    try {
      setIsLoading(true);
      const data = await bannerGroupService.findAll();
      setBannerGroups(data);
    } catch (err) {
      console.error('Banner grupları yüklenirken hata:', err);
      setError('Banner grupları yüklenirken bir hata oluştu');
      toast.error('Banner grupları yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBannerGroups();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Bu banner grubunu silmek istediğinizden emin misiniz?')) {
      try {
        await bannerGroupService.delete(id);
        toast.success('Banner grubu başarıyla silindi');
        loadBannerGroups();
      } catch (error) {
        console.error('Banner grubu silinirken hata:', error);
        toast.error('Banner grubu silinirken bir hata oluştu');
      }
    }
  };

  const handleStatusChange = async (id: number, isActive: boolean) => {
    try {
      await bannerGroupService.toggleStatus(id, isActive);
      toast.success(`Banner grubu başarıyla ${isActive ? 'aktif' : 'pasif'} hale getirildi`);
      loadBannerGroups();
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
      toast.error('Durum güncellenirken bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Banner Grupları</h2>
        <Button asChild>
          <Link href="/dashboard/banner-groups/new">Yeni Banner Grubu</Link>
        </Button>
      </div>

      {bannerGroups.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">Henüz hiç banner grubu bulunmuyor.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/banner-groups/new">İlk Banner Grubunu Oluştur</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bannerGroups.map((bannerGroup) => (
            <BannerGroupItem
              key={bannerGroup.id}
              bannerGroup={bannerGroup}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
