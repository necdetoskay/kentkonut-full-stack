"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  GripVertical,
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Star,
  StarOff,
  MoreHorizontal,
  Image as ImageIcon
} from "lucide-react";
import { ServiceCard } from "@/types";
import { toast } from "sonner";
import { ServiceCardImage } from "./ServiceCardImage";

interface SortableServiceCardItemProps {
  card: ServiceCard;
  onEdit: (card: ServiceCard) => void;
  onDelete: (card: ServiceCard) => void;
  onToggleActive: (card: ServiceCard) => void;
  onToggleFeatured: (card: ServiceCard) => void;
  formatDate: (dateString: string) => string;
}

function SortableServiceCardItem({
  card,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
  formatDate,
}: SortableServiceCardItemProps) {
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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <div className="flex gap-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>

        {/* Thumbnail */}
        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
          <ServiceCardImage
            src={card.imageUrl}
            alt={card.altText || card.title}
            title={card.title}
            fallbackColor={card.color}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                {card.title}
              </h3>
              {card.shortDescription && (
                <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                  {card.shortDescription}
                </p>
              )}
              
              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                <div>Sıra: {card.displayOrder}</div>
                <div>{card.clickCount} tıklama</div>
                <div>Oluşturulma: {formatDate(card.createdAt.toString())}</div>
              </div>

              {/* Status badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge 
                  variant={card.isActive ? "default" : "secondary"}
                  className={card.isActive ? "bg-green-600" : ""}
                >
                  {card.isActive ? "Aktif" : "Pasif"}
                </Badge>
                {card.isFeatured && (
                  <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                    <Star className="h-3 w-3 mr-1" />
                    Öne Çıkan
                  </Badge>
                )}
                {card.color && (
                  <div className="flex items-center gap-1">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: card.color }}
                    ></div>
                    <span className="text-xs text-muted-foreground">{card.color}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(card)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleActive(card)}>
                  {card.isActive ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Pasif Yap
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Aktif Yap
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleFeatured(card)}>
                  {card.isFeatured ? (
                    <>
                      <StarOff className="h-4 w-4 mr-2" />
                      Öne Çıkarmayı Kaldır
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Öne Çıkar
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(card)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SortableServiceCardListProps {
  cards: ServiceCard[];
  onReorder: (cardIds: number[]) => void;
  onEdit: (card: ServiceCard) => void;
  onDelete: (card: ServiceCard) => void;
  onToggleActive: (card: ServiceCard) => void;
  onToggleFeatured: (card: ServiceCard) => void;
  formatDate: (dateString: string) => string;
}

export function SortableServiceCardList({
  cards,
  onReorder,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
  formatDate,
}: SortableServiceCardListProps) {
  const [items, setItems] = useState(cards);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update items when cards prop changes
  useEffect(() => {
    setItems(cards);
  }, [cards]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Call the reorder function with the new order
      const cardIds = newItems.map(item => item.id);
      onReorder(cardIds);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {items.map((card) => (
            <SortableServiceCardItem
              key={card.id}
              card={card}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
              onToggleFeatured={onToggleFeatured}
              formatDate={formatDate}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
