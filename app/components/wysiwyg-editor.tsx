"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Client-side import için
import "quill/dist/quill.snow.css";

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  height?: string;
}

export function WysiwygEditor({
  value,
  onChange,
  label,
  error,
  className,
  placeholder = "İçerik ekleyin...",
  disabled = false,
  height = "300px"
}: WysiwygEditorProps) {
  // Client-side için mounted kontrolü
  const [isMounted, setIsMounted] = useState(false);
  
  // Quill editörü için ref
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  
  // Yükleme durumu kontrolü
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Paste event handler
  const handlePasteEvent = useCallback((e: ClipboardEvent) => {
    if (!quillRef.current || !editorRef.current?.contains(e.target as Node)) return;
    
    try {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain');
      if (!text) return;
      
      const quill = quillRef.current;
      const range = quill.getSelection();
      
      if (range) {
        quill.deleteText(range.index, range.length);
        quill.insertText(range.index, text);
        // Use updateSelection instead of setSelection
        quill.setSelection(range.index + text.length, 0);
      } else {
        const length = quill.getLength();
        quill.insertText(length - 1, text);
      }
      
      // Notify about changes
      const content = editorRef.current?.querySelector('.ql-editor')?.innerHTML;
      if (content && content.length > 1 && onChange) {
        onChange(content);
      }
      
      // Clean up any extra toolbars that might appear
      const toolbars = document.querySelectorAll('.ql-toolbar');
      if (toolbars.length > 1) {
        Array.from(toolbars).slice(1).forEach(toolbar => toolbar.remove());
      }
    } catch (error) {
      console.error('Paste error:', error);
    }
  }, [onChange]);

  // Quill editör kurulumu
  useEffect(() => {
    if (!isMounted || !editorRef.current) return;
    
    // Editör zaten kuruluysa temizle
    if (quillRef.current) {
      quillRef.current = null;
    }
    
    let quillInstance: any = null;
    
    // Quill editörünü dinamik olarak yükle ve kur
    import('quill').then(({ default: Quill }) => {
      // Toolbar seçenekleri
      const toolbarOptions = [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ];
      
      // Quill editör örneği oluştur
      quillInstance = new Quill(editorRef.current!, {
        modules: {
          toolbar: toolbarOptions,
          clipboard: {
            matchVisual: false
          }
        },
        placeholder: placeholder,
        theme: 'snow',
        readOnly: disabled
      });
      
      // Referansı sakla
      quillRef.current = quillInstance;
      
      // Başlangıç değerini ayarla
      if (value) {
        try {
          const delta = quillInstance.clipboard.convert(value);
          quillInstance.setContents(delta);
        } catch (error) {
          console.error('Initial content error:', error);
          quillInstance.setText(value);
        }
      }
      
      // Text değişikliğini dinle
      quillInstance.on('text-change', () => {
        const content = editorRef.current?.querySelector('.ql-editor')?.innerHTML;
        if (content && onChange) {
          onChange(content);
        }
      });
      
      // Document seviyesinde paste olayını dinle
      document.addEventListener('paste', handlePasteEvent);
    }).catch(error => {
      console.error('Failed to load Quill:', error);
    });
    
    // Editor temizliği
    return () => {
      // Temizlik işlemleri
      document.removeEventListener('paste', handlePasteEvent);
      quillRef.current = null;
      const toolbar = document.querySelector('.ql-toolbar');
      if (toolbar) {
        toolbar.remove();
      }
    };
  }, [isMounted, onChange, placeholder, disabled, handlePasteEvent]);
  
  // Değer değişikliğini izle
  useEffect(() => {
    if (!isMounted || !quillRef.current) return;

    const editorContent = editorRef.current?.querySelector('.ql-editor')?.innerHTML;

    // İçerik değiştiyse ve editörden gelmiyorsa güncelle
    if (value !== editorContent) {
      try {
        quillRef.current.setContents([]); // Editörü temizle
        if (value) {
          const delta = quillRef.current.clipboard.convert(value);
          quillRef.current.setContents(delta);
        }
      } catch (error) {
        console.error('Content update error:', error);
        quillRef.current.setText(value || '');
      }
    }
  }, [isMounted, value]);
  
  // CSS Stillerini ekle
  useEffect(() => {
    if (!isMounted) return;
    
    const style = document.createElement('style');
    style.textContent = `
      .ql-container {
        min-height: ${height};
        font-size: 16px;
      }
      .ql-editor {
        min-height: ${height};
        max-height: 500px;
        overflow-y: auto;
        cursor: text !important;
      }
      .ql-toolbar {
        border-top-left-radius: 0.25rem;
        border-top-right-radius: 0.25rem;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [isMounted, height]);

  // Server-side rendering için
  if (!isMounted) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && <Label>{label}</Label>}
        <div className="h-64 w-full border rounded-md bg-muted/20 animate-pulse" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2 quill-wrapper", className)}>
      {label && <Label>{label}</Label>}
      
      <div 
        className={cn(
          "rounded-md overflow-hidden border bg-background",
          error ? "border-destructive" : "border-input",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div 
          ref={editorRef} 
          className="min-h-[200px]"
        />
      </div>
      
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}

export default WysiwygEditor; 