import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import { BannerList } from '../../components/BannerList';

export default function BannerListPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return <div>Geçersiz banner grubu</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="pl-0" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>
        <Button asChild>
          <Link to={`/dashboard/banner-groups/${id}/banners/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Banner Ekle
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bannerlar</CardTitle>
        </CardHeader>
        <CardContent>
          <BannerList bannerGroupId={Number(id)} />
        </CardContent>
      </Card>
    </div>
  );
}
