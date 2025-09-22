'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle, 
  Type, 
  Image, 
  Video, 
  Grid, 
  MousePointer, 
  Quote, 
  List, 
  Minus,
  Lightbulb,
  Zap,
  BookOpen
} from 'lucide-react';

const contentBlocks = [
  {
    type: 'text',
    name: 'Metin Bloğu',
    icon: Type,
    description: 'Zengin metin editörü ile düzenlenebilen metin içeriği',
    detailedDescription: 'HTML formatları, başlık seviyeleri, liste formatları ve link ekleme özellikleri ile zengin içerik oluşturun.',
    features: ['Rich text editor (TipTap)', 'Bold, italic, underline formatları', 'Başlık seviyeleri (H1-H6)', 'Numaralı ve madde işaretli listeler', 'Link ekleme ve düzenleme', 'Paragraf stilleri'],
    example: 'Şirket hakkında bilgiler, açıklama metinleri, blog yazıları',
    color: 'bg-blue-100 text-blue-800',
    tips: ['Başlık hiyerarşisine dikkat edin', 'Metinleri kısa paragraflar halinde yazın', 'Önemli bilgileri bold yaparak vurgulayın']
  },
  {
    type: 'image',
    name: 'Görsel Bloğu',
    icon: Image,
    description: 'Tek görsel yükleme ve görüntüleme',
    detailedDescription: 'Yüksek kaliteli görselleri alt text ve caption ile birlikte yükleyerek erişilebilir içerik oluşturun.',
    features: ['Drag & drop yükleme', 'Alt text desteği (SEO için önemli)', 'Caption/açıklama ekleme', 'Responsive görüntüleme', 'Görsel optimizasyonu', 'Farklı boyut seçenekleri'],
    example: 'Ürün fotoğrafları, kurumsal görseller, infografikler',
    color: 'bg-green-100 text-green-800',
    tips: ['Alt text mutlaka ekleyin', 'Yüksek çözünürlüklü görseller kullanın', 'Dosya boyutuna dikkat edin']
  },
  {
    type: 'gallery',
    name: 'Galeri Bloğu',
    icon: Grid,
    description: 'Çoklu görsel galerisi',
    detailedDescription: 'Birden fazla görseli düzenli bir grid layout ile sergileyerek etkileyici galeriler oluşturun.',
    features: ['Çoklu görsel yükleme', 'Grid layout seçenekleri', 'Lightbox görünümü', 'Sürükle-bırak ile sıralama', 'Bulk upload desteği', 'Görsel filtreleme'],
    example: 'Proje galerisi, ofis fotoğrafları, ürün kataloğu',
    color: 'bg-purple-100 text-purple-800',
    tips: ['Benzer boyutlarda görseller kullanın', 'Görselleri mantıklı sırayla düzenleyin', 'Çok fazla görsel eklemekten kaçının']
  },
  {
    type: 'video',
    name: 'Video Bloğu',
    icon: Video,
    description: 'Video embed veya upload',
    detailedDescription: 'YouTube, Vimeo gibi platformlardan video embed edin veya lokal videolarınızı yükleyin.',
    features: ['YouTube/Vimeo embed', 'Lokal video upload', 'Otomatik thumbnail oluşturma', 'Video kontrolü ayarları', 'Responsive video player', 'Video sıkıştırma'],
    example: 'Tanıtım videoları, eğitim içerikleri, müşteri testimonialları',
    color: 'bg-red-100 text-red-800',
    tips: ['Video boyutunu optimize edin', 'Thumbnail seçimine özen gösterin', 'Embed linklerini kontrol edin']
  },
  {
    type: 'cta',
    name: 'Eylem Çağrısı (CTA)',
    icon: MousePointer,
    description: 'Call-to-Action butonları',
    detailedDescription: 'Kullanıcıları belirli eylemlere yönlendiren etkili butonlar ve call-to-action alanları oluşturun.',
    features: ['Özelleştirilebilir buton metni', 'İç/dış link yönlendirmesi', 'Farklı stil seçenekleri', 'Hover efektleri', 'Tıklama izleme', 'Responsive tasarım'],
    example: '"İletişime Geçin", "Daha Fazla Bilgi", "Hemen Başlayın" butonları',
    color: 'bg-orange-100 text-orange-800',
    tips: ['Net ve anlaşılır metinler kullanın', 'Kontrast renkler seçin', 'Sayfa başına fazla CTA koymayın']
  },
  {
    type: 'quote',
    name: 'Alıntı Bloğu',
    icon: Quote,
    description: 'Özel alıntı ve testimonial alanı',
    detailedDescription: 'Müşteri yorumları, önemli alıntılar ve testimoniallar için özel tasarlanmış blok.',
    features: ['Yazar adı ve unvanı', 'Özel alıntı stilleri', 'İkon ve avatar desteği', 'Farklı layout seçenekleri', 'Yıldız rating sistemi', 'Sosyal medya linkleri'],
    example: 'Müşteri yorumları, uzman görüşleri, başarı hikayeleri',
    color: 'bg-indigo-100 text-indigo-800',
    tips: ['Gerçek müşteri yorumları kullanın', 'Yazar bilgilerini ekleyin', 'Kısa ve etkili alıntılar seçin']
  },
  {
    type: 'list',
    name: 'Liste Bloğu',
    icon: List,
    description: 'Yapılandırılmış liste içeriği',
    detailedDescription: 'Bilgileri düzenli ve okunabilir listeler halinde sunarak içeriğinizi yapılandırın.',
    features: ['Numaralı/madde işaretli listeler', 'İkon destekli listeler', 'Çok seviyeli nested listeler', 'Farklı stil seçenekleri', 'Checkbox listeler', 'Drag & drop sıralama'],
    example: 'Özellik listeleri, adım adım süreçler, kontrol listesi',
    color: 'bg-teal-100 text-teal-800',
    tips: ['Benzer konuları gruplayın', 'Kısa ve net maddeler yazın', 'Önemli maddeleri vurgulayın']
  },
  {
    type: 'divider',
    name: 'Ayırıcı Bloğu',
    icon: Minus,
    description: 'İçerik bölümleri arası görsel ayırıcı',
    detailedDescription: 'Farklı içerik bölümleri arasında görsel ayrım oluşturarak sayfanızı düzenleyin.',
    features: ['Farklı stil seçenekleri', 'Kalınlık ve renk ayarları', 'Gradient efektler', 'Decorative elementler', 'Spacing kontrolü', 'Animation desteği'],
    example: 'Bölüm geçişleri, konular arası ayrım, görsel düzenleme',
    color: 'bg-gray-100 text-gray-800',
    tips: ['Fazla kullanmaktan kaçının', 'Sayfa tasarımına uygun stiller seçin', 'Minimal tasarım tercih edin']
  }
];

const usageTips = [
  {
    icon: Zap,
    title: 'Hızlı İpuçları',
    tips: [
      'Blokları sürükleyerek yeniden sıralayabilirsiniz',
      'Her bloğun kendine özgü ayarları vardır',
      'Önizleme ile sonucu kontrol edin',
      'Mobile görünümü test etmeyi unutmayın'
    ]
  },
  {
    icon: Lightbulb,
    title: 'Best Practices',
    tips: [
      'Sayfa yükleme hızını düşünün',
      'SEO dostu içerik oluşturun',
      'Kullanıcı deneyimini önceleyhin',
      'Erişilebilirlik standartlarına uyun'
    ]
  }
];

export default function ContentBlocksHelpModal() {
  const [selectedBlock, setSelectedBlock] = useState<string>('text');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BookOpen className="h-4 w-4" />
          İçerik Blokları Rehberi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            İçerik Blokları Rehberi
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="blocks" className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="blocks">Blok Türleri</TabsTrigger>
            <TabsTrigger value="tips">İpuçları & Best Practices</TabsTrigger>
          </TabsList>
          
          <TabsContent value="blocks" className="mt-6 h-full overflow-y-auto">
            <div className="grid md:grid-cols-3 gap-6 h-full">
              {/* Blok Listesi */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-600 mb-3">BLOK TÜRLERİ</h3>
                {contentBlocks.map((block) => {
                  const IconComponent = block.icon;
                  return (
                    <Card
                      key={block.type}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedBlock === block.type ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedBlock(block.type)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{block.name}</h4>
                            <p className="text-xs text-gray-600 line-clamp-2">{block.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Detay Paneli */}
              <div className="md:col-span-2 space-y-4 overflow-y-auto">
                {(() => {
                  const block = contentBlocks.find(b => b.type === selectedBlock);
                  if (!block) return null;
                  const IconComponent = block.icon;
                  
                  return (
                    <>
                      {/* Header */}
                      <div className="flex items-center gap-3 pb-4 border-b">
                        <div className="p-3 bg-gray-100 rounded-lg">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{block.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={block.color} variant="secondary">
                              {block.type}
                            </Badge>
                            <span className="text-sm text-gray-600">{block.description}</span>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Description */}
                      <div>
                        <h4 className="font-medium mb-2">Açıklama</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">{block.detailedDescription}</p>
                      </div>

                      {/* Features */}
                      <div>
                        <h4 className="font-medium mb-3">Özellikler</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {block.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Example */}
                      <div>
                        <h4 className="font-medium mb-2">Kullanım Örnekleri</h4>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
                          <p className="text-sm text-gray-700 italic">{block.example}</p>
                        </div>
                      </div>

                      {/* Tips */}
                      <div>
                        <h4 className="font-medium mb-2">💡 İpuçları</h4>
                        <div className="space-y-2">
                          {block.tips.map((tip, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm p-2 bg-yellow-50 rounded border-l-2 border-yellow-400">
                              <Lightbulb className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                              {tip}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tips" className="mt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {usageTips.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">{section.title}</h3>
                      </div>
                      <div className="space-y-3">
                        {section.tips.map((tip, tipIndex) => (
                          <div key={tipIndex} className="flex items-start gap-2 text-sm">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
                            <span className="text-gray-700">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Genel Bilgiler */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 text-blue-900">🚀 Başlarken</h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>• Her sayfada hikayenizi anlatacak blokları seçin</p>
                  <p>• Kullanıcı deneyimini düşünerek sıralama yapın</p>
                  <p>• Mobile cihazlarda nasıl göründüğünü kontrol edin</p>
                  <p>• SEO için her bloğun ayarlarını optimize edin</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
