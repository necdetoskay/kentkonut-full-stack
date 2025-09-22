'use client';

import { useRouter } from 'next/navigation';
import Link from "next/link"
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Breadcrumb } from '@/components/ui/breadcrumb';

interface ContentHeaderProps {
  pageId: string;
  contentId: string;
  contentType: string;
  order: number;
  isActive: boolean;
  saving: boolean;
  onSave: () => void;
  onDelete: () => void;
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'TEXT': return 'Metin İçeriği';
    case 'IMAGE': return 'Görsel İçeriği';
    case 'VIDEO': return 'Video İçeriği';
    default: return 'İçerik';
  }
};

export default function ContentHeader({
  pageId,
  contentId,
  contentType,
  order,
  isActive,
  saving,
  onSave,
  onDelete
}: ContentHeaderProps) {
  const router = useRouter();

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb
          segments={[
            { name: 'Sayfa Yönetimi', href: '/dashboard/pages' },
            { name: 'Sayfa Düzenle', href: `/dashboard/pages/${pageId}/edit` },
            { name: 'İçerik Düzenle', href: `/dashboard/pages/${pageId}/edit/content/${contentId}` }
          ]}
          homeHref="/dashboard"
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/dashboard/pages/${pageId}/edit`)}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getTypeLabel(contentType)} Düzenle
            </h1>
            <p className="text-sm text-gray-600">
              Sıra: {order} • 
              {isActive ? (
                <span className="text-green-600 ml-1">Aktif</span>
              ) : (
                <span className="text-red-600 ml-1">Pasif</span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="destructive"
            onClick={onDelete}
            className="flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Sil
          </Button>
          
          <Button
            onClick={onSave}
            disabled={saving}
            className="flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>
    </>
  );
}
