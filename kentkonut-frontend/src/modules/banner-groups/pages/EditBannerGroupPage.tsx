import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { BannerGroupForm } from '@/components/admin/banner-groups/BannerGroupForm';

export default function EditBannerGroupPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return <div>Geçersiz banner grubu</div>;
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
          <CardTitle>Banner Grubunu Düzenle</CardTitle>
        </CardHeader>
        <CardContent>
          <BannerGroupForm 
            id={Number(id)}
            onSuccess={() => navigate(`/dashboard/banner-groups/${id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
