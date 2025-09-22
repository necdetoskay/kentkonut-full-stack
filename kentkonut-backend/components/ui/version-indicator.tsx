"use client";

import { useVersionInfo } from '@/hooks/useVersionInfo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar, Code, User, GitBranch } from 'lucide-react';

interface VersionIndicatorProps {
  className?: string;
  showBadge?: boolean;
  type?: 'current' | 'latest' | 'basic';
}

export function VersionIndicator({ 
  className, 
  showBadge = false, 
  type = 'current' 
}: VersionIndicatorProps) {
  const { versionInfo, loading, error } = useVersionInfo(type);

  const formatVersion = (version: string) => {
    return version.startsWith('v') ? version : `v${version}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Bilinmiyor';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'initial':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'feature':
        return 'bg-green-500 hover:bg-green-600';
      case 'bugfix':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'infrastructure':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'security':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'initial':
        return 'İlk Sürüm';
      case 'feature':
        return 'Özellik';
      case 'bugfix':
        return 'Hata Düzeltme';
      case 'infrastructure':
        return 'Altyapı';
      case 'security':
        return 'Güvenlik';
      default:
        return 'Genel';
    }
  };

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="w-12 h-4 bg-muted animate-pulse rounded" />
        {showBadge && <div className="w-16 h-5 bg-muted animate-pulse rounded" />}
      </div>
    );
  }

  if (error || !versionInfo) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        v1.0.0
      </span>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-2 cursor-pointer transition-colors hover:text-foreground",
            className
          )}>
            <span className="text-xs font-medium">
              {formatVersion(versionInfo.version)}
            </span>
            
            {showBadge && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs text-white border-0 transition-colors",
                  getTypeBadgeColor(versionInfo.type)
                )}
              >
                {getTypeLabel(versionInfo.type)}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        
        <TooltipContent side="top" className="max-w-sm p-4">
          <div className="space-y-3">
            {/* Version Header */}
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">
                {formatVersion(versionInfo.version)} - {versionInfo.title}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground">
              {versionInfo.description}
            </p>

            {/* Release Info */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(versionInfo.releaseDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{versionInfo.author}</span>
              </div>
            </div>

            {/* Changes */}
            {versionInfo.changes && versionInfo.changes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Code className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">Son Değişiklikler:</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  {versionInfo.changes.slice(0, 3).map((change, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-primary mt-1">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                  {versionInfo.changes.length > 3 && (
                    <li className="text-muted-foreground/70 italic">
                      +{versionInfo.changes.length - 3} daha fazla değişiklik...
                    </li>
                  )}
                </ul>
              </div>
            )}

            <div className="pt-2 border-t text-xs text-muted-foreground">
              Detaylar için versiyon yönetimi sayfasını ziyaret edin
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
