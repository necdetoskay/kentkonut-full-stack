'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useMediaCategories } from '@/app/context/MediaCategoryContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Eye, EyeOff, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import BlockTypeTooltip from '@/components/help/BlockTypeTooltip';
import ContentBlocksHelpModal from '@/components/help/ContentBlocksHelpModal';
import { Editor } from '@tinymce/tinymce-react';
import { UnifiedTinyMCEEditor } from '@/components/tinymce';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { GlobalMediaSelector, GlobalMediaFile } from '@/components/media/GlobalMediaSelector';
import { MediaGallerySelector } from '@/components/media/MediaGallerySelector';
import { Image as ImageIcon, Video as VideoIcon, GripVertical } from 'lucide-react';
import ContentNavigationPanel from '@/components/content/ContentNavigationPanel';

// Drag & Drop artık ContentNavigationPanel'de

// SortableItem artık ContentNavigationPanel'de

interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
  isActive: boolean;
}

interface ContentBlock {
  id: string;
  type: string;
  title?: string;
  content?: string;
  config?: any;
  order: number;
  isActive: boolean;
}

interface NewContentEditorProps {
  page: Page;
  onContentUpdate: () => void;
}

const BLOCK_TYPES = [
  { type: 'text', label: 'Metin Bloğu', icon: '📝', description: 'Düz metin veya zengin metin içeriği' },
  { type: 'image', label: 'Görsel Bloğu', icon: '🖼️', description: 'Tek görsel veya resim galerisi' },
  { type: 'video', label: 'Video Bloğu', icon: '🎥', description: 'YouTube, Vimeo veya yerel video dosyası' },
  { type: 'gallery', label: 'Galeri Bloğu', icon: '🖼️', description: 'Çoklu görsel galerisi' },
  { type: 'cta', label: 'Eylem Çağrısı', icon: '🎯', description: 'Buton ve çağrı-eylem bileşenleri' },
  { type: 'quote', label: 'Alıntı Bloğu', icon: '💬', description: 'Alıntı, testimonyal ve referanslar' },
  { type: 'list', label: 'Liste Bloğu', icon: '📋', description: 'Sıralı, sırasız ve kontrol listeleri' },
  { type: 'divider', label: 'Ayırıcı Bloğu', icon: '➖', description: 'Görsel ayırıcılar ve ara bölümler' }
];

export default function NewContentEditor({ page, onContentUpdate }: NewContentEditorProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentEditorRef, setCurrentEditorRef] = useState<any>(null);
  const { data: session } = useSession();
  const { categories } = useMediaCategories();
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddContent, setShowAddContent] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string>('');

  // Drag & Drop artık ContentNavigationPanel'de yönetiliyor

  // Refs for scroll functionality
  const blockRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Drag & Drop sensors artık ContentNavigationPanel'de
  
  // Find "Sayfa İçerikleri" category for MediaSelector filtering
  const pageContentCategory = categories.find(cat => cat.name === 'Sayfa İçerikleri');
  const pageContentCategoryId = pageContentCategory?.id;
  useEffect(() => {
    if (page?.content) {
      parseContentBlocks(page.content);
    }
  }, [page?.content]);

  // Setup intersection observer for active block tracking
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const blockId = entry.target.getAttribute('data-block-id');
            if (blockId) {
              setActiveBlockId(blockId);
            }
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: '-100px 0px -100px 0px'
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Observe block elements when they're rendered
  useEffect(() => {
    if (observerRef.current) {
      Object.values(blockRefs.current).forEach(element => {
        if (element instanceof Element) {
          observerRef.current?.observe(element);
        }
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [contentBlocks]);

  // Scroll to block function
  const scrollToBlock = useCallback((blockId: string) => {
    const element = blockRefs.current[blockId];
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      setActiveBlockId(blockId);
    }
  }, []);

  // Set block ref
  const setBlockRef = useCallback((blockId: string, element: HTMLDivElement | null) => {
    if (element) {
      blockRefs.current[blockId] = element;
    } else {
      delete blockRefs.current[blockId];
    }
  }, []);

  const parseContentBlocks = (jsonContent: string) => {
    try {
      if (!jsonContent || jsonContent.trim() === '') {
        setContentBlocks([]);
        return;
      }

      // Try to parse JSON content
      const parsed = JSON.parse(jsonContent);
      
      if (Array.isArray(parsed)) {
        setContentBlocks(parsed);
      } else if (parsed.blocks && Array.isArray(parsed.blocks)) {
        setContentBlocks(parsed.blocks);
      } else {
        // If it's not structured content, create a single text block
        setContentBlocks([{
          id: 'legacy-content',
          type: 'text',
          title: 'İçerik',
          content: jsonContent,
          order: 0,
          isActive: true
        }]);
      }
    } catch (error) {
      // If it's not valid JSON, treat as plain text
      setContentBlocks([{
        id: 'legacy-content',
        type: 'text',
        title: 'İçerik',
        content: jsonContent,
        order: 0,
        isActive: true
      }]);
    }
  };

  // Galeri seçme fonksiyonları
  const handleGallerySelect = (files: GlobalMediaFile[]) => {
    if (files.length > 0 && currentEditorRef) {
      const file = files[0];
      const cleanUrl = getFullImageUrl(file.url);
      
      const imageHtml = `<img src="${cleanUrl}" alt="${file.alt || file.originalName || 'Seçilen görsel'}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); visibility: visible !important; opacity: 1 !important; display: block !important; border: 2px solid #007cba !important; background: #fff !important; min-height: 50px !important; min-width: 50px !important;" />`;
      
      currentEditorRef.insertContent(imageHtml);
      console.log('Galeri görseli eklendi:', file.originalName, 'Clean URL:', cleanUrl);
      toast.success('Görsel başarıyla eklendi!');
    }
    setIsGalleryOpen(false);
  };

  const setupEditor = (editor: any) => {
    editor.ui.registry.addButton('customgallery', {
      text: 'Galeri',
      onAction: () => {
        setCurrentEditorRef(editor);
        setIsGalleryOpen(true);
      }
    });
  };

  const onEditorInit = (evt: any, editor: any) => {
    setupEditor(editor);
  };

  const saveContentBlocks = async (skipContentUpdate = false) => {
    try {
      setSaving(true);

      const contentData = {
        blocks: contentBlocks,
        version: '2.0',
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(`/api/pages/${page.id}/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: JSON.stringify(contentData)
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('İçerik başarıyla kaydedildi');
        // Sadece manuel kaydetmede onContentUpdate çağır
        if (!skipContentUpdate) {
          onContentUpdate();
        }
      } else {
        toast.error('İçerik kaydedilirken hata oluştu: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('İçerik kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const addContentBlock = (blockType: string) => {
    const blockInfo = BLOCK_TYPES.find(t => t.type === blockType);
    
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: blockType,
      title: blockType === 'text' ? undefined : `Yeni ${blockInfo?.label || 'İçerik'}`,
      content: blockType === 'text' ? '<p>Buraya metninizi yazın...</p>' : '',
      config: getDefaultConfig(blockType),
      order: contentBlocks.length,
      isActive: true
    };

    setContentBlocks(prev => [...prev, newBlock]);
    setShowAddContent(false);
    toast.success('Yeni içerik bloğu eklendi');
  };

  const getDefaultConfig = (blockType: string) => {
    switch (blockType) {
      case 'image':
        return {
          imageUrl: '',
          alt: '',
          caption: '',
          alignment: 'center',
          width: '800',
          height: '600'
        };
      case 'video':
        return {
          videoUrl: '',
          autoplay: false,
          controls: true
        };
      case 'cta':
        return {
          buttonText: 'İletişime Geçin',
          buttonUrl: '/iletisim',
          description: '',
          style: 'primary',
          size: 'medium'
        };
      case 'quote':
        return {
          quote: '',
          author: '',
          authorTitle: '',
          style: 'default'
        };
      case 'list':
        return {
          items: [
            { text: 'Liste öğesi 1' },
            { text: 'Liste öğesi 2' },
            { text: 'Liste öğesi 3' }
          ],
          listType: 'bullet',
          style: 'default'
        };
      case 'gallery':
        return {
          images: [],
          layout: 'grid',
          columns: 3,
          spacing: 'normal'
        };
      case 'divider':
        return {
          style: 'line',
          color: '#e5e7eb',
          thickness: 1
        };
      default:
        return {};
    }
  };

  const updateContentBlock = (blockId: string, updates: Partial<ContentBlock>) => {
    console.log('🔄 updateContentBlock called for block:', blockId);
    console.log('📝 Updates:', updates);

    if (updates.config?.images) {
      console.log('🖼️ Gallery images update - New count:', updates.config.images.length);
      updates.config.images.forEach((img, index) => {
        console.log(`  ${index + 1}. ${img.alt} - ${img.url}`);
      });
    }

    setContentBlocks(prev => {
      const updated = prev.map(block => {
        if (block.id === blockId) {
          const updatedBlock = { ...block, ...updates };
          console.log('✅ Block updated:', updatedBlock.id, 'Type:', updatedBlock.type);
          if (updatedBlock.config?.images) {
            console.log('📊 Final gallery images count:', updatedBlock.config.images.length);
          }
          return updatedBlock;
        }
        return block;
      });

      console.log('🔄 Content blocks state updated');
      return updated;
    });
  };

  const deleteContentBlock = (blockId: string) => {
    if (!confirm('Bu içerik bloğunu silmek istediğinizden emin misiniz?')) {
      return;
    }

    setContentBlocks(prev => 
      prev.filter(block => block.id !== blockId)
        .map((block, index) => ({ ...block, order: index }))
    );
    
    toast.success('İçerik bloğu silindi');
  };

  // Navigation Panel'den gelen drag & drop handler
  const handleReorderBlocks = (reorderedBlocks: ContentBlock[]) => {
    // Mevcut tüm blokları al (aktif + inaktif)
    const currentBlocks = contentBlocks;
    const inactiveBlocks = currentBlocks.filter(block => !block.isActive);

    // Yeniden sıralanan aktif blokları + inaktif blokları birleştir
    const allBlocks = [...reorderedBlocks, ...inactiveBlocks];

    setContentBlocks(allBlocks);

    // Otomatik kaydetme (sayfa refresh'i olmadan)
    setTimeout(() => {
      saveContentBlocks(true); // skipContentUpdate = true
    }, 500);

    toast.success('Blok sıralaması güncellendi');
  };

  const toggleBlockVisibility = (blockId: string) => {
    setContentBlocks(prev => 
      prev.map(block => 
        block.id === blockId ? { ...block, isActive: !block.isActive } : block
      )
    );
  };
  const getBlockTypeInfo = (type: string) => {
    return BLOCK_TYPES.find(bt => bt.type === type) || { 
      type, 
      label: type.toUpperCase(), 
      icon: '📄', 
      description: 'Bilinmeyen içerik türü' 
    };
  };

  const renderBlockEditor = (block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`content-${block.id}`}>Metin İçeriği</Label>
              <div className="mt-2">
                <div className="p-3 bg-blue-50 border border-blue-200 text-sm rounded-lg mb-4">
                  ✅ <strong>TinyMCE Editor Aktif</strong> - Gelişmiş editör özellikleri ile
                </div>
                <UnifiedTinyMCEEditor
                  value={block.content || ''}
                  onChange={(content) => updateContentBlock(block.id, { content })}
                  height={400}
                  menubar={true}
                  enableGallery={true}
                  showPreviewPane={false}
                  showHtmlPane={false}
                  showDebugPane={false}
                  showConsolePane={false}
                />
              </div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`title-${block.id}`}>Başlık</Label>
              <Input
                id={`title-${block.id}`}
                value={block.title || ''}
                onChange={(e) => updateContentBlock(block.id, { title: e.target.value })}
                placeholder="Görsel başlığı"
              />
            </div>

            <div>
              <Label htmlFor={`imageUrl-${block.id}`}>Görsel URL (Zorunlu)</Label>
              <div className="flex mt-1 gap-2">
                <Input
                  id={`imageUrl-${block.id}`}
                  value={block.config?.imageUrl || ''}
                  onChange={(e) => updateContentBlock(block.id, { 
                    config: { ...block.config, imageUrl: e.target.value } 
                  })}
                  placeholder="https://example.com/image.jpg"
                  required
                  className="flex-1"                />                <GlobalMediaSelector
                  onSelect={(media: GlobalMediaFile) => {
                    updateContentBlock(block.id, {
                      config: {
                        ...block.config,
                        imageUrl: media.url,
                        alt: block.config?.alt || media.alt || media.originalName,
                        caption: block.config?.caption || media.caption
                      }
                    });
                  }}                  defaultCategory="content-images"
                  customFolder="media/sayfa"
                  trigger={
                    <Button type="button" variant="secondary" className="flex-shrink-0">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Görsel Seç
                    </Button>
                  }
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Görseli galeriden seçebilir veya yeni görsel yükleyebilirsiniz
              </p>
            </div>              <div>
              <Label htmlFor={`alt-${block.id}`}>Alt Text</Label>
              <Input
                id={`alt-${block.id}`}
                value={block.config?.alt || ''}
                onChange={(e) => updateContentBlock(block.id, { 
                  config: { ...block.config, alt: e.target.value } 
                })}
                placeholder="Görsel açıklaması"
              />
            </div>

            <div>
              <Label htmlFor={`caption-${block.id}`}>Açıklama</Label>
              <Textarea
                id={`caption-${block.id}`}
                value={block.config?.caption || ''}
                onChange={(e) => updateContentBlock(block.id, { 
                  config: { ...block.config, caption: e.target.value } 
                })}
                placeholder="Görsel altında gösterilecek açıklama"
                rows={3}
              />
            </div>

            {/* Görsel Önizlemesi */}
            {block.config?.imageUrl && (
              <div>
                <Label>Önizleme</Label>
                <div className="mt-2 border rounded-lg p-4 bg-gray-50">
                  <div className="relative">
                    <img 
                      src={block.config.imageUrl} 
                      alt={block.config?.alt || "Görsel önizleme"} 
                      className="max-w-full h-auto max-h-64 rounded-lg shadow-sm mx-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const errorElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (errorElement) errorElement.style.display = 'flex';
                      }}
                    />
                    <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="text-center p-4">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Görsel yüklenemedi</p>
                      </div>
                    </div>
                    
                    {block.config?.alt && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Alt Text:</strong> {block.config.alt}
                      </div>
                    )}
                    
                    {block.config?.caption && (
                      <div className="mt-1 text-sm text-gray-600">
                        <strong>Açıklama:</strong> {block.config.caption}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
              <div>
              <Label>Hedef Boyutlar</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor={`width-${block.id}`} className="text-sm text-gray-600">Genişlik (px)</Label>
                  <div className="space-y-3 mt-1">
                    <Input
                      id={`width-${block.id}`}
                      type="number"
                      min={100}
                      max={1200}
                      value={block.config?.width || '800'}
                      onChange={(e) => updateContentBlock(block.id, { 
                        config: { ...block.config, width: e.target.value } 
                      })}
                      placeholder="800"
                    />
                    <Slider
                      min={100}
                      max={1200}
                      step={50}
                      value={[parseInt(block.config?.width) || 800]}
                      onValueChange={(value) => updateContentBlock(block.id, { 
                        config: { ...block.config, width: value[0].toString() } 
                      })}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor={`height-${block.id}`} className="text-sm text-gray-600">Yükseklik (px)</Label>
                  <div className="space-y-3 mt-1">
                    <Input
                      id={`height-${block.id}`}
                      type="number"
                      min={100}
                      max={800}
                      value={block.config?.height || '600'}
                      onChange={(e) => updateContentBlock(block.id, { 
                        config: { ...block.config, height: e.target.value } 
                      })}
                      placeholder="600"
                    />
                    <Slider
                      min={100}
                      max={800}
                      step={50}
                      value={[parseInt(block.config?.height) || 600]}
                      onValueChange={(value) => updateContentBlock(block.id, { 
                        config: { ...block.config, height: value[0].toString() } 
                      })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`title-${block.id}`}>Başlık</Label>
              <Input
                id={`title-${block.id}`}
                value={block.title || ''}
                onChange={(e) => updateContentBlock(block.id, { title: e.target.value })}
                placeholder="Video başlığı"
              />
            </div>
            
            <div>
              <Label htmlFor={`videoUrl-${block.id}`}>Video URL (Zorunlu)</Label>
              <div className="flex mt-1 gap-2">
                <Input
                  id={`videoUrl-${block.id}`}
                  value={block.config?.videoUrl || ''}
                  onChange={(e) => updateContentBlock(block.id, { 
                    config: { ...block.config, videoUrl: e.target.value } 
                  })}
                  placeholder="YouTube, Vimeo veya video dosyası URL'si"
                  required
                  className="flex-1"                />
                
                <GlobalMediaSelector
                  onSelect={(media: GlobalMediaFile) => {
                    updateContentBlock(block.id, { 
                      config: { 
                        ...block.config, 
                        videoUrl: media.url,
                        caption: block.config?.caption || media.caption
                      }
                    });
                  }}                  defaultCategory="general"
                  trigger={
                    <Button type="button" variant="secondary" className="flex-shrink-0">
                      <VideoIcon className="w-4 h-4 mr-2" />
                      Video Seç
                    </Button>
                  }
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Videoyu galeriden seçebilir, yeni video yükleyebilir veya YouTube/Vimeo URL'si girebilirsiniz
              </p>
            </div>

            <div>
              <Label htmlFor={`caption-${block.id}`}>Açıklama</Label>
              <Textarea
                id={`caption-${block.id}`}
                value={block.config?.caption || ''}
                onChange={(e) => updateContentBlock(block.id, { 
                  config: { ...block.config, caption: e.target.value } 
                })}
                placeholder="Video altında gösterilecek açıklama"
                rows={3}
              />
            </div>

            {/* Video Önizlemesi */}
            {block.config?.videoUrl && (
              <div>
                <Label>Önizleme</Label>
                <div className="mt-2 border rounded-lg p-4 bg-gray-50">
                  <div className="relative">
                    {/* YouTube/Vimeo embed kontrolü */}
                    {(block.config.videoUrl.includes('youtube') || 
                      block.config.videoUrl.includes('youtu.be') || 
                      block.config.videoUrl.includes('vimeo')) ? (
                      <div className="relative w-full h-0 pb-[56.25%] bg-gray-200 rounded-lg overflow-hidden">
                        <iframe 
                          src={getEmbedUrl(block.config.videoUrl)}
                          className="absolute top-0 left-0 w-full h-full"
                          allowFullScreen
                          title={block.title || "Video önizleme"}
                        />
                      </div>
                    ) : (
                      /* Yerel video dosyası için */
                      <video 
                        src={block.config.videoUrl} 
                        controls
                        className="w-full max-h-64 rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const errorElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (errorElement) errorElement.style.display = 'flex';
                        }}
                      >
                        Tarayıcınız video formatını desteklemiyor.
                      </video>
                    )}
                    
                    <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="text-center p-4">
                        <VideoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Video yüklenemedi</p>
                      </div>
                    </div>
                    
                    {block.config?.caption && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Açıklama:</strong> {block.config.caption}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'cta':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`title-${block.id}`}>Başlık</Label>
              <Input
                id={`title-${block.id}`}
                value={block.title || ''}
                onChange={(e) => updateContentBlock(block.id, { title: e.target.value })}
                placeholder="CTA başlığı"
              />
            </div>
            
            <div>
              <Label htmlFor={`buttonText-${block.id}`}>Buton Metni</Label>
              <Input
                id={`buttonText-${block.id}`}
                value={block.config?.buttonText || ''}
                onChange={(e) => updateContentBlock(block.id, { 
                  config: { ...block.config, buttonText: e.target.value } 
                })}
                placeholder="İletişime Geçin"
              />
            </div>
            
            <div>
              <Label htmlFor={`buttonUrl-${block.id}`}>Buton URL</Label>
              <Input
                id={`buttonUrl-${block.id}`}
                value={block.config?.buttonUrl || ''}
                onChange={(e) => updateContentBlock(block.id, { 
                  config: { ...block.config, buttonUrl: e.target.value } 
                })}
                placeholder="/iletisim"
              />
            </div>
            
            <div>
              <Label htmlFor={`description-${block.id}`}>Açıklama</Label>
              <Textarea
                id={`description-${block.id}`}
                value={block.config?.description || ''}
                onChange={(e) => updateContentBlock(block.id, { 
                  config: { ...block.config, description: e.target.value } 
                })}
                placeholder="CTA açıklaması..."
                rows={3}
              />
            </div>
          </div>
        );

      case 'quote':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`title-${block.id}`}>Başlık</Label>
              <Input
                id={`title-${block.id}`}
                value={block.title || ''}
                onChange={(e) => updateContentBlock(block.id, { title: e.target.value })}
                placeholder="Alıntı başlığı"
              />
            </div>
            
            <div>
              <Label htmlFor={`quote-${block.id}`}>Alıntı Metni</Label>
              <Textarea
                id={`quote-${block.id}`}
                value={block.config?.quote || ''}
                onChange={(e) => updateContentBlock(block.id, { 
                  config: { ...block.config, quote: e.target.value } 
                })}
                placeholder="Alıntı metninizi buraya yazın..."
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor={`author-${block.id}`}>Yazar</Label>
              <Input
                id={`author-${block.id}`}
                value={block.config?.author || ''}
                onChange={(e) => updateContentBlock(block.id, { 
                  config: { ...block.config, author: e.target.value } 
                })}
                placeholder="Alıntının yazarı"
              />
            </div>
            
            <div>
              <Label htmlFor={`authorTitle-${block.id}`}>Yazar Unvanı</Label>
              <Input
                id={`authorTitle-${block.id}`}
                value={block.config?.authorTitle || ''}
                onChange={(e) => updateContentBlock(block.id, { 
                  config: { ...block.config, authorTitle: e.target.value } 
                })}
                placeholder="CEO, Müdür, vb."
              />
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`title-${block.id}`}>Başlık</Label>
              <Input
                id={`title-${block.id}`}
                value={block.title || ''}
                onChange={(e) => updateContentBlock(block.id, { title: e.target.value })}
                placeholder="Liste başlığı"
              />
            </div>
            
            <div>
              <Label>Liste Öğeleri</Label>
              <div className="space-y-2 mt-2">
                {(block.config?.items || []).map((item: any, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item.text || ''}
                      onChange={(e) => {
                        const newItems = [...(block.config?.items || [])];
                        newItems[index] = { ...item, text: e.target.value };
                        updateContentBlock(block.id, { 
                          config: { ...block.config, items: newItems } 
                        });
                      }}
                      placeholder={`Liste öğesi ${index + 1}`}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newItems = (block.config?.items || []).filter((_: any, i: number) => i !== index);
                        updateContentBlock(block.id, { 
                          config: { ...block.config, items: newItems } 
                        });
                      }}
                    >
                      Sil
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const newItems = [...(block.config?.items || []), { text: '' }];
                    updateContentBlock(block.id, { 
                      config: { ...block.config, items: newItems } 
                    });
                  }}
                >
                  Öğe Ekle
                </Button>
              </div>
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`title-${block.id}`}>Başlık</Label>
              <Input
                id={`title-${block.id}`}
                value={block.title || ''}
                onChange={(e) => updateContentBlock(block.id, { title: e.target.value })}
                placeholder="Galeri başlığı"
              />
            </div>

            <div>
              <Label>Galeri Görselleri</Label>
              <p className="text-sm text-gray-600 mb-4">
                Galeri için görseller ekleyin ve düzenleyin.
              </p>

              <MediaGallerySelector
                selectedItems={block.config?.images?.map((img: any) => ({
                  id: img.id || Math.random(),
                  url: img.url,
                  filename: img.alt || 'image',
                  originalName: img.alt || 'image',
                  alt: img.alt,
                  caption: img.caption,
                  mimeType: 'image/jpeg'
                })) || []}
                onSelectionChange={(selectedFiles: GlobalMediaFile[]) => {
                  console.log('🖼️ Page Gallery: onSelectionChange called with', selectedFiles.length, 'images');

                  const newImages = selectedFiles.map((file) => ({
                    id: file.id,
                    url: file.url,
                    alt: file.alt || file.originalName,
                    caption: file.caption || ''
                  }));

                  console.log('🔄 Updating gallery with page gallery selector:', newImages.length, 'images');

                  updateContentBlock(block.id, {
                    config: { ...block.config, images: newImages }
                  });

                  toast.success(`${newImages.length} görsel seçildi`);
                }}
                categoryId={5} // İçerik Resimleri kategorisi
                customFolder="media/sayfa"
                title="Sayfa Görselleri Seç"
                buttonText="Sayfa Görselleri Seç"
                addButtonText="Görsel Ekle"
                replaceButtonText="Değiştir"
              />
              
              {/* Galeri boşsa mesaj */}
              {(!block.config?.images || block.config.images.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Henüz galeriye görsel eklenmemiş</p>
                  <p className="text-sm">Yukarıdaki "Görsel Ekle" butonunu kullanarak görseller ekleyebilirsiniz</p>
                </div>
              )}
            </div>

            {/* Galeri ayarları */}
            {block.config?.images && block.config.images.length > 0 && (
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-3">Galeri Ayarları</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm">Düzen</Label>
                    <select
                      value={block.config?.layout || 'grid'}
                      onChange={(e) => updateContentBlock(block.id, {
                        config: { ...block.config, layout: e.target.value }
                      })}
                      className="w-full p-2 border rounded mt-1"
                    >
                      <option value="grid">Izgara</option>
                      <option value="carousel">Karusel</option>
                      <option value="masonry">Masonry</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-sm">Sütun Sayısı</Label>
                    <select
                      value={block.config?.columns || 3}
                      onChange={(e) => updateContentBlock(block.id, {
                        config: { ...block.config, columns: parseInt(e.target.value) }
                      })}
                      className="w-full p-2 border rounded mt-1"
                    >
                      <option value={2}>2 Sütun</option>
                      <option value={3}>3 Sütun</option>
                      <option value={4}>4 Sütun</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-sm">Boşluk</Label>
                    <select
                      value={block.config?.spacing || 'normal'}
                      onChange={(e) => updateContentBlock(block.id, {
                        config: { ...block.config, spacing: e.target.value }
                      })}
                      className="w-full p-2 border rounded mt-1"
                    >
                      <option value="compact">Sıkışık</option>
                      <option value="normal">Normal</option>
                      <option value="relaxed">Geniş</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'divider':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`title-${block.id}`}>Başlık</Label>
              <Input
                id={`title-${block.id}`}
                value={block.title || ''}
                onChange={(e) => updateContentBlock(block.id, { title: e.target.value })}
                placeholder="Ayırıcı başlığı (isteğe bağlı)"
              />
            </div>
            
            <div>
              <Label htmlFor={`style-${block.id}`}>Ayırıcı Stili</Label>
              <select
                id={`style-${block.id}`}
                value={block.config?.style || 'line'}
                onChange={(e) => updateContentBlock(block.id, { 
                  config: { ...block.config, style: e.target.value } 
                })}
                className="w-full p-2 border rounded"
              >
                <option value="line">Çizgi</option>
                <option value="dots">Nokta</option>
                <option value="wave">Dalga</option>
                <option value="space">Boşluk</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor={`color-${block.id}`}>Renk</Label>
              <Input
                id={`color-${block.id}`}
                type="color"
                value={block.config?.color || '#e5e7eb'}
                onChange={(e) => updateContentBlock(block.id, { 
                  config: { ...block.config, color: e.target.value } 
                })}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`title-${block.id}`}>Başlık</Label>
              <Input
                id={`title-${block.id}`}
                value={block.title || ''}
                onChange={(e) => updateContentBlock(block.id, { title: e.target.value })}
                placeholder="İçerik başlığı"
              />
            </div>
            
            <div>
              <Label>Gelişmiş Ayarlar (JSON)</Label>
              <Textarea
                value={JSON.stringify({ content: block.content, config: block.config }, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    updateContentBlock(block.id, { 
                      content: parsed.content,
                      config: parsed.config 
                    });
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          </div>
        );
    }
  };

  // Helper function to convert YouTube/Vimeo URLs to embed URLs
  const getEmbedUrl = (url: string): string => {
    // YouTube URL patterns
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Vimeo URL patterns
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    // Return original URL if no pattern matches
    return url;
  };

  if (!page) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Sayfa bilgisi yükleniyor...</div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-screen max-w-7xl mx-auto">
      {/* Main Content Editor - Left Side */}
      <div className="xl:col-span-3 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">İçerik Editörü</h2>
            <p className="text-gray-600 mt-1">
              {contentBlocks.length} içerik bloğu •
              <span className="ml-1">
                {contentBlocks.filter(b => b.isActive).length} aktif
              </span>
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
              <GripVertical className="w-4 h-4" />
              Sağdaki navigasyon panelinden blokları sürükleyerek yeniden sıralayabilirsiniz
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowHelpModal(true)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Yardım
            </Button>
            
            <Button
              onClick={saveContentBlocks}
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </div>

      {/* Add Content Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">İçerik Blokları</CardTitle>
              <CardDescription>
                Sayfanıza farklı türde içerik blokları ekleyebilirsiniz
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowAddContent(!showAddContent)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              İçerik Ekle
            </Button>
          </div>
        </CardHeader>

        {showAddContent && (
          <CardContent className="pt-0 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {BLOCK_TYPES.map((blockType) => (
                <BlockTypeTooltip key={blockType.type} blockType={blockType.type}>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center text-center gap-2 hover:bg-blue-50 hover:border-blue-200"
                    onClick={() => addContentBlock(blockType.type)}
                  >
                    <div className="text-2xl">{blockType.icon}</div>
                    <div>
                      <div className="text-sm font-medium">{blockType.label}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {blockType.description}
                      </div>
                    </div>
                  </Button>
                </BlockTypeTooltip>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Content Blocks with Drag & Drop */}
      <div className="space-y-6">
        {contentBlocks.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz içerik eklenmemiş
              </h3>
              <p className="text-gray-500 mb-6">
                Sayfanıza içerik eklemek için yukarıdaki "İçerik Ekle" butonunu kullanın
              </p>
              <Button
                onClick={() => setShowAddContent(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                İlk İçeriği Ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {contentBlocks
              .sort((a, b) => a.order - b.order)
              .map((block) => {
                const blockInfo = getBlockTypeInfo(block.type);

                return (
                  <Card
                    key={block.id}
                    className={`${!block.isActive ? 'opacity-60' : ''}`}
                    ref={(el) => setBlockRef(block.id, el)}
                    data-block-id={block.id}
                  >
                    <CardContent className="pt-6">
                      {/* Block Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-xl">{blockInfo.icon}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{blockInfo.label}</Badge>
                              <h3 className="font-semibold">{block.title || 'Başlıksız İçerik'}</h3>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {blockInfo.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleBlockVisibility(block.id)}
                          >
                            {block.isActive ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteContentBlock(block.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Sil
                          </Button>
                        </div>
                      </div>

                      {/* Block Edit Form */}
                      <div className="p-4 border rounded-lg bg-white">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm font-medium text-gray-700">✏️ İçerik Düzenle</span>
                        </div>
                        {renderBlockEditor(block)}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
      </div>

      {/* Content Navigation Panel - Right Side */}
      <div className="xl:col-span-1">
        <ContentNavigationPanel
          contentBlocks={contentBlocks}
          activeBlockId={activeBlockId}
          onNavigateToBlock={scrollToBlock}
          onReorderBlocks={handleReorderBlocks}
        />
      </div>

      {/* Help Modal - This component has its own trigger */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">İçerik Blokları Rehberi</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHelpModal(false)}
              >
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                İçerik blokları hakkında detaylı bilgi için aşağıdaki linki kullanabilirsiniz.
              </p>
              <ContentBlocksHelpModal />
            </div>
          </div>
        </div>
      )}

      {/* FloatImage CSS for preview */}
      <style jsx>{`
        :global(.content-display img[data-float="left"]) {
          float: left !important;
          margin: 0 20px 10px 0 !important;
          display: block !important;
          border-radius: 4px;
        }

        :global(.content-display img[data-float="right"]) {
          float: right !important;
          margin: 0 0 10px 20px !important;
          display: block !important;
          border-radius: 4px;
        }

        :global(.content-display img[data-float="none"]) {
          display: block !important;
          margin: 16px auto !important;
          border-radius: 4px;
        }

        :global(.content-display p) {
          margin: 0 0 16px 0;
          text-align: justify;
          min-height: 1.6em;
        }

        :global(.content-display h1) {
          margin: 24px 0 16px 0;
          font-size: 1.875em;
          font-weight: 700;
        }

        :global(.content-display h2) {
          margin: 24px 0 16px 0;
          font-size: 1.5em;
          font-weight: 600;
        }

        :global(.content-display ul),
        :global(.content-display ol) {
          margin: 0 0 16px 0;
          padding-left: 24px;
        }

        :global(.content-display li) {
          margin: 4px 0;
        }
      `}</style>
      
      <GlobalMediaSelector
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelect={handleGallerySelect}
        allowMultiple={false}
        mediaType="image"
      />
    </div>
  );
}
