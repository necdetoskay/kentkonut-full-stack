'use client';

import { useState } from 'react';
import Link from "next/link"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Eye, AlertCircle, Plus } from 'lucide-react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { toast } from 'sonner';

// Import our custom hooks
import { usePageForm } from '../hooks/usePageForm';
import { useContentBlocks } from '../hooks/useContentBlocks';
import { useUnifiedSave } from '../hooks/useUnifiedSave';

// Import form components
import PageMetadataForm from './PageMetadataForm';
import ContentEditorSection from './ContentEditorSection';

interface UnifiedPageCreatorProps {
  onModeSwitch?: () => void;
  showModeSwitch?: boolean;
}

export default function UnifiedPageCreator({ 
  onModeSwitch, 
  showModeSwitch = false 
}: UnifiedPageCreatorProps) {
  const [activeTab, setActiveTab] = useState<'metadata' | 'content'>('metadata');
  
  // Custom hooks for state management
  const pageForm = usePageForm();
  const contentBlocks = useContentBlocks();
  const unifiedSave = useUnifiedSave();

  const breadcrumbSegments = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Sayfalar', href: '/dashboard/pages' },
    { name: 'Yeni Sayfa (Gelişmiş)', href: '#' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form (skip content validation in unified mode since content blocks are optional)
    if (!pageForm.validateForm(true)) {
      toast.error('Lütfen form hatalarını düzeltin');
      return;
    }

    // Prepare data
    const apiData = pageForm.prepareApiData(contentBlocks.hasContent);
    
    // Save page with content
    const result = await unifiedSave.savePageWithContent(
      apiData,
      contentBlocks.contentBlocks,
      pageForm.setErrors
    );

    if (result.success) {
      // Reset forms on success
      pageForm.resetForm();
      contentBlocks.resetContentBlocks();
    }
  };

  const handleSaveDraft = async () => {
    // Validate form (skip content validation in unified mode since content blocks are optional)
    if (!pageForm.validateForm(true)) {
      toast.error('Lütfen form hatalarını düzeltin');
      return;
    }

    // Prepare data
    const apiData = pageForm.prepareApiData(contentBlocks.hasContent);
    
    // Save as draft
    const result = await unifiedSave.saveDraft(
      apiData,
      contentBlocks.contentBlocks,
      pageForm.setErrors
    );

    if (result.success) {
      toast.success('Taslak olarak kaydedildi');
      // Reset forms on success
      pageForm.resetForm();
      contentBlocks.resetContentBlocks();
    }
  };

  // Error display component
  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 mt-1">
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        {/* BREADCRUMB_TO_FIX: <Breadcrumb segments={breadcrumbSegments} homeHref="/dashboard" /> */}
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/pages">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Yeni Sayfa Oluştur</h1>
            <p className="text-gray-600 mt-1">
              Sayfa bilgilerini doldurun ve içerik ekleyin - tek seferde!
            </p>
          </div>
        </div>
        
        {showModeSwitch && (
          <Button 
            variant="outline" 
            onClick={onModeSwitch}
            className="text-sm"
          >
            Basit Moda Geç
          </Button>
        )}
      </div>

      {/* Mode Info Banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 text-xl">🚀</div>
          <div>
            <h3 className="font-medium text-blue-900">Gelişmiş Sayfa Oluşturma Modu</h3>
            <p className="text-blue-700 text-sm mt-1">
              Bu modda sayfa bilgilerini ve içeriği aynı anda oluşturabilirsiniz. 
              Sayfa oluşturulduktan sonra başka bir sayfaya yönlendirilmeyeceksiniz.
            </p>
          </div>
        </div>
      </div>

      {/* General Error Display */}
      {pageForm.errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <ErrorMessage error={pageForm.errors.general} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Page Metadata Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📄 Sayfa Bilgileri
            </CardTitle>
            <CardDescription>
              Sayfanızın temel bilgilerini ve SEO ayarlarını girin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PageMetadataForm 
              formData={pageForm.formData}
              errors={pageForm.errors}
              onTitleChange={pageForm.handleTitleChange}
              onInputChange={pageForm.handleInputChange}
            />
          </CardContent>
        </Card>

        {/* Content Editor Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📝 İçerik Editörü
              <span className="text-sm font-normal text-gray-500">
                ({contentBlocks.contentBlocks.length} blok)
              </span>
            </CardTitle>
            <CardDescription>
              Sayfanıza içerik blokları ekleyin (isteğe bağlı)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContentEditorSection 
              contentBlocks={contentBlocks.contentBlocks}
              showAddContent={contentBlocks.showAddContent}
              onShowAddContentChange={contentBlocks.setShowAddContent}
              onAddContentBlock={contentBlocks.addContentBlock}
              onUpdateContentBlock={contentBlocks.updateContentBlock}
              onDeleteContentBlock={contentBlocks.deleteContentBlock}
              onToggleBlockVisibility={contentBlocks.toggleBlockVisibility}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-gray-600">
            {contentBlocks.hasContent ? (
              <span>✅ {contentBlocks.contentBlocks.length} içerik bloğu hazır</span>
            ) : (
              <span>ℹ️ İçerik blokları isteğe bağlıdır</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={unifiedSave.loading}
            >
              Taslak Kaydet
            </Button>
            
            <Button
              type="submit"
              disabled={unifiedSave.loading}
              className="min-w-[200px]"
            >
              {unifiedSave.loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {contentBlocks.hasContent ? 'Sayfa ve İçerik Oluşturuluyor...' : 'Sayfa Oluşturuluyor...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {contentBlocks.hasContent ? 'Sayfa ve İçeriği Oluştur' : 'Sayfayı Oluştur'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
