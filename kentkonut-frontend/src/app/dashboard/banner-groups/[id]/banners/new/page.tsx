import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BannerForm } from '@/modules/banner-groups/components/BannerForm';
import { bannerGroupService } from '@/modules/banner-groups/services/banner-group.service';

interface NewBannerPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Yeni Banner Ekle',
  description: 'Yeni bir banner ekleyin',
};

export default async function NewBannerPage({ params }: NewBannerPageProps) {
  let bannerGroup;
  
  try {
    bannerGroup = await bannerGroupService.findOne(Number(params.id));
  } catch (error) {
    console.error('Banner grubu yüklenirken hata:', error);
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Yeni Banner Ekle - {bannerGroup.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Bu gruba yeni bir banner ekleyin
        </p>
      </div>
      
      <BannerForm bannerGroupId={bannerGroup.id} />
    </div>
  );
}
