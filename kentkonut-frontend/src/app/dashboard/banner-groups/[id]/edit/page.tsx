import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BannerGroupForm } from '@/modules/banner-groups/components/BannerGroupForm';
import { bannerGroupService } from '@/modules/banner-groups/services/banner-group.service';

interface EditBannerGroupPageProps {
  params: {
    id: string;
  };
}

export const metadata: Metadata = {
  title: 'Banner Grubunu Düzenle',
  description: 'Banner grubu bilgilerini düzenleyin',
};

export default async function EditBannerGroupPage({ params }: EditBannerGroupPageProps) {
  let bannerGroup;
  
  try {
    bannerGroup = await bannerGroupService.getById(Number(params.id));
  } catch (error) {
    console.error('Banner grubu yüklenirken hata:', error);
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <BannerGroupForm initialData={bannerGroup} isEdit />
    </div>
  );
}
