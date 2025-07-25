'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageFormData, FormErrors } from './usePageForm';
import { ContentBlock } from './useContentBlocks';

interface UnifiedSaveOptions {
  redirectToEdit?: boolean;
  showSuccessMessage?: boolean;
}

interface SaveResult {
  success: boolean;
  pageId?: string;
  error?: string;
}

export function useUnifiedSave() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const createPage = async (pageData: any): Promise<{ success: boolean; data?: any; error?: string }> => {
    const response = await fetch('/api/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pageData)
    });

    return await response.json();
  };

  const saveContent = async (pageId: string, contentBlocks: ContentBlock[]): Promise<{ success: boolean; error?: string }> => {
    if (contentBlocks.length === 0) {
      return { success: true }; // No content to save
    }

    const contentData = {
      blocks: contentBlocks,
      version: '2.0',
      updatedAt: new Date().toISOString()
    };

    const response = await fetch(`/api/pages/${pageId}/content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: JSON.stringify(contentData)
      })
    });

    return await response.json();
  };

  const savePageWithContent = async (
    pageData: any,
    contentBlocks: ContentBlock[],
    setErrors: (errors: FormErrors) => void,
    options: UnifiedSaveOptions = {}
  ): Promise<SaveResult> => {
    const { 
      redirectToEdit = true, 
      showSuccessMessage = true 
    } = options;

    setLoading(true);
    setSaving(true);

    try {
      console.log('🔍 [UNIFIED SAVE] Starting page creation with content...');
      console.log('📄 Page data:', JSON.stringify(pageData, null, 2));
      console.log('📝 Content blocks:', contentBlocks.length);

      // Step 1: Create the page
      const pageResult = await createPage(pageData);

      if (!pageResult.success) {
        console.error('❌ Page creation failed:', pageResult.error);
        
        // Handle API validation errors
        if (pageResult.details && Array.isArray(pageResult.details)) {
          const newErrors: FormErrors = {};
          pageResult.details.forEach((error: any) => {
            if (error.path && error.path.length > 0) {
              const fieldName = error.path[0] as keyof FormErrors;
              newErrors[fieldName] = error.message;
            }
          });
          setErrors(newErrors);
          toast.error('Form verilerinde hatalar var');
        } else {
          setErrors({ general: pageResult.error || 'Sayfa oluşturulurken hata oluştu' });
          toast.error(pageResult.error || 'Sayfa oluşturulurken hata oluştu');
        }

        return { success: false, error: pageResult.error };
      }

      const createdPage = pageResult.data;
      console.log('✅ Page created successfully:', createdPage.id);

      // Step 2: Save content if there are any content blocks
      if (contentBlocks.length > 0) {
        console.log('📝 Saving content blocks...');
        const contentResult = await saveContent(createdPage.id, contentBlocks);

        if (!contentResult.success) {
          console.error('❌ Content save failed:', contentResult.error);
          
          // Page was created but content failed - show warning
          toast.error(`Sayfa oluşturuldu ancak içerik kaydedilemedi: ${contentResult.error}`);
          
          // Still redirect to edit page so user can manually save content
          if (redirectToEdit) {
            router.push(`/dashboard/pages/${createdPage.id}/edit`);
          }

          return { 
            success: false, 
            pageId: createdPage.id, 
            error: `İçerik kaydedilemedi: ${contentResult.error}` 
          };
        }

        console.log('✅ Content saved successfully');
      }

      // Success!
      if (showSuccessMessage) {
        const message = contentBlocks.length > 0 
          ? 'Sayfa ve içerik başarıyla oluşturuldu!'
          : 'Sayfa başarıyla oluşturuldu!';
        toast.success(message);
      }

      if (redirectToEdit) {
        router.push(`/dashboard/pages/${createdPage.id}/edit`);
      }

      return { success: true, pageId: createdPage.id };

    } catch (error) {
      console.error('❌ Unified save error:', error);
      setErrors({ general: 'Bağlantı hatası oluştu' });
      toast.error('Bağlantı hatası oluştu');
      return { success: false, error: 'Bağlantı hatası oluştu' };
    } finally {
      setLoading(false);
      setSaving(false);
    }
  };

  const saveDraft = async (
    pageData: any,
    contentBlocks: ContentBlock[],
    setErrors: (errors: FormErrors) => void
  ): Promise<SaveResult> => {
    // For draft, set isActive to false and don't redirect
    const draftData = { ...pageData, isActive: false };
    
    return await savePageWithContent(
      draftData, 
      contentBlocks, 
      setErrors, 
      { 
        redirectToEdit: false, 
        showSuccessMessage: true 
      }
    );
  };

  return {
    loading,
    saving,
    savePageWithContent,
    saveDraft,
    createPage,
    saveContent
  };
}
