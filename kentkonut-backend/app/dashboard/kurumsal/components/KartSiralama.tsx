'use client';

import { useState, useEffect } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CorporateCard } from '@/types/corporate-cards';

interface KartSiralamaProps {
  cards: CorporateCard[];
  onReorder: (cardIds: string[]) => Promise<void>;
  onEdit: (card: CorporateCard) => void;
  onDelete: (card: CorporateCard) => void;
  onToggleStatus: (card: CorporateCard) => void;
  isReordering?: boolean;
}

// Sortable Card Item Component
interface SortableCardItemProps {
  card: CorporateCard;
  onEdit: (card: CorporateCard) => void;
  onDelete: (card: CorporateCard) => void;
  onToggleStatus: (card: CorporateCard) => void;
  isDragOverlay?: boolean;
}

function SortableCardItem({ 
  card, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  isDragOverlay = false 
}: SortableCardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative transition-all duration-200",
        isDragging && "opacity-50 shadow-lg scale-105 z-50",
        isDragOverlay && "shadow-2xl scale-105 rotate-2",
        !card.isActive && "opacity-60"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className={cn(
              "flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing transition-colors rounded-md hover:bg-gray-100",
              isDragging && "cursor-grabbing"
            )}
          >
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Order Number */}
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-sm font-semibold text-blue-600">
            {card.displayOrder}
          </div>

          {/* Card Image */}
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            {card.imageUrl ? (
              <img 
                src={card.imageUrl} 
                alt={card.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>

          {/* Card Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {card.title}
              </h3>
              <Badge variant={card.isActive ? "default" : "secondary"}>
                {card.isActive ? "Aktif" : "Pasif"}
              </Badge>
            </div>
            {card.subtitle && (
              <p className="text-sm text-gray-600 truncate mb-1">
                {card.subtitle}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: card.backgroundColor }}
                title={`Arka plan: ${card.backgroundColor}`}
              />
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: card.accentColor }}
                title={`Vurgu rengi: ${card.accentColor}`}
              />
              <span>•</span>
              <span className="capitalize">{card.cardSize}</span>
              {card.targetUrl && (
                <>
                  <span>•</span>
                  <ExternalLink className="w-3 h-3" />
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleStatus(card)}
              title={card.isActive ? "Pasif yap" : "Aktif yap"}
            >
              {card.isActive ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(card)}
              title="Düzenle"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(card)}
              title="Sil"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Sorting Component
export default function KartSiralama({
  cards,
  onReorder,
  onEdit,
  onDelete,
  onToggleStatus,
  isReordering = false
}: KartSiralamaProps) {
  const [localCards, setLocalCards] = useState(cards);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update local cards when props change
  useEffect(() => {
    setLocalCards(cards);
  }, [cards]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = localCards.findIndex(card => card.id === active.id);
    const newIndex = localCards.findIndex(card => card.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Optimistic update
    const newCards = arrayMove(localCards, oldIndex, newIndex);
    setLocalCards(newCards);

    try {
      // Send reorder request
      const cardIds = newCards.map(card => card.id);
      await onReorder(cardIds);
    } catch (error) {
      // Revert on error
      setLocalCards(cards);
      console.error('Reorder failed:', error);
    }
  };

  const activeCard = activeId ? localCards.find(card => card.id === activeId) : null;

  if (localCards.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Henüz kart bulunmuyor
        </h3>
        <p className="text-gray-600">
          İlk kurumsal kartınızı oluşturmak için "Yeni Kart Ekle" butonunu kullanın.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Kart Sıralaması</h3>
          <p className="text-sm text-gray-600">
            Kartları sürükleyip bırakarak sıralayın
          </p>
        </div>
        {isReordering && (
          <div className="flex items-center text-blue-600">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sıralama güncelleniyor...
          </div>
        )}
      </div>

      {/* Sortable Cards */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localCards.map(card => card.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {localCards.map((card) => (
              <SortableCardItem
                key={card.id}
                card={card}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </div>
        </SortableContext>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCard ? (
            <SortableCardItem
              card={activeCard}
              onEdit={() => {}}
              onDelete={() => {}}
              onToggleStatus={() => {}}
              isDragOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Stats */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {localCards.length}
            </div>
            <div className="text-sm text-gray-600">Toplam Kart</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {localCards.filter(card => card.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Aktif Kart</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-500">
              {localCards.filter(card => !card.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Pasif Kart</div>
          </div>
        </div>
      </div>
    </div>
  );
}
