'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface ContentBlock {
  id: string;
  type: string;
  title?: string;
  content?: string;
  config?: any;
  order: number;
  isActive: boolean;
}

export const BLOCK_TYPES = [
  { type: 'text', label: 'Metin Bloğu', icon: '📝', description: 'Düz metin veya zengin metin içeriği' },
  { type: 'image', label: 'Görsel Bloğu', icon: '🖼️', description: 'Tek görsel veya resim galerisi' },
  { type: 'video', label: 'Video Bloğu', icon: '🎥', description: 'YouTube, Vimeo veya yerel video dosyası' },
  { type: 'gallery', label: 'Galeri Bloğu', icon: '🖼️', description: 'Çoklu görsel galerisi' },
  { type: 'cta', label: 'Eylem Çağrısı', icon: '🎯', description: 'Buton ve çağrı-eylem bileşenleri' },
  { type: 'quote', label: 'Alıntı Bloğu', icon: '💬', description: 'Alıntı, testimonyal ve referanslar' },
  { type: 'list', label: 'Liste Bloğu', icon: '📋', description: 'Sıralı, sırasız ve kontrol listeleri' },
  { type: 'divider', label: 'Ayırıcı Bloğu', icon: '➖', description: 'Görsel ayırıcılar ve ara bölümler' }
];

const getDefaultConfig = (blockType: string) => {
  switch (blockType) {
    case 'image':
      return {
        alignment: 'center',
        size: 'medium',
        caption: '',
        alt: '',
        link: ''
      };
    case 'video':
      return {
        autoplay: false,
        controls: true,
        muted: false,
        loop: false
      };
    case 'gallery':
      return {
        layout: 'grid',
        columns: 3,
        spacing: 'medium',
        images: []
      };
    case 'cta':
      return {
        buttonText: 'Daha Fazla Bilgi',
        buttonUrl: '',
        buttonStyle: 'primary',
        alignment: 'center'
      };
    case 'quote':
      return {
        author: '',
        position: '',
        alignment: 'center'
      };
    case 'list':
      return {
        listType: 'unordered',
        items: ['']
      };
    case 'divider':
      return {
        style: 'line',
        thickness: 'medium',
        color: '#e5e7eb'
      };
    default:
      return {};
  }
};

export function useContentBlocks() {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [showAddContent, setShowAddContent] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string>('');

  const parseContentBlocks = useCallback((jsonContent: string) => {
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
  }, []);

  const addContentBlock = useCallback((blockType: string) => {
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
  }, [contentBlocks.length]);

  const updateContentBlock = useCallback((blockId: string, updates: Partial<ContentBlock>) => {
    setContentBlocks(prev => {
      const updated = prev.map(block => {
        if (block.id === blockId) {
          const updatedBlock = { ...block, ...updates };
          console.log('✅ Block updated:', updatedBlock.id, 'Type:', updatedBlock.type);
          return updatedBlock;
        }
        return block;
      });

      console.log('🔄 Content blocks state updated');
      return updated;
    });
  }, []);

  const deleteContentBlock = useCallback((blockId: string) => {
    if (!confirm('Bu içerik bloğunu silmek istediğinizden emin misiniz?')) {
      return;
    }

    setContentBlocks(prev => 
      prev.filter(block => block.id !== blockId)
        .map((block, index) => ({ ...block, order: index }))
    );
    
    toast.success('İçerik bloğu silindi');
  }, []);

  const reorderContentBlocks = useCallback((newOrder: ContentBlock[]) => {
    setContentBlocks(newOrder.map((block, index) => ({ ...block, order: index })));
  }, []);

  const toggleBlockVisibility = useCallback((blockId: string) => {
    setContentBlocks(prev => 
      prev.map(block => 
        block.id === blockId 
          ? { ...block, isActive: !block.isActive }
          : block
      )
    );
  }, []);

  // Prepare content data for API
  const prepareContentData = useCallback(() => {
    return {
      blocks: contentBlocks,
      version: '2.0',
      updatedAt: new Date().toISOString()
    };
  }, [contentBlocks]);

  return {
    contentBlocks,
    showAddContent,
    setShowAddContent,
    activeBlockId,
    setActiveBlockId,
    parseContentBlocks,
    addContentBlock,
    updateContentBlock,
    deleteContentBlock,
    reorderContentBlocks,
    toggleBlockVisibility,
    prepareContentData,
    hasContent: contentBlocks.length > 0,
    resetContentBlocks: () => setContentBlocks([])
  };
}
