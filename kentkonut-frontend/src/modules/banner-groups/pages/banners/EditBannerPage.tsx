import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { BannerEditForm } from '../../components/BannerEditForm';

export default function EditBannerPage() {
  const { id, bannerId } = useParams<{ id: string; bannerId: string }>();
  const navigate = useNavigate();

  if (!id || !bannerId) {
    return <div>Geçersiz banner veya banner grubu</div>;
  }

  return (
    <div className="space-y-4">
      <Button 
        variant="ghost" 
        className="pl-0" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Geri Dön
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Banner'ı Düzenle</CardTitle>
        </CardHeader>
        <CardContent>
          <BannerEditForm
            bannerId={Number(bannerId)}
            bannerGroupId={Number(id)}
            onSuccess={() => navigate(`/dashboard/banner-groups/${id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
