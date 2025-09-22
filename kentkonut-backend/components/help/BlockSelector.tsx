'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import BlockTypeTooltip from '@/components/help/BlockTypeTooltip';

interface BlockSelectorProps {
  onBlockSelect: (blockType: string) => void;
}

const blockTypes = [
  { type: 'text', name: 'Metin Bloğu', icon: '📝' },
  { type: 'image', name: 'Görsel Bloğu', icon: '🖼️' },
  { type: 'gallery', name: 'Galeri Bloğu', icon: '📸' },
  { type: 'video', name: 'Video Bloğu', icon: '🎥' },
  { type: 'cta', name: 'Eylem Çağrısı', icon: '👆' },
  { type: 'quote', name: 'Alıntı Bloğu', icon: '💬' },
  { type: 'list', name: 'Liste Bloğu', icon: '📋' },
  { type: 'divider', name: 'Ayırıcı Bloğu', icon: '➖' }
];

export default function BlockSelector({ onBlockSelect }: BlockSelectorProps) {
  return (
    <div className="flex justify-center py-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 hover:bg-blue-50 hover:border-blue-300">
            <Plus className="h-4 w-4" />
            İçerik Bloğu Ekle
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 p-2">
          <div className="space-y-1">
            {blockTypes.map((blockType) => (
              <DropdownMenuItem
                key={blockType.type}
                className="p-3 cursor-pointer hover:bg-gray-50 rounded-lg"
                onClick={() => onBlockSelect(blockType.type)}
              >
                <BlockTypeTooltip blockType={blockType.type} className="w-full">
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-lg">{blockType.icon}</span>
                    <div className="flex-1">
                      <span className="font-medium text-sm">{blockType.name}</span>
                    </div>
                  </div>
                </BlockTypeTooltip>
              </DropdownMenuItem>
            ))}
          </div>
          
          <div className="border-t mt-2 pt-2">
            <div className="text-xs text-gray-500 px-2">
              💡 Blok üzerindeki yardım simgesine tıklayarak detaylı bilgi alabilirsiniz
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
