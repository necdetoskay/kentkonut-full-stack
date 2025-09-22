import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getBannerGroups, deleteBannerGroup } from '@/services/bannerGroupService';
import { BannerGroup } from '@/types/banner-group';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function BannerGroupList() {
  const [bannerGroups, setBannerGroups] = useState<BannerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBannerGroups = async () => {
    try {
      setLoading(true);
      const data = await getBannerGroups();
      setBannerGroups(data);
      setError(null);
    } catch (err) {
      console.error('Error loading banner groups:', err);
      setError('Banner grupları yüklenirken bir hata oluştu.');
      toast.error('Banner grupları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBannerGroups();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bu banner grubunu silmek istediğinize emin misiniz?')) {
      try {
        await deleteBannerGroup(id);
        toast.success('Banner grubu başarıyla silindi.');
        loadBannerGroups();
      } catch (err) {
        console.error('Error deleting banner group:', err);
        toast.error('Banner grubu silinirken bir hata oluştu.');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Banner Grupları</h1>
        <Link to="/admin/banner-groups/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Banner Grubu Ekle
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Ad</TableHead>
              <TableHead>Tür</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Oluşturulma Tarihi</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bannerGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Henüz banner grubu bulunmamaktadır.
                </TableCell>
              </TableRow>
            ) : (
              bannerGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>{group.id}</TableCell>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>{group.type}</TableCell>
                  <TableCell>
                    <Badge variant={group.active ? 'default' : 'secondary'}>
                      {group.active ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(group.createdAt).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Link to={`/admin/banner-groups/${group.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(group.id)}
                        disabled={!group.deletable}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
