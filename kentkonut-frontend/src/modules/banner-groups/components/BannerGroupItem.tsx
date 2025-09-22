import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BannerGroup } from '../types/banner-group.types';
import { bannerGroupService } from '../services/banner-group.service';
import { toast } from 'sonner';

interface BannerGroupItemProps {
  bannerGroup: BannerGroup;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, isActive: boolean) => void;
}

export function BannerGroupItem({ 
  bannerGroup, 
  onDelete,
  onStatusChange 
}: BannerGroupItemProps) {
  const handleStatusChange = async (checked: boolean) => {
    try {
      await bannerGroupService.toggleStatus(bannerGroup.id, checked);
      onStatusChange(bannerGroup.id, checked);
      toast.success(`Banner grubu ${checked ? 'aktif' : 'pasif'} hale getirildi`);
    } catch (error) {
      toast.error('Durum güncellenirken bir hata oluştu');
      console.error(error);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{bannerGroup.name}</CardTitle>
          <Badge variant={bannerGroup.isActive ? 'default' : 'secondary'}>
            {bannerGroup.isActive ? 'Aktif' : 'Pasif'}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {bannerGroup.width}x{bannerGroup.height}px • {bannerGroup.slug}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <div>Animasyon: {getAnimationLabel(bannerGroup.animationType)}</div>
            <div>Gösterim: {bannerGroup.displayDuration}s • Geçiş: {bannerGroup.transitionDuration}s</div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" asChild>
              <Link to={`/dashboard/banner-groups/${bannerGroup.id}`}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">Görüntüle</span>
              </Link>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link to={`/dashboard/banner-groups/${bannerGroup.id}/edit`}>
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Düzenle</span>
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete(bannerGroup.id)}
              disabled={bannerGroup.silinemez}
              title={bannerGroup.silinemez ? "Bu banner grubu silinemez" : "Sil"}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Sil</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Yardımcı fonksiyon: Animasyon etiketini döndürür
function getAnimationLabel(animationType: string): string {
  const animationLabels: Record<string, string> = {
    'yok': 'Yok',
    'sol_kaydir': 'Sola Kaydır',
    'sag_kaydir': 'Sağa Kaydır',
    'yukari_kaydir': 'Yukarı Kaydır',
    'asagi_kaydir': 'Aşağı Kaydır',
    'sol_yasli': 'Sola Yaslı',
    'sag_yasli': 'Sağa Yaslı',
    'sol_alt': 'Sol Alt',
    'sag_alt': 'Sağ Alt',
    'sol_ust': 'Sol Üst',
    'sag_ust': 'Sağ Üst',
    'yakinlastir': 'Yakınlaştır',
    'uzaklastir': 'Uzaklaştır',
    'donusum': 'Dönüşüm',
  };
  
  return animationLabels[animationType] || animationType;
}
