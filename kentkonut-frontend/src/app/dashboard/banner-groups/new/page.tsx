import { Metadata } from 'next';
import { BannerGroupForm } from '@/modules/banner-groups/components/BannerGroupForm';

export const metadata: Metadata = {
  title: 'Yeni Banner Grubu',
  description: 'Yeni bir banner grubu oluşturun',
};

export default function NewBannerGroupPage() {
  return (
    <div className="container mx-auto py-6">
      <BannerGroupForm />
    </div>
  );
}
