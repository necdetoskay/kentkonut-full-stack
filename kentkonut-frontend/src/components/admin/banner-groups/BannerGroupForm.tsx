import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BannerGroup, createBannerGroup, getBannerGroup, updateBannerGroup } from '@/services/bannerGroupService';
import { toast } from 'sonner';

const animationTypes = [
  { value: 'FADE', label: 'Fade' },
  { value: 'SLIDE', label: 'Slide' },
  { value: 'ZOOM', label: 'Zoom' },
];

const playModes = [
  { value: 'AUTO', label: 'Otomatik' },
  { value: 'MANUAL', label: 'Manuel' },
];

type BannerGroupFormData = Omit<BannerGroup, 'id' | 'createdAt' | 'updatedAt'>;

export function BannerGroupForm() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BannerGroupFormData>({
    name: '',
    description: '',
    type: 'REGULAR',
    active: true,
    deletable: true,
    playMode: 'AUTO',
    duration: 5000,
    transitionDuration: 500,
    animation: 'FADE',
    width: 1200,
    height: 400,
  });

  useEffect(() => {
    if (isEditing) {
      const loadBannerGroup = async () => {
        try {
          setLoading(true);
          const data = await getBannerGroup(Number(id));
          setFormData(data);
        } catch (err) {
          console.error('Error loading banner group:', err);
          toast.error('Banner grubu yüklenirken bir hata oluştu.');
        } finally {
          setLoading(false);
        }
      };
      loadBannerGroup();
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (isEditing && id) {
        await updateBannerGroup(Number(id), formData);
        toast.success('Banner grubu başarıyla güncellendi.');
      } else {
        await createBannerGroup(formData);
        toast.success('Banner grubu başarıyla oluşturuldu.');
      }
      
      navigate('/admin/banner-groups');
    } catch (err) {
      console.error('Error saving banner group:', err);
      toast.error('Banner grubu kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <div className="flex justify-center p-8">Yükleniyor...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Banner Grubu Düzenle' : 'Yeni Banner Grubu Oluştur'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Grup Adı *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Örnek: Ana Sayfa Bannerları"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tür</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleSelectChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tür seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REGULAR">Standart</SelectItem>
                <SelectItem value="HERO">Hero</SelectItem>
                <SelectItem value="SIDEBAR">Yan Menü</SelectItem>
                <SelectItem value="POPUP">Popup</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="playMode">Oynatma Modu</Label>
            <Select
              value={formData.playMode}
              onValueChange={(value) => handleSelectChange('playMode', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Oynatma modu seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {playModes.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="animation">Geçiş Animasyonu</Label>
            <Select
              value={formData.animation}
              onValueChange={(value) => handleSelectChange('animation', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Animasyon seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {animationTypes.map((anim) => (
                  <SelectItem key={anim.value} value={anim.value}>
                    {anim.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="width">Genişlik (px)</Label>
            <Input
              id="width"
              name="width"
              type="number"
              value={formData.width}
              onChange={handleChange}
              min="100"
              step="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Yükseklik (px)</Label>
            <Input
              id="height"
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              min="100"
              step="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Gösterim Süresi (ms)</Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              min="1000"
              step="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transitionDuration">Geçiş Süresi (ms)</Label>
            <Input
              id="transitionDuration"
              name="transitionDuration"
              type="number"
              value={formData.transitionDuration}
              onChange={handleChange}
              min="100"
              step="100"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => handleSwitchChange('active', checked)}
            />
            <Label htmlFor="active">Aktif</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="deletable"
              checked={formData.deletable}
              onCheckedChange={(checked) => handleSwitchChange('deletable', checked)}
              disabled={isEditing}
            />
            <Label htmlFor="deletable">Silinebilir</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Açıklama</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={3}
            placeholder="Banner grubu hakkında açıklama..."
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/banner-groups')}
            disabled={loading}
          >
            İptal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </div>
  );
}
