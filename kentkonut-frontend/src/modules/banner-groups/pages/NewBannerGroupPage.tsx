import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { BannerGroupForm } from '@/components/admin/banner-groups/BannerGroupForm';

export default function NewBannerGroupPage() {
  const navigate = useNavigate();

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
          <CardTitle>Yeni Banner Grubu Oluştur</CardTitle>
        </CardHeader>
        <CardContent>
          <BannerGroupForm 
            onSuccess={() => navigate('/dashboard/banner-groups')} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
