'use client';

import { useState } from 'react';

export interface PageFormData {
  title: string;
  slug: string;
  content: string; // Required field in database
  excerpt: string;
  order: number;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[]; // Array to match database
  publishedAt: string;
  hasQuickAccess: boolean;
  isDeletable: boolean;
}

export interface FormErrors {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  order?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  publishedAt?: string;
  general?: string;
}

const initialFormData: PageFormData = {
  title: '',
  slug: '',
  content: '', // Required field
  excerpt: '',
  order: 0,
  isActive: true,
  metaTitle: '',
  metaDescription: '',
  metaKeywords: [], // Array type
  publishedAt: '',
  hasQuickAccess: false,
  isDeletable: true
};

export function usePageForm() {
  const [formData, setFormData] = useState<PageFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  // Validation functions
  const validateField = (name: keyof PageFormData, value: any, skipContentValidation = false): string | undefined => {
    switch (name) {
      case 'title':
        if (!value || value.trim().length === 0) return 'Sayfa başlığı gereklidir';
        if (value.length < 3) return 'Sayfa başlığı en az 3 karakter olmalıdır';
        if (value.length > 100) return 'Sayfa başlığı en fazla 100 karakter olabilir';
        break;
      case 'slug':
        if (!value || value.trim().length === 0) return 'URL slug gereklidir';
        if (!/^[a-z0-9-]+$/.test(value)) return 'Slug sadece küçük harf, sayı ve tire içerebilir';
        if (value.length < 2) return 'Slug en az 2 karakter olmalıdır';
        if (value.length > 50) return 'Slug en fazla 50 karakter olabilir';
        break;
      case 'content':
        if (!skipContentValidation && (!value || value.trim().length === 0)) return 'İçerik gereklidir';
        break;
      case 'metaTitle':
        if (value && value.length > 60) return 'Meta başlık en fazla 60 karakter olabilir';
        break;
      case 'metaDescription':
        if (value && value.length > 160) return 'Meta açıklama en fazla 160 karakter olabilir';
        break;
      case 'order':
        if (value < 0) return 'Sıra negatif olamaz';
        break;
    }
    return undefined;
  };

  const validateForm = (hasContentBlocks = false): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate all required fields
    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof PageFormData;

      const error = validateField(fieldName, formData[fieldName], hasContentBlocks);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-|-$/g, ''),
      metaTitle: title
    }));

    // Clear title error when user starts typing
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: undefined }));
    }
  };

  // Handle input change with validation
  const handleInputChange = (name: keyof PageFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time validation
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Prepare data for API
  const prepareApiData = (hasContentBlocks = false) => {
    return {
      ...formData,
      // If we have content blocks, use a placeholder content, otherwise use the form content or a default
      content: hasContentBlocks ? 'Content managed by blocks' : (formData.content || 'Sayfa içeriği henüz eklenmemiş.'),
      metaKeywords: typeof formData.metaKeywords === 'string'
        ? formData.metaKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
        : formData.metaKeywords,
      publishedAt: formData.publishedAt || undefined, // Convert empty string to undefined
    };
  };

  return {
    formData,
    errors,
    setErrors,
    validateField,
    validateForm,
    handleTitleChange,
    handleInputChange,
    prepareApiData,
    resetForm: () => {
      setFormData(initialFormData);
      setErrors({});
    }
  };
}
