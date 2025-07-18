import { Metadata } from 'next';
import { BannerGroupList } from '@/modules/banner-groups/components/BannerGroupList';

export const metadata: Metadata = {
  title: 'Banner Grupları',
  description: 'Banner gruplarını yönetin',
};

export default function BannerGroupsPage() {
  return (
    <div className="container mx-auto py-6">
      <BannerGroupList />
    </div>
  );
}
