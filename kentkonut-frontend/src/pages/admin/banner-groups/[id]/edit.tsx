import { useParams, Link } from 'react-router-dom';
import { BannerGroupForm } from '@/components/admin/banner-groups/BannerGroupForm';

export default function EditBannerGroupPage() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Banner Grubunu Düzenle</h1>
        <Link
          to="/admin/banner-groups"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Geri Dön
        </Link>
      </div>
      <BannerGroupForm bannerGroupId={id} />
    </div>
  );
}
