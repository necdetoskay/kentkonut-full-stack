import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BannerList } from '@/modules/banner-groups/components/BannerList';
import { bannerGroupService } from '@/modules/banner-groups/services/banner-group.service';

interface BannersPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Banner Yönetimi',
  description: 'Bannerlarınızı yönetin',
};

export default async function BannersPage({ params }: BannersPageProps) {
  let bannerGroup;
  
  try {
    bannerGroup = await bannerGroupService.getById(Number(params.id));
  } catch (error) {
    console.error('Banner grubu yüklenirken hata:', error);
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {bannerGroup.name} - Bannerlar
        </h1>
        <p className="text-sm text-muted-foreground">
          Bu gruptaki bannerları yönetin
        </p>
      </div>
      
      <BannerList bannerGroupId={bannerGroup.id} />
    </div>
  );
}
