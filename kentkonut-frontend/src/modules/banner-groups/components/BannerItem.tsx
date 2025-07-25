import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Eye, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Banner } from '../types/banner.types';
import { format } from 'date-fns/format';
import { tr } from 'date-fns/locale';

interface BannerItemProps {
  banner: Banner;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, isActive: boolean) => void;
}

export function BannerItem({ banner, onDelete, onStatusChange }: BannerItemProps) {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Belirtilmemiş';
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: tr });
  };

  // Check if banner is currently active based on date range
  const isCurrentlyActive = () => {
    if (!banner.isActive) return false;

    const now = new Date();

    // Check start date
    if (banner.startDate) {
      const startDate = new Date(banner.startDate);
      if (now < startDate) return false;
    }

    // Check end date
    if (banner.endDate) {
      const endDate = new Date(banner.endDate);
      if (now > endDate) return false;
    }

    return true;
  };

  const currentlyActive = isCurrentlyActive();
  const hasDateRange = banner.startDate || banner.endDate;

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-muted/50">
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <Badge variant={banner.isActive ? 'default' : 'secondary'}>
            {banner.isActive ? 'Aktif' : 'Pasif'}
          </Badge>
          {hasDateRange && (
            <Badge variant={currentlyActive ? 'default' : 'destructive'} className="text-xs">
              {currentlyActive ? 'Yayında' : 'Tarih Dışı'}
            </Badge>
          )}
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{banner.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pb-2">
        {banner.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {banner.description}
          </p>
        )}
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Başlangıç</p>
            <p className={banner.startDate ? '' : 'text-muted-foreground'}>
              {formatDate(banner.startDate) || 'Hemen'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Bitiş</p>
            <p className={banner.endDate ? '' : 'text-muted-foreground'}>
              {formatDate(banner.endDate) || 'Sınırsız'}
            </p>
          </div>
        </div>

        {hasDateRange && (
          <div className="text-xs text-muted-foreground">
            {currentlyActive ? (
              <span className="text-green-600">✓ Şu anda aktif tarih aralığında</span>
            ) : (
              <span className="text-red-600">⚠ Aktif tarih aralığı dışında</span>
            )}
          </div>
        )}
        
        {banner.targetUrl && (
          <div className="pt-1">
            <a 
              href={banner.targetUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center"
            >
              Hedef URL <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link
              to={`/dashboard/banner-groups/${banner.bannerGroupId}/banners/${banner.id}/edit`}
              className="text-blue-600 hover:text-blue-800"
            >
              <Pencil className="h-4 w-4 mr-1" />
              Düzenle
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onStatusChange(banner.id, !banner.isActive)}
          >
            {banner.isActive ? 'Pasif Yap' : 'Aktif Yap'}
          </Button>
        </div>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => onDelete(banner.id)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Sil
        </Button>
      </CardFooter>
    </Card>
  );
}
