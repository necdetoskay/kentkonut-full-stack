import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { BannerGroupList } from '../components/BannerGroupList';

export default function BannerGroupListPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Banner Grupları</h1>
        <Button asChild>
          <Link to="/dashboard/banner-groups/new">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Banner Grubu
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Banner Grupları</CardTitle>
        </CardHeader>
        <CardContent>
          <BannerGroupList />
        </CardContent>
      </Card>
    </div>
  );
}
