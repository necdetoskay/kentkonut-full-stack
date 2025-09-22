"use client";

import { useRedisStatus } from '@/hooks/useRedisStatus';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface RedisStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export function RedisStatusIndicator({ className, showLabel = false }: RedisStatusIndicatorProps) {
  const { connected, error, timestamp, loading, refresh } = useRedisStatus();

  const getStatusColor = () => {
    if (loading) return 'bg-yellow-500 animate-pulse';
    return connected ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = () => {
    if (loading) return 'Redis durumu kontrol ediliyor...';
    if (connected) return 'Redis bağlı ve çalışıyor';
    return `Redis bağlantısı yok: ${error || 'Bilinmeyen hata'}`;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('tr-TR');
    } catch {
      return 'Bilinmiyor';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              className
            )}
            onClick={refresh}
          >
            {/* Status Light */}
            <div className="relative">
              <div 
                className={cn(
                  "w-3 h-3 rounded-full transition-colors duration-300",
                  getStatusColor()
                )}
              />
              {connected && (
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
              )}
            </div>
            
            {/* Optional Label */}
            {showLabel && (
              <span className="text-xs text-muted-foreground">
                Redis
              </span>
            )}
          </div>
        </TooltipTrigger>
        
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">
              {getStatusText()}
            </p>
            <p className="text-xs text-muted-foreground">
              Son kontrol: {formatTimestamp(timestamp)}
            </p>
            <p className="text-xs text-muted-foreground">
              Tıklayarak yenile • Her 10 saniyede otomatik kontrol
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
