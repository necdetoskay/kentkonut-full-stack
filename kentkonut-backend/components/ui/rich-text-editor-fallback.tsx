'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  maxHeight?: string;
  disabled?: boolean;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "İçerik yazın...",
  className = "",
  minHeight = "200px",
  maxHeight = "500px",
  disabled = false
}: RichTextEditorProps) {
  console.log('🎯 RichTextEditor Simple component rendered!', { content });
  
  const [editorContent, setEditorContent] = useState(content);
  const [showRich, setShowRich] = useState(false);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setEditorContent(value);
    onChange(value);
  };

  useEffect(() => {
    setEditorContent(content);
  }, [content]);

  // Şimdilik sadece textarea göster, sonra rich editor ekleriz
  return (
    <div className={`editor-wrapper ${className}`}>
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
            <span className="mr-2">ℹ️</span>
            Rich Text Editor (Geliştirme aşamasında - Şimdilik basit editor)
          </div>
          <button
            type="button"
            onClick={() => setShowRich(!showRich)}
            className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            {showRich ? 'Basit Editor' : 'Gelişmiş Editor'}
          </button>
        </div>
      </div>
      
      {showRich ? (
        <div className="border rounded-lg">
          {/* Basit Toolbar */}
          <div className="border-b p-2 bg-gray-50 flex gap-1">
            <button
              type="button"
              onClick={() => {
                const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                if (textarea) {
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const text = textarea.value;
                  const before = text.substring(0, start);
                  const selected = text.substring(start, end);
                  const after = text.substring(end);
                  const newText = before + `<strong>${selected || 'kalın metin'}</strong>` + after;
                  setEditorContent(newText);
                  onChange(newText);
                }
              }}
              className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-100"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => {
                const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                if (textarea) {
                  const start = textarea.selectionStart;
                  const end = textarea.selectionEnd;
                  const text = textarea.value;
                  const before = text.substring(0, start);
                  const selected = text.substring(start, end);
                  const after = text.substring(end);
                  const newText = before + `<em>${selected || 'italik metin'}</em>` + after;
                  setEditorContent(newText);
                  onChange(newText);
                }
              }}
              className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-100"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => {
                const newText = editorContent + '\n\n<h2>Başlık</h2>\n';
                setEditorContent(newText);
                onChange(newText);
              }}
              className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-100"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => {
                const newText = editorContent + '\n\n<ul>\n  <li>Liste öğesi</li>\n</ul>\n';
                setEditorContent(newText);
                onChange(newText);
              }}
              className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-100"
            >
              Liste
            </button>
          </div>
          
          <Textarea
            value={editorContent}
            onChange={handleTextareaChange}
            placeholder={`${placeholder} (HTML kodları kullanabilirsiniz)`}
            disabled={disabled}
            style={{ minHeight, maxHeight }}
            className="w-full border-0 rounded-t-none font-mono text-sm"
            rows={8}
          />
        </div>
      ) : (
        <Textarea
          value={editorContent}
          onChange={handleTextareaChange}
          placeholder={placeholder}
          disabled={disabled}
          style={{ minHeight, maxHeight }}
          className="w-full"
          rows={8}
        />
      )}
      
      <div className="text-xs text-gray-500 mt-1">
        {showRich ? 'HTML kodu ile düzenleme yapabilirsiniz' : 'Basit metin düzenleme'}
      </div>
    </div>
  );
}
