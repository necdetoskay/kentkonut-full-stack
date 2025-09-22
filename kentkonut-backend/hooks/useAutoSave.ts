import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void>;
  delay?: number; // milliseconds
  enabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useAutoSave({
  data,
  onSave,
  delay = 30000, // 30 seconds default
  enabled = true,
  onSuccess,
  onError
}: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');
  const isSavingRef = useRef(false);

  const performAutoSave = useCallback(async () => {
    if (!enabled || isSavingRef.current) return;

    const currentDataString = JSON.stringify(data);
    
    // Don't save if data hasn't changed
    if (currentDataString === lastSavedDataRef.current) return;

    try {
      isSavingRef.current = true;
      await onSave(data);
      lastSavedDataRef.current = currentDataString;
      
      toast.success('Otomatik kaydetme tamamlandı', {
        duration: 2000,
        position: 'bottom-right'
      });
      
      onSuccess?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Auto-save failed');
      
      toast.error('Otomatik kaydetme başarısız', {
        description: 'Değişikliklerinizi manuel olarak kaydetmeyi unutmayın.',
        duration: 4000,
        position: 'bottom-right'
      });
      
      onError?.(err);
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave, enabled, onSuccess, onError]);

  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(performAutoSave, delay);

    // Cleanup on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, performAutoSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Manual trigger function
  const triggerAutoSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    performAutoSave();
  }, [performAutoSave]);

  return {
    triggerAutoSave,
    isAutoSaving: isSavingRef.current
  };
}
