'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BannerForm } from './BannerForm';
import { bannerService } from '../services/banner.service';
import { Banner } from '../types/banner.types';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BannerEditFormProps {
  bannerId: number;
  bannerGroupId: number;
  onSuccess?: () => void;
}

export function BannerEditForm({ bannerId, bannerGroupId, onSuccess }: BannerEditFormProps) {
  const navigate = useNavigate();
  const [banner, setBanner] = useState<Banner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBanner = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const bannerData = await bannerService.findOne(bannerId);
        setBanner(bannerData);
      } catch (err) {
        console.error('Banner yüklenirken hata:', err);
        setError('Banner yüklenirken bir hata oluştu');
        toast.error('Banner yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    loadBanner();
  }, [bannerId]);

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      navigate(`/dashboard/banner-groups/${bannerGroupId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Banner yükleniyor...</span>
      </div>
    );
  }

  if (error || !banner) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Hata! </strong>
        <span className="block sm:inline">{error || 'Banner bulunamadı'}</span>
      </div>
    );
  }

  return (
    <BannerForm
      bannerGroupId={bannerGroupId}
      initialData={banner}
      isEdit={true}
    />
  );
}
