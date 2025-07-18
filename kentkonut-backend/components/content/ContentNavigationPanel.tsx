'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Image,
  Video,
  MessageSquare,
  Target,
  List,
  Minus,
  Camera,
  Hash,
  GripVertical
} from 'lucide-react';

// Drag & Drop imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ContentBlock {
  id: string;
  type: string;
  title?: string;
  content?: string;
  config?: any;
  order: number;
  isActive: boolean;
}

// Sortable Item Component
interface SortableNavigationItemProps {
  id: string;
  children: React.ReactNode;
  isDragging?: boolean;
}

function SortableNavigationItem({ id, children, isDragging }: SortableNavigationItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="relative group">
        {/* Drag Handle */}
        <div
          {...listeners}
          className="absolute left-1 top-1/2 transform -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white rounded p-1 shadow-sm border"
          title="Sürükleyerek yeniden sırala"
        >
          <GripVertical className="w-3 h-3 text-gray-500" />
        </div>

        {/* Content with left padding for drag handle */}
        <div className="pl-6">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ContentNavigationPanelProps {
  contentBlocks: ContentBlock[];
  activeBlockId?: string;
  onNavigateToBlock: (blockId: string) => void;
  onReorderBlocks?: (reorderedBlocks: ContentBlock[]) => void;
}

const BLOCK_ICONS = {
  text: FileText,
  image: Image,
  video: Video,
  gallery: Camera,
  cta: Target,
  quote: MessageSquare,
  list: List,
  divider: Minus,
  default: Hash
};

const BLOCK_COLORS = {
  text: 'bg-blue-50 border-blue-200 text-blue-700',
  image: 'bg-green-50 border-green-200 text-green-700',
  video: 'bg-purple-50 border-purple-200 text-purple-700',
  gallery: 'bg-orange-50 border-orange-200 text-orange-700',
  cta: 'bg-red-50 border-red-200 text-red-700',
  quote: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  list: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  divider: 'bg-gray-50 border-gray-200 text-gray-700',
};

export default function ContentNavigationPanel({
  contentBlocks,
  activeBlockId,
  onNavigateToBlock,
  onReorderBlocks
}: ContentNavigationPanelProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px hareket etmeden drag başlamaz
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Drag & Drop Event Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setIsDragging(false);

    if (!over || active.id === over.id || !onReorderBlocks) {
      return;
    }

    // Sadece aktif bloklar üzerinde çalış
    const activeBlocks = contentBlocks.filter(block => block.isActive);
    const inactiveBlocks = contentBlocks.filter(block => !block.isActive);

    const oldIndex = activeBlocks.findIndex(block => block.id === active.id);
    const newIndex = activeBlocks.findIndex(block => block.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      // Aktif blokları yeniden sırala
      const reorderedActiveBlocks = arrayMove(activeBlocks, oldIndex, newIndex);

      // Aktif blokların order değerlerini güncelle
      const updatedActiveBlocks = reorderedActiveBlocks.map((block, index) => ({
        ...block,
        order: index
      }));

      // İnaktif blokların order değerlerini aktif blokların sonrasına ayarla
      const updatedInactiveBlocks = inactiveBlocks.map((block, index) => ({
        ...block,
        order: updatedActiveBlocks.length + index
      }));

      // Tüm blokları birleştir
      const allUpdatedBlocks = [...updatedActiveBlocks, ...updatedInactiveBlocks];

      // Parent component'e bildir
      onReorderBlocks(allUpdatedBlocks);
    }
  };

  // Aktif olarak sürüklenen bloğu bul
  const activeBlock = contentBlocks.find(block => block.id === activeId);

  useEffect(() => {
    const handleScroll = () => {
      if (panelRef.current) {
        const rect = panelRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 80); // 80px offset for header
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getBlockTitle = (block: ContentBlock): string => {
    if (block.title && block.title.trim()) {
      return block.title;
    }

    // Generate title based on block type and content
    switch (block.type) {
      case 'text':
        if (block.content) {
          // Extract first line or sentence for preview
          const textContent = block.content.replace(/<[^>]*>/g, '').trim();
          return textContent.length > 50 
            ? `${textContent.substring(0, 50)}...` 
            : textContent || `Metin Bloğu #${block.order}`;
        }
        return `Metin Bloğu #${block.order}`;
      
      case 'image':
        return block.config?.alt || `Görsel Bloğu #${block.order}`;
      
      case 'video':
        return block.config?.caption || `Video Bloğu #${block.order}`;
      
      case 'gallery':
        const imageCount = block.config?.images?.length || 0;
        return `Galeri (${imageCount} görsel) #${block.order}`;
      
      case 'cta':
        return block.config?.buttonText || `Eylem Çağrısı #${block.order}`;
      
      case 'quote':
        return block.config?.author 
          ? `Alıntı - ${block.config.author}` 
          : `Alıntı Bloğu #${block.order}`;
      
      case 'list':
        const itemCount = block.config?.items?.length || 0;
        return `Liste (${itemCount} öğe) #${block.order}`;
      
      case 'divider':
        return `Ayırıcı #${block.order}`;
      
      default:
        return `İçerik Bloğu #${block.order}`;
    }
  };

  const getBlockTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      text: 'Metin',
      image: 'Görsel',
      video: 'Video',
      gallery: 'Galeri',
      cta: 'Eylem Çağrısı',
      quote: 'Alıntı',
      list: 'Liste',
      divider: 'Ayırıcı'
    };
    return labels[type] || 'İçerik';
  };

  const activeBlocks = contentBlocks.filter(block => block.isActive);

  if (activeBlocks.length === 0) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className={`
        transition-all duration-300 ease-in-out
        ${isSticky ? 'fixed top-20 right-4 z-40' : 'sticky top-4'}
        w-80 max-h-[calc(100vh-120px)]
      `}
    >
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Hash className="w-5 h-5" />
            İçerik Navigasyonu
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {activeBlocks.length} aktif içerik bloğu
            {isDragging && (
              <span className="ml-2 text-blue-600">• Sürükleniyor...</span>
            )}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-240px)] px-4 pb-4">
            {onReorderBlocks ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={activeBlocks.map(block => block.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {activeBlocks.map((block, index) => {
                      const IconComponent = BLOCK_ICONS[block.type as keyof typeof BLOCK_ICONS] || BLOCK_ICONS.default;
                      const colorClass = BLOCK_COLORS[block.type as keyof typeof BLOCK_COLORS] || BLOCK_COLORS.text;
                      const isActive = activeBlockId === block.id;

                      return (
                        <SortableNavigationItem
                          key={block.id}
                          id={block.id}
                          isDragging={activeId === block.id}
                        >
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            className={`
                              w-full justify-start p-3 h-auto min-h-[60px]
                              ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
                              border-l-4 border-l-transparent
                              ${isActive ? 'border-l-primary-foreground' : ''}
                              ${isDragging && activeId === block.id ? 'shadow-lg ring-2 ring-primary' : ''}
                            `}
                            onClick={() => onNavigateToBlock(block.id)}
                          >
                            <div className="flex items-start gap-3 w-full">
                              <div className={`
                                p-2 rounded-lg border-2 flex-shrink-0
                                ${isActive ? 'bg-primary-foreground/20' : colorClass}
                              `}>
                                <IconComponent className="w-4 h-4" />
                              </div>

                              <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs px-2 py-0.5"
                                  >
                                    {getBlockTypeLabel(block.type)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    #{block.order}
                                  </span>
                                </div>

                                <p className={`
                                  text-sm font-medium truncate leading-tight
                                  ${isActive ? 'text-primary-foreground' : 'text-foreground'}
                                `}>
                                  {getBlockTitle(block)}
                                </p>
                              </div>
                            </div>
                          </Button>
                        </SortableNavigationItem>
                      );
                    })}
                  </div>
                </SortableContext>

                {/* Drag Overlay */}
                <DragOverlay>
                  {activeId && activeBlock ? (
                    <div className="opacity-90 transform rotate-1 shadow-2xl">
                      <Button
                        variant="default"
                        className="w-full justify-start p-3 h-auto min-h-[60px] border-2 border-primary"
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className="p-2 rounded-lg border-2 bg-primary-foreground/20 flex-shrink-0">
                            {(() => {
                              const IconComponent = BLOCK_ICONS[activeBlock.type as keyof typeof BLOCK_ICONS] || BLOCK_ICONS.default;
                              return <IconComponent className="w-4 h-4" />;
                            })()}
                          </div>

                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                {getBlockTypeLabel(activeBlock.type)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                #{activeBlock.order}
                              </span>
                            </div>

                            <p className="text-sm font-medium truncate leading-tight text-primary-foreground">
                              {getBlockTitle(activeBlock)}
                            </p>
                          </div>
                        </div>
                      </Button>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            ) : (
              // Fallback: Normal list without drag & drop
              <div className="space-y-2">
                {activeBlocks.map((block, index) => {
                  const IconComponent = BLOCK_ICONS[block.type as keyof typeof BLOCK_ICONS] || BLOCK_ICONS.default;
                  const colorClass = BLOCK_COLORS[block.type as keyof typeof BLOCK_COLORS] || BLOCK_COLORS.text;
                  const isActive = activeBlockId === block.id;

                  return (
                    <Button
                      key={block.id}
                      variant={isActive ? "default" : "ghost"}
                      className={`
                        w-full justify-start p-3 h-auto min-h-[60px]
                        ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
                        border-l-4 border-l-transparent
                        ${isActive ? 'border-l-primary-foreground' : ''}
                      `}
                      onClick={() => onNavigateToBlock(block.id)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className={`
                          p-2 rounded-lg border-2 flex-shrink-0
                          ${isActive ? 'bg-primary-foreground/20' : colorClass}
                        `}>
                          <IconComponent className="w-4 h-4" />
                        </div>

                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="secondary"
                              className="text-xs px-2 py-0.5"
                            >
                              {getBlockTypeLabel(block.type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              #{block.order}
                            </span>
                          </div>

                          <p className={`
                            text-sm font-medium truncate leading-tight
                            ${isActive ? 'text-primary-foreground' : 'text-foreground'}
                          `}>
                            {getBlockTitle(block)}
                          </p>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
