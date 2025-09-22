'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Eye, EyeOff, Trash2, GripVertical } from 'lucide-react';
import { UnifiedTinyMCEEditor } from '@/components/tinymce';
import { useState, useRef, useCallback } from 'react';
import { ContentBlock, BLOCK_TYPES } from '../hooks/useContentBlocks';
import BlockTypeTooltip from '@/components/help/BlockTypeTooltip';

interface ContentEditorSectionProps {
  contentBlocks: ContentBlock[];
  showAddContent: boolean;
  onShowAddContentChange: (show: boolean) => void;
  onAddContentBlock: (type: string) => void;
  onUpdateContentBlock: (id: string, updates: Partial<ContentBlock>) => void;
  onDeleteContentBlock: (id: string) => void;
  onToggleBlockVisibility: (id: string) => void;
}

export default function ContentEditorSection({
  contentBlocks,
  showAddContent,
  onShowAddContentChange,
  onAddContentBlock,
  onUpdateContentBlock,
  onDeleteContentBlock,
  onToggleBlockVisibility
}: ContentEditorSectionProps) {
  // UnifiedTinyMCEEditor dahili galeri yönetimine sahip; ek state gerektirmez

  const getBlockTypeInfo = (type: string) => {
    return BLOCK_TYPES.find(bt => bt.type === type) || { 
      type, 
      label: type, 
      icon: '📄', 
      description: 'Bilinmeyen blok tipi' 
    };
  };

  // Eski TinyMCE setup/galeri akışı UnifiedTinyMCEEditor ile gereksiz

  const renderBlockEditor = (block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`content-${block.id}`}>Metin İçeriği</Label>
              <div className="mt-2">
                <UnifiedTinyMCEEditor
                  value={block.content || ''}
                  onChange={(content) => onUpdateContentBlock(block.id, { content })}
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
                onChange={(e) => onUpdateContentBlock(block.id, { title: e.target.value })}
                placeholder="Görsel başlığı"
              />
            </div>
            
            <div>
              <Label>Görsel Seç</Label>
              <div className="mt-2">
                <GlobalMediaSelector
                  onSelect={(media: GlobalMediaFile) => {
                    onUpdateContentBlock(block.id, { 
                      content: media.url,
                      config: { 
                        ...block.config, 
                        alt: media.alt || '',
                        caption: media.caption || ''
                      }
                    });
                  }}
                  acceptedTypes={['image/*']}
                  customFolder="media/sayfa"
                />
              </div>
            </div>

            {block.content && (
              <div className="mt-4">
                <img 
                  src={block.content} 
                  alt={block.config?.alt || ''} 
                  className="max-w-full h-auto rounded-lg border"
                />
              </div>
            )}

            <div>
              <Label htmlFor={`alt-${block.id}`}>Alt Metni</Label>
              <Input
                id={`alt-${block.id}`}
                value={block.config?.alt || ''}
                onChange={(e) => onUpdateContentBlock(block.id, { 
                  config: { ...block.config, alt: e.target.value }
                })}
                placeholder="Görsel açıklaması"
              />
            </div>

            <div>
              <Label htmlFor={`caption-${block.id}`}>Açıklama</Label>
              <Input
                id={`caption-${block.id}`}
                value={block.config?.caption || ''}
                onChange={(e) => onUpdateContentBlock(block.id, { 
                  config: { ...block.config, caption: e.target.value }
                })}
                placeholder="Görsel açıklaması"
              />
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
                onChange={(e) => onUpdateContentBlock(block.id, { title: e.target.value })}
                placeholder="Video başlığı"
              />
            </div>
            
            <div>
              <Label htmlFor={`video-url-${block.id}`}>Video URL</Label>
              <Input
                id={`video-url-${block.id}`}
                value={block.content || ''}
                onChange={(e) => onUpdateContentBlock(block.id, { content: e.target.value })}
                placeholder="YouTube, Vimeo veya doğrudan video URL'si"
              />
            </div>
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
                onChange={(e) => onUpdateContentBlock(block.id, { title: e.target.value })}
                placeholder="Eylem çağrısı başlığı"
              />
            </div>
            
            <div>
              <Label htmlFor={`content-${block.id}`}>Açıklama</Label>
              <Textarea
                id={`content-${block.id}`}
                value={block.content || ''}
                onChange={(e) => onUpdateContentBlock(block.id, { content: e.target.value })}
                placeholder="Eylem çağrısı açıklaması"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor={`button-text-${block.id}`}>Buton Metni</Label>
              <Input
                id={`button-text-${block.id}`}
                value={block.config?.buttonText || ''}
                onChange={(e) => onUpdateContentBlock(block.id, { 
                  config: { ...block.config, buttonText: e.target.value }
                })}
                placeholder="Buton metni"
              />
            </div>

            <div>
              <Label htmlFor={`button-url-${block.id}`}>Buton URL</Label>
              <Input
                id={`button-url-${block.id}`}
                value={block.config?.buttonUrl || ''}
                onChange={(e) => onUpdateContentBlock(block.id, { 
                  config: { ...block.config, buttonUrl: e.target.value }
                })}
                placeholder="https://example.com"
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
                onChange={(e) => onUpdateContentBlock(block.id, { title: e.target.value })}
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
                    onUpdateContentBlock(block.id, { 
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

  return (
    <div className="space-y-6">
      {/* Add Content Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">İçerik Blokları</h3>
          <p className="text-sm text-gray-600">
            Sayfanıza farklı türde içerik blokları ekleyebilirsiniz
          </p>
        </div>
        <Button
          type="button"
          onClick={() => onShowAddContentChange(!showAddContent)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          İçerik Ekle
        </Button>
      </div>

      {showAddContent && (
        <Card>
          <CardHeader>
            <CardTitle>Yeni İçerik Bloğu Ekle</CardTitle>
            <CardDescription>
              Eklemek istediğiniz içerik türünü seçin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {BLOCK_TYPES.map((blockType) => (
                <BlockTypeTooltip key={blockType.type} blockType={blockType.type}>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center text-center gap-2 hover:bg-blue-50 hover:border-blue-200"
                    onClick={() => onAddContentBlock(blockType.type)}
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
        </Card>
      )}

      {/* Content Blocks */}
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
                type="button"
                onClick={() => onShowAddContentChange(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                İlk İçeriği Ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          contentBlocks
            .sort((a, b) => a.order - b.order)
            .map((block) => {
              const blockInfo = getBlockTypeInfo(block.type);
              
              return (
                <Card key={block.id} className={`${!block.isActive ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="cursor-move">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="text-2xl">{blockInfo.icon}</div>
                        <div>
                          <CardTitle className="text-lg">
                            {block.title || blockInfo.label}
                          </CardTitle>
                          <CardDescription>
                            {blockInfo.description}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={block.isActive ? 'default' : 'secondary'}>
                          {block.isActive ? 'Aktif' : 'Gizli'}
                        </Badge>
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleBlockVisibility(block.id)}
                        >
                          {block.isActive ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteContentBlock(block.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {renderBlockEditor(block)}
                  </CardContent>
                </Card>
              );
            })
        )}
      </div>

      {/* Galeri Modal (Commented out as it seems to be unused) */}
      {/* {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Galeriden Resim Seç</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsGalleryOpen(false);
                  setCurrentBlockId(null);
                }}
              >
                ✕
              </Button>
            </div>
            <div className="h-96 overflow-auto">
              <GlobalMediaSelector
                onSelect={(media) => {
                  console.log('Resim seçildi, block ID:', currentBlockId, 'Media:', media);
                  handleImageSelect(media);
                  setIsGalleryOpen(false);
                  setCurrentBlockId(null);
                }}
                defaultCategory="content-images"
                acceptedTypes={['image/*']}
                buttonText="Resim Seç"
                title="Resim Seç"
                description="TinyMCE editörü için resim seçin"
              />
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
