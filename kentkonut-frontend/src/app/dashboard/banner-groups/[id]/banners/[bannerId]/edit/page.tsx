import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BannerForm } from '@/modules/banner-groups/components/BannerForm';
import { bannerGroupService } from '@/modules/banner-groups/services/banner-group.service';
import { bannerService } from '@/modules/banner-groups/services/banner.service';

interface EditBannerPageProps {
  params: {
    id: string;
    bannerId: string;
  };
}

export const metadata: Metadata = {
  title: 'Banner Düzenle',
  description: 'Banner bilgilerini düzenleyin',
};

export default async function EditBannerPage({ params }: EditBannerPageProps) {
  let bannerGroup;
  let banner;
  
  try {
    const [groupData, bannerData] = await Promise.all([
      bannerGroupService.findOne(Number(params.id)),
      bannerService.findOne(Number(params.bannerId))
    ]);
    
    bannerGroup = groupData;
    banner = bannerData;
    
    // Ensure the banner belongs to the banner group
    if (banner.bannerGroupId !== bannerGroup.id) {
      notFound();
    }
  } catch (error) {
    console.error('Veri yüklenirken hata:', error);
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Banner Düzenle - {bannerGroup.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Banner bilgilerini düzenleyin
        </p>
      </div>
      
      <BannerForm 
        bannerGroupId={bannerGroup.id} 
        initialData={banner}
        isEdit={true}
      />
    </div>
  );
}
