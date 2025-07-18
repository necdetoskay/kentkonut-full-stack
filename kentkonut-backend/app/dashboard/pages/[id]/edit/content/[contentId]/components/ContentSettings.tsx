'use client';

import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

interface PageContent {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  order: number;
  isActive: boolean;
  fullWidth: boolean;
  config?: any;
  alt?: string;
  caption?: string;
}

interface ContentSettingsProps {
  formData: PageContent;
  onUpdate: (updates: Partial<PageContent>) => void;
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'TEXT': return 'Metin İçeriği';
    case 'IMAGE': return 'Görsel İçeriği';
    case 'VIDEO': return 'Video İçeriği';
    default: return 'İçerik';
  }
};

export default function ContentSettings({ formData, onUpdate }: ContentSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>İçerik Ayarları</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="isActive" className="flex items-center space-x-2">
            {formData.isActive ? (
              <Eye className="w-4 h-4 text-green-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
            <span>Aktif</span>
          </Label>
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => onUpdate({ isActive: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="fullWidth">Tam Genişlik</Label>
          <Switch
            id="fullWidth"
            checked={formData.fullWidth}
            onCheckedChange={(checked) => onUpdate({ fullWidth: checked })}
          />
        </div>

        <div>
          <Label htmlFor="order">Sıra</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) => onUpdate({ order: parseInt(e.target.value) || 0 })}
            min="0"
            className="mt-1"
          />
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600">
            <strong>İçerik Tipi:</strong> {getTypeLabel(formData.type)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            <strong>ID:</strong> {formData.id}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
