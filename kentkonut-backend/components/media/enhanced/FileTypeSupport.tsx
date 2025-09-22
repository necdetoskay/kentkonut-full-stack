"use client";

import { useState } from "react";
import { 
  Image, 
  FileText, 
  Film, 
  File, 
  Upload,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

// File type definitions and validation
export const ENHANCED_FILE_SUPPORT = {
  images: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'],
    mimeTypes: [
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'image/webp', 
      'image/svg+xml', 
      'image/bmp'
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    icon: Image,
    label: 'Görseller',
    description: 'Fotoğraf ve görsel dosyaları',
    features: ['Kırpma', 'Yeniden boyutlandırma', 'Optimizasyon', 'Metadata']
  },
  documents: {
    extensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
    mimeTypes: [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ],
    maxSize: 20 * 1024 * 1024, // 20MB
    icon: FileText,
    label: 'Belgeler',
    description: 'PDF, Word ve metin dosyaları',
    features: ['Önizleme', 'Metadata', 'Metin çıkarma']
  },
  videos: {
    extensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'],
    mimeTypes: [
      'video/mp4', 
      'video/avi', 
      'video/quicktime', 
      'video/webm',
      'video/x-msvideo',
      'video/x-flv'
    ],
    maxSize: 100 * 1024 * 1024, // 100MB
    icon: Film,
    label: 'Videolar',
    description: 'Video dosyaları',
    features: ['Thumbnail oluşturma', 'Sıkıştırma', 'Metadata']
  }
};

export type FileTypeCategory = keyof typeof ENHANCED_FILE_SUPPORT;

interface FileTypeSupportProps {
  selectedTypes: FileTypeCategory[];
  onTypeToggle: (type: FileTypeCategory) => void;
  showDetails?: boolean;
  layout?: 'tabs' | 'cards' | 'compact';
  className?: string;
}

interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileType: FileTypeCategory | null;
  size: number;
  formattedSize: string;
}

// Utility functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileTypeFromMime(mimeType: string): FileTypeCategory | null {
  for (const [type, config] of Object.entries(ENHANCED_FILE_SUPPORT)) {
    if (config.mimeTypes.includes(mimeType)) {
      return type as FileTypeCategory;
    }
  }
  return null;
}

export function getFileTypeFromExtension(filename: string): FileTypeCategory | null {
  const extension = '.' + filename.split('.').pop()?.toLowerCase();
  for (const [type, config] of Object.entries(ENHANCED_FILE_SUPPORT)) {
    if (config.extensions.includes(extension)) {
      return type as FileTypeCategory;
    }
  }
  return null;
}

export function validateFile(file: File): FileValidationResult {
  const result: FileValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    fileType: null,
    size: file.size,
    formattedSize: formatFileSize(file.size)
  };

  // Determine file type
  const typeFromMime = getFileTypeFromMime(file.type);
  const typeFromExtension = getFileTypeFromExtension(file.name);
  
  result.fileType = typeFromMime || typeFromExtension;

  if (!result.fileType) {
    result.isValid = false;
    result.errors.push('Desteklenmeyen dosya türü');
    return result;
  }

  const config = ENHANCED_FILE_SUPPORT[result.fileType];

  // Validate file size
  if (file.size > config.maxSize) {
    result.isValid = false;
    result.errors.push(
      `Dosya boyutu çok büyük. Maksimum: ${formatFileSize(config.maxSize)}`
    );
  }

  // Validate MIME type
  if (file.type && !config.mimeTypes.includes(file.type)) {
    result.warnings.push('Dosya türü tam olarak eşleşmiyor');
  }

  // File-specific validations
  if (result.fileType === 'images') {
    if (file.size < 1024) {
      result.warnings.push('Çok küçük görsel dosyası');
    }
  }

  if (result.fileType === 'videos') {
    if (file.size < 100 * 1024) {
      result.warnings.push('Çok küçük video dosyası');
    }
  }

  return result;
}

export function getAcceptedMimeTypes(types: FileTypeCategory[]): string[] {
  const mimeTypes: string[] = [];
  types.forEach(type => {
    mimeTypes.push(...ENHANCED_FILE_SUPPORT[type].mimeTypes);
  });
  return mimeTypes;
}

export function getAcceptedExtensions(types: FileTypeCategory[]): string[] {
  const extensions: string[] = [];
  types.forEach(type => {
    extensions.push(...ENHANCED_FILE_SUPPORT[type].extensions);
  });
  return extensions;
}

// File Type Support Component
export function FileTypeSupport({
  selectedTypes,
  onTypeToggle,
  showDetails = true,
  layout = 'cards',
  className = ""
}: FileTypeSupportProps) {
  const [activeTab, setActiveTab] = useState<FileTypeCategory>('images');

  if (layout === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {Object.entries(ENHANCED_FILE_SUPPORT).map(([type, config]) => {
          const isSelected = selectedTypes.includes(type as FileTypeCategory);
          const Icon = config.icon;
          
          return (
            <Button
              key={type}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onTypeToggle(type as FileTypeCategory)}
              className="flex items-center gap-1"
            >
              <Icon className="w-4 h-4" />
              {config.label}
            </Button>
          );
        })}
      </div>
    );
  }

  if (layout === 'tabs') {
    return (
      <div className={className}>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FileTypeCategory)}>
          <TabsList className="grid w-full grid-cols-3">
            {Object.entries(ENHANCED_FILE_SUPPORT).map(([type, config]) => {
              const Icon = config.icon;
              const isSelected = selectedTypes.includes(type as FileTypeCategory);
              
              return (
                <TabsTrigger 
                  key={type} 
                  value={type}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {config.label}
                  {isSelected && <CheckCircle className="w-3 h-3 text-green-500" />}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(ENHANCED_FILE_SUPPORT).map(([type, config]) => {
            const isSelected = selectedTypes.includes(type as FileTypeCategory);
            
            return (
              <TabsContent key={type} value={type} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{config.label}</h3>
                    <p className="text-sm text-gray-600">{config.description}</p>
                  </div>
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => onTypeToggle(type as FileTypeCategory)}
                  >
                    {isSelected ? 'Seçili' : 'Seç'}
                  </Button>
                </div>

                {showDetails && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Desteklenen Formatlar</h4>
                      <div className="flex flex-wrap gap-1">
                        {config.extensions.map(ext => (
                          <Badge key={ext} variant="secondary" className="text-xs">
                            {ext}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Özellikler</h4>
                      <div className="flex flex-wrap gap-1">
                        {config.features.map(feature => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Maksimum dosya boyutu: <strong>{formatFileSize(config.maxSize)}</strong>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    );
  }

  // Default: cards layout
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {Object.entries(ENHANCED_FILE_SUPPORT).map(([type, config]) => {
        const isSelected = selectedTypes.includes(type as FileTypeCategory);
        const Icon = config.icon;
        
        return (
          <div
            key={type}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              isSelected 
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onTypeToggle(type as FileTypeCategory)}
          >
            <div className="flex items-center gap-3 mb-3">
              <Icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-gray-600'}`} />
              <div className="flex-1">
                <h3 className="font-medium">{config.label}</h3>
                <p className="text-sm text-gray-600">{config.description}</p>
              </div>
              {isSelected && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>

            {showDetails && (
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Formatlar:</div>
                  <div className="flex flex-wrap gap-1">
                    {config.extensions.slice(0, 4).map(ext => (
                      <Badge key={ext} variant="secondary" className="text-xs">
                        {ext}
                      </Badge>
                    ))}
                    {config.extensions.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{config.extensions.length - 4}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Maks: {formatFileSize(config.maxSize)}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
