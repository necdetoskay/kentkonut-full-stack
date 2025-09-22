'use client';

import { Editor } from '@tinymce/tinymce-react';
import { useCallback, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react';
import { GlobalMediaSelector, GlobalMediaFile } from '@/components/media/GlobalMediaSelector';

export interface UnifiedTinyMCEEditorRef {
  getContent: () => string;
  focus: () => void;
  insertImage: (media: GlobalMediaFile | { url: string; alt?: string; width?: number | string; height?: number | string }) => void;
}

interface UnifiedTinyMCEEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  height?: number;
  menubar?: boolean | string;
  apiKey?: string;
  language?: string;
  languageUrl?: string;
  enableGallery?: boolean;
  galleryButtonText?: string;
  showPreviewPane?: boolean;
  showHtmlPane?: boolean;
  showDebugPane?: boolean;
  showConsolePane?: boolean;
  className?: string;
  toolbarOverride?: string;
  pluginsOverride?: string[];
  contentStyle?: string;
  // Yeni: Medya seçici için kategori ve özel klasör
  mediaCategory?: 'content-images' | 'project-images' | 'news-images' | 'banner-images' | 'corporate-images' | 'department-images' | 'general' | 'service-images';
  customFolder?: string;
}

const DEFAULT_PLUGINS = [
  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
  'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount',
  'emoticons', /* removed 'hr' for TinyMCE 6+ */ 'pagebreak', 'nonbreaking', 'directionality', 'quickbars'
];

const DEFAULT_TOOLBAR = [
  'undo redo | blocks fontfamily fontsize lineheight |',
  'bold italic underline strikethrough subscript superscript | forecolor backcolor removeformat |',
  'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent |',
  // removed 'hr' button to prevent 404 in TinyMCE 6+
  'link image media charmap emoticons | table | searchreplace code preview fullscreen |',
  'ltr rtl | customgallery help'
].join(' ');

function normalizeUrl(inputUrl: string): string {
  let cleanUrl = inputUrl;
  if (cleanUrl.startsWith('../../')) {
    cleanUrl = cleanUrl.replace(/^\.\.\//g, '/');
  }
  if (!cleanUrl.startsWith('/') && !cleanUrl.startsWith('http')) {
    cleanUrl = '/' + cleanUrl;
  }
  return cleanUrl;
}

const UnifiedTinyMCEEditor = forwardRef<UnifiedTinyMCEEditorRef, UnifiedTinyMCEEditorProps>(({
  value = '',
  onChange,
  height = 400,
  menubar = true,
  apiKey = 'l8h0hosopzbynrjtf9m0awv22wmymlxsxjusfnkd1bgtfpqg',
  language = 'tr',
  languageUrl = 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/langs/tr.js',
  enableGallery = true,
  galleryButtonText = 'Galeri',
  showPreviewPane = true,
  showHtmlPane = true,
  showDebugPane = true,
  showConsolePane = true,
  className = '',
  toolbarOverride,
  pluginsOverride,
  contentStyle,
  mediaCategory = 'content-images',
  customFolder
}, ref) => {
  const editorRef = useRef<any>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<{ type: string; message: string; timestamp: string }[]>([]);

  const addLog = useCallback((type: string, message: string) => {
    setConsoleLogs(prev => [...prev, { type, message, timestamp: new Date().toLocaleTimeString() }]);
  }, []);

  const handleEditorChange = useCallback((content: string) => {
    onChange?.(content);
    addLog('log', `İçerik güncellendi (${content.length} karakter)`);
  }, [onChange, addLog]);

  const handleImageSelect = useCallback((media: GlobalMediaFile) => {
    if (!editorRef.current) {
      return;
    }
    const cleanUrl = normalizeUrl(media.url);
    const imgHtml = `<img src="${cleanUrl}" alt="${media.alt || media.originalName}" width="${media.width || 'auto'}" height="${media.height || 'auto'}" style="visibility: visible !important; opacity: 1 !important; display: block !important; max-width: 100%; height: auto;" />`;
    editorRef.current.insertContent(imgHtml);
    addLog('log', `Resim eklendi: ${media.originalName} (${cleanUrl})`);
    setIsGalleryOpen(false);
  }, [addLog]);

  const plugins = useMemo(() => pluginsOverride || DEFAULT_PLUGINS, [pluginsOverride]);
  const toolbar = useMemo(() => toolbarOverride || DEFAULT_TOOLBAR, [toolbarOverride]);

  // language_url'yi apiKey ile hizala (no-api-key kullanılmışsa düzelt)
  const resolvedLanguageUrl = useMemo(() => {
    if (!languageUrl) return undefined as unknown as string;
    if (apiKey && languageUrl.includes('/no-api-key/')) {
      return languageUrl.replace('/no-api-key/', `/${apiKey}/`);
    }
    return languageUrl;
  }, [languageUrl, apiKey]);

  // Tek bir kurulum işlevi: hem init.setup (ed) hem de onInit (evt, ed) ile uyumlu
  const setupEditor = useCallback((maybeEventOrEditor: any, maybeEditor?: any) => {
    const editor = maybeEditor ?? maybeEventOrEditor;
    if (!editor) {
      return;
    }
    editorRef.current = editor;
    if (enableGallery) {
      editor.ui.registry.addButton('customgallery', {
        text: galleryButtonText,
        icon: 'image',
        tooltip: 'Galeriden resim seç',
        onAction: () => setIsGalleryOpen(true)
      });
    }
    addLog('log', 'Editor hazır');
  }, [enableGallery, galleryButtonText, addLog]);

  useImperativeHandle(ref, () => ({
    getContent: () => editorRef.current?.getContent?.() ?? '',
    focus: () => editorRef.current?.focus?.(),
    insertImage: (img) => {
      if (!editorRef.current) return;
      const url = 'url' in img ? img.url : (img as any);
      const cleanUrl = normalizeUrl(url as string);
      const alt = (img as any).alt ?? '';
      const width = (img as any).width ?? 'auto';
      const height = (img as any).height ?? 'auto';
      const html = `<img src="${cleanUrl}" alt="${alt}" width="${width}" height="${height}" style="max-width: 100%; height: auto;" />`;
      editorRef.current.insertContent(html);
    }
  }), []);

  const hasStyle = (value || '').includes('style=');
  const hasFontSize = (value || '').includes('font-size');
  const hasFontFamily = (value || '').includes('font-family');

  return (
    <div className={className}>
      <Editor
        apiKey={apiKey}
        value={value}
        onEditorChange={handleEditorChange}
        onInit={(evt, ed) => setupEditor(evt, ed)}
        init={{
          height,
          menubar,
          language,
          language_url: resolvedLanguageUrl,
          plugins,
          toolbar_mode: 'sliding',
          toolbar,
          setup: (ed) => setupEditor(ed),
          quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote | forecolor backcolor',
          font_formats: 'Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; AkrutiKndPadmini=Akpdmi-n; Times New Roman=times new roman,times,serif; Verdana=verdana,geneva,sans-serif; Georgia=georgia,serif; Helvetica=helvetica,arial,sans-serif; Impact=impact,sans-serif; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco,monospace; Comic Sans MS=comic sans ms,cursive',
          fontsize_formats: '8px 9px 10px 11px 12px 14px 16px 18px 20px 22px 24px 26px 28px 36px 48px 72px',
          content_style: contentStyle || 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px } img { margin: 10px; }',
          relative_urls: false,
          remove_script_host: false,
          branding: false,
          promotion: false,
        }}
      />

      {(showPreviewPane || showHtmlPane || showDebugPane || showConsolePane) && (
        <div className="mt-6 space-y-6">
          {showHtmlPane && (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-semibold mb-2">HTML Çıktısı</div>
              <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-sm"><code>{value}</code></pre>
            </div>
          )}
          {showPreviewPane && (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-semibold mb-2">Önizleme</div>
              <div className="prose max-w-none p-3 border rounded" dangerouslySetInnerHTML={{ __html: value || '' }} />
            </div>
          )}
          {showDebugPane && (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-semibold mb-2">Debug</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="text-xs text-blue-700">Uzunluk</div>
                  <div className="text-sm font-bold text-blue-900">{(value || '').length}</div>
                </div>
                <div className={`p-2 rounded ${hasStyle ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className={`text-xs ${hasStyle ? 'text-green-700' : 'text-red-700'}`}>style=</div>
                  <div className={`text-sm font-bold ${hasStyle ? 'text-green-900' : 'text-red-900'}`}>{hasStyle ? 'VAR' : 'YOK'}</div>
                </div>
                <div className={`p-2 rounded ${hasFontSize ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className={`text-xs ${hasFontSize ? 'text-green-700' : 'text-red-700'}`}>font-size</div>
                  <div className={`text-sm font-bold ${hasFontSize ? 'text-green-900' : 'text-red-900'}`}>{hasFontSize ? 'VAR' : 'YOK'}</div>
                </div>
                <div className={`p-2 rounded ${hasFontFamily ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className={`text-xs ${hasFontFamily ? 'text-green-700' : 'text-red-700'}`}>font-family</div>
                  <div className={`text-sm font-bold ${hasFontFamily ? 'text-green-900' : 'text-red-900'}`}>{hasFontFamily ? 'VAR' : 'YOK'}</div>
                </div>
              </div>
            </div>
          )}
          {showConsolePane && (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm font-semibold mb-2">Olay Günlüğü ({consoleLogs.length})</div>
              <div className="max-h-60 overflow-auto space-y-2">
                {consoleLogs.length === 0 ? (
                  <div className="text-gray-500 text-sm italic">Henüz kayıt yok…</div>
                ) : (
                  consoleLogs.map((l, i) => (
                    <div key={i} className={`p-2 rounded text-xs ${l.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : l.type === 'warn' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' : 'bg-gray-50 text-gray-800 border border-gray-200'}`}>
                      <div className="flex justify-between">
                        <span className="font-mono">{l.message}</span>
                        <span className="opacity-60">{l.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {consoleLogs.length > 0 && (
                <button onClick={() => setConsoleLogs([])} className="mt-2 px-3 py-1 rounded bg-red-500 text-white text-xs">Logları Temizle</button>
              )}
            </div>
          )}
        </div>
      )}

      {enableGallery && isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold">Galeriden Resim Seç</h2>
              <button onClick={() => setIsGalleryOpen(false)} className="px-2 py-1 text-sm border rounded">✕</button>
            </div>
            <div className="h-96 overflow-auto">
              <GlobalMediaSelector
                onSelect={handleImageSelect}
                defaultCategory={mediaCategory}
                acceptedTypes={['image/*']}
                buttonText="Resim Seç"
                title="Resim Seç"
                description="TinyMCE editörü için resim seçin"
                customFolder={customFolder}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

UnifiedTinyMCEEditor.displayName = 'UnifiedTinyMCEEditor';

export default UnifiedTinyMCEEditor;


