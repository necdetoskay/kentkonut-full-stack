'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import { Settings, Grid, Move, Zap, Eye, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export function LayoutSettings() {
  const { 
    parsedSettings, 
    loading, 
    updateSetting, 
    getGridClasses, 
    getAnimationClasses 
  } = useLayoutSettings();

  const [localSettings, setLocalSettings] = useState(parsedSettings);
  const [saving, setSaving] = useState(false);

  // Update local settings when parsed settings change
  React.useEffect(() => {
    setLocalSettings(parsedSettings);
  }, [parsedSettings]);

  const handleSave = async () => {
    try {
      setSaving(true);

      // Update each changed setting
      const updates = [];

      if (localSettings.cardsPerRow !== parsedSettings.cardsPerRow) {
        updates.push(updateSetting('cards_per_row', localSettings.cardsPerRow.toString()));
      }

      if (localSettings.cardSpacing !== parsedSettings.cardSpacing) {
        updates.push(updateSetting('card_spacing', localSettings.cardSpacing));
      }

      if (localSettings.showPagination !== parsedSettings.showPagination) {
        updates.push(updateSetting('show_pagination', localSettings.showPagination.toString()));
      }

      if (localSettings.cardsAnimation !== parsedSettings.cardsAnimation) {
        updates.push(updateSetting('cards_animation', localSettings.cardsAnimation));
      }

      if (JSON.stringify(localSettings.responsiveBreakpoints) !== JSON.stringify(parsedSettings.responsiveBreakpoints)) {
        updates.push(updateSetting('responsive_breakpoints', JSON.stringify(localSettings.responsiveBreakpoints)));
      }

      if (localSettings.maxCardsPerPage !== parsedSettings.maxCardsPerPage) {
        updates.push(updateSetting('max_cards_per_page', localSettings.maxCardsPerPage.toString()));
      }

      await Promise.all(updates);

      if (updates.length > 0) {
        toast.success('Layout ayarları kaydedildi');
      } else {
        toast.info('Değişiklik yapılmadı');
      }

    } catch (error) {
      console.error('Save error:', error);
      toast.error('Ayarlar kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(parsedSettings);
    toast.info('Değişiklikler geri alındı');
  };

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(parsedSettings);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Layout Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Layout Ayarları
        </CardTitle>
        <CardDescription>
          Kurumsal kartların frontend'de nasıl görüneceğini ayarlayın
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Grid Layout Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            <h3 className="text-sm font-medium">Grid Düzeni</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cardsPerRow">Sütun Sayısı</Label>
              <Select
                value={localSettings.cardsPerRow.toString()}
                onValueChange={(value) => setLocalSettings(prev => ({ 
                  ...prev, 
                  cardsPerRow: parseInt(value) 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Sütun</SelectItem>
                  <SelectItem value="2">2 Sütun</SelectItem>
                  <SelectItem value="3">3 Sütun</SelectItem>
                  <SelectItem value="4">4 Sütun</SelectItem>
                  <SelectItem value="5">5 Sütun</SelectItem>
                  <SelectItem value="6">6 Sütun</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxCards">Maksimum Kart Sayısı</Label>
              <Input
                id="maxCards"
                type="number"
                min="1"
                max="100"
                value={localSettings.maxCardsPerPage}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  maxCardsPerPage: parseInt(e.target.value) || 12 
                }))}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Spacing Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Move className="h-4 w-4" />
            <h3 className="text-sm font-medium">Boşluk Ayarları</h3>
          </div>

          <div className="space-y-2">
            <Label>Kartlar Arası Boşluk</Label>
            <Select
              value={localSettings.cardSpacing}
              onValueChange={(value: 'small' | 'medium' | 'large') => 
                setLocalSettings(prev => ({ ...prev, cardSpacing: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Küçük</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="large">Büyük</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Animation Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <h3 className="text-sm font-medium">Animasyon Ayarları</h3>
          </div>

          <div className="space-y-2">
            <Label>Kart Animasyonu</Label>
            <Select
              value={localSettings.cardsAnimation}
              onValueChange={(value: 'none' | 'fade' | 'slide') => 
                setLocalSettings(prev => ({ ...prev, cardsAnimation: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Animasyon Yok</SelectItem>
                <SelectItem value="fade">Fade In</SelectItem>
                <SelectItem value="slide">Slide In</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Other Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <h3 className="text-sm font-medium">Görünüm Ayarları</h3>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sayfalama Göster</Label>
              <p className="text-sm text-muted-foreground">
                Çok fazla kart olduğunda sayfalama gösterilsin
              </p>
            </div>
            <Switch
              checked={localSettings.showPagination}
              onCheckedChange={(checked) => 
                setLocalSettings(prev => ({ ...prev, showPagination: checked }))
              }
            />
          </div>
        </div>

        <Separator />

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Önizleme</h3>
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground mb-2">CSS Classes:</div>
            <Badge variant="outline" className="text-xs">
              {getGridClasses()}
            </Badge>
            {localSettings.cardsAnimation !== 'none' && (
              <Badge variant="outline" className="text-xs ml-2">
                {getAnimationClasses()}
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || saving}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Geri Al
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
