'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Type, Image, Video, Grid, MousePointer, Quote, List, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BlockTypeTooltipProps {
  blockType: string;
  children: React.ReactNode;
  className?: string;
}

const blockInfo = {
  text: {
    title: 'Metin Bloğu',
    icon: Type,
    description: 'Zengin metin editörü ile düzenlenebilen içerik. Bold, italic, başlık formatları desteklenir.',
    features: ['Rich text editor', 'HTML formatları', 'Başlık seviyeleri'],
    example: 'Şirket hakkında bilgiler, açıklama metinleri',
    color: 'bg-blue-100 text-blue-800'
  },
  image: {
    title: 'Görsel Bloğu',
    icon: Image,
    description: 'Tek görsel yükleme ve görüntüleme. Alt text ve caption ekleme imkanı.',
    features: ['Alt text desteği', 'Caption ekleme', 'Responsive görüntüleme'],
    example: 'Ürün fotoğrafları, kurumsal görseller',
    color: 'bg-green-100 text-green-800'
  },
  gallery: {
    title: 'Galeri Bloğu',
    icon: Grid,
    description: 'Çoklu görsel galerisi. Grid layout ve lightbox görünümü.',
    features: ['Grid layout', 'Lightbox görünümü', 'Sürükle-bırak sıralama'],
    example: 'Proje galerisi, ofis fotoğrafları',
    color: 'bg-purple-100 text-purple-800'
  },
  video: {
    title: 'Video Bloğu',
    icon: Video,
    description: 'YouTube/Vimeo embed veya lokal video upload.',
    features: ['YouTube/Vimeo embed', 'Lokal video upload', 'Thumbnail oluşturma'],
    example: 'Tanıtım videoları, eğitim içerikleri',
    color: 'bg-red-100 text-red-800'
  },
  cta: {
    title: 'Eylem Çağrısı',
    icon: MousePointer,
    description: 'Call-to-Action butonları. Link yönlendirmesi ve stil seçenekleri.',
    features: ['Özelleştirilebilir buton', 'Link yönlendirmesi', 'Stil seçenekleri'],
    example: '"İletişime Geç", "Daha Fazla Bilgi" butonları',
    color: 'bg-orange-100 text-orange-800'
  },
  quote: {
    title: 'Alıntı Bloğu',
    icon: Quote,
    description: 'Özel alıntı ve testimonial alanı. Yazar bilgisi eklenebilir.',
    features: ['Yazar adı ve unvanı', 'Özel styling', 'İkon desteği'],
    example: 'Müşteri yorumları, önemli alıntılar',
    color: 'bg-indigo-100 text-indigo-800'
  },
  list: {
    title: 'Liste Bloğu',
    icon: List,
    description: 'Yapılandırılmış liste içeriği. Numaralı ve madde işaretli listeler.',
    features: ['Numaralı/madde işaretli', 'İkon destekli listeler', 'Çok seviyeli listeler'],
    example: 'Özellik listeleri, adım adım süreçler',
    color: 'bg-teal-100 text-teal-800'
  },
  divider: {
    title: 'Ayırıcı Bloğu',
    icon: Minus,
    description: 'İçerik bölümleri arası görsel ayırıcı. Stil özelleştirmesi.',
    features: ['Farklı stil seçenekleri', 'Kalınlık ayarları', 'Renk özelleştirmesi'],
    example: 'Bölüm geçişleri, görsel ayrım',
    color: 'bg-gray-100 text-gray-800'
  }
};

export default function BlockTypeTooltip({ blockType, children, className = '' }: BlockTypeTooltipProps) {
  const info = blockInfo[blockType as keyof typeof blockInfo];
  
  if (!info) {
    return <div className={className}>{children}</div>;
  }

  const IconComponent = info.icon;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1 ${className}`}>
            {children}
            <HelpCircle className="h-3 w-3 text-gray-400 hover:text-blue-600 cursor-help transition-colors" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm p-4 bg-white border shadow-lg">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-100 rounded">
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">{info.title}</h4>
                <Badge className={`${info.color} text-xs px-1.5 py-0.5`} variant="secondary">
                  {blockType}
                </Badge>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 leading-relaxed">{info.description}</p>

            {/* Features */}
            <div>
              <h5 className="text-xs font-medium text-gray-600 mb-1">Özellikler:</h5>
              <ul className="space-y-0.5">
                {info.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-1 h-1 bg-blue-500 rounded-full flex-shrink-0"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Example */}
            <div className="bg-gray-50 p-2 rounded text-xs">
              <span className="font-medium text-gray-600">Örnek kullanım:</span>
              <p className="text-gray-700 italic mt-0.5">{info.example}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
