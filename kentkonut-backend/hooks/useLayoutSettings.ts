'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { corporateApiFetch } from '@/utils/corporateApi';
import { 
  CorporateLayoutSettings, 
  ParsedLayoutSettings, 
  DEFAULT_LAYOUT_SETTINGS,
  validateSettingValue 
} from '@/types/layout-settings';

interface UseLayoutSettingsReturn {
  settings: CorporateLayoutSettings[];
  parsedSettings: ParsedLayoutSettings;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateSetting: (key: string, value: string, description?: string) => Promise<void>;
  getSetting: (key: string) => CorporateLayoutSettings | undefined;
  getGridClasses: () => string;
  getAnimationClasses: () => string;
}

export function useLayoutSettings(): UseLayoutSettingsReturn {
  const [settings, setSettings] = useState<CorporateLayoutSettings[]>([]);
  const [parsedSettings, setParsedSettings] = useState<ParsedLayoutSettings>(DEFAULT_LAYOUT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch layout settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching layout settings...');

      // Try main endpoint first, fallback to simple endpoint
      let result;
      try {
        result = await corporateApiFetch<any>('/api/admin/kurumsal/layout-settings');
      } catch (fetchError) {
        console.log('⚠️ Main endpoint error, trying simple endpoint...', fetchError);
        result = await corporateApiFetch<any>('/api/admin/kurumsal/layout-settings-simple');
      }
      console.log('📡 Layout settings response data:', result);

      if (!result.success) {
        throw new Error(result.error || 'Layout settings could not be retrieved');
      }

      setSettings(result.data.raw || []);
      setParsedSettings(result.data.parsed || DEFAULT_LAYOUT_SETTINGS);

      console.log('✅ Layout settings loaded successfully');

    } catch (err) {
      console.error('❌ Layout settings fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);

      // Use default settings on error (don't show error toast for now)
      console.log('⚠️ Using default layout settings due to API error');
      setParsedSettings(DEFAULT_LAYOUT_SETTINGS);

      // Create mock settings for display
      const mockSettings = [
        {
          id: 'mock1',
          key: 'cards_per_row',
          value: '3',
          description: 'Bir satırda kaç kart gösterileceği (1-6 arası)',
          type: 'number' as const,
          category: 'layout',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'mock2',
          key: 'card_spacing',
          value: 'medium',
          description: 'Kartlar arası boşluk (small, medium, large)',
          type: 'select' as const,
          category: 'layout',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      setSettings(mockSettings);

      // Show warning instead of error
      toast.warning('Layout ayarları API\'den yüklenemedi, varsayılan ayarlar kullanılıyor');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a specific setting
  const updateSetting = useCallback(async (key: string, value: string, description?: string): Promise<void> => {
    try {
      console.log('🔄 Updating layout setting:', { key, value, description });

      // Validate value before sending
      const validation = validateSettingValue(key, value);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const response = await fetch(`/api/admin/kurumsal/layout-settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, description })
      });

      console.log('📡 Update response status:', response.status);

      const result = await response.json();
      console.log('📡 Update response data:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Setting could not be updated');
      }

      // Refresh settings after update
      await fetchSettings();

      console.log('✅ Layout setting updated successfully');
      toast.success('Layout ayarı güncellendi');

    } catch (err) {
      console.error('❌ Layout setting update error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Update error';
      toast.error('Ayar güncellenirken hata oluştu: ' + errorMessage);
      throw err;
    }
  }, [fetchSettings]);

  // Get a specific setting
  const getSetting = useCallback((key: string): CorporateLayoutSettings | undefined => {
    return settings.find(setting => setting.key === key);
  }, [settings]);

  // Get CSS grid classes based on current settings
  const getGridClasses = useCallback((): string => {
    const { cardsPerRow, cardSpacing } = parsedSettings;
    
    const gridCols: Record<number, string> = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
    };

    const spacing: Record<string, string> = {
      small: 'gap-2',
      medium: 'gap-4',
      large: 'gap-6'
    };

    return `grid ${gridCols[cardsPerRow] || gridCols[3]} ${spacing[cardSpacing]}`;
  }, [parsedSettings]);

  // Get animation classes based on current settings
  const getAnimationClasses = useCallback((): string => {
    const { cardsAnimation } = parsedSettings;
    
    switch (cardsAnimation) {
      case 'fade':
        return 'animate-in fade-in duration-300';
      case 'slide':
        return 'animate-in slide-in-from-bottom-4 duration-300';
      default:
        return '';
    }
  }, [parsedSettings]);

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    parsedSettings,
    loading,
    error,
    refetch: fetchSettings,
    updateSetting,
    getSetting,
    getGridClasses,
    getAnimationClasses
  };
}

// Utility hook for quick access to parsed settings
export function useQuickLayoutSettings() {
  const { parsedSettings, loading } = useLayoutSettings();
  
  return {
    cardsPerRow: parsedSettings.cardsPerRow,
    cardSpacing: parsedSettings.cardSpacing,
    showPagination: parsedSettings.showPagination,
    cardsAnimation: parsedSettings.cardsAnimation,
    responsiveBreakpoints: parsedSettings.responsiveBreakpoints,
    loading
  };
}
