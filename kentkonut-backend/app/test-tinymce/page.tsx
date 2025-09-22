'use client';

import { Editor } from '@tinymce/tinymce-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GlobalMediaSelector, GlobalMediaFile } from '@/components/media/GlobalMediaSelector';
import { UnifiedTinyMCEEditor } from '@/components/tinymce';

interface ConsoleLog {
  type: string;
  message: string;
  timestamp: string;
}

export default function TestTinyMCEPage() {
  const [content, setContent] = useState('<p>TinyMCE editörünü test edin...</p>');
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const editorRef = useRef<any>(null);

  // Manuel log ekleme fonksiyonu
  const addLog = useCallback((type: string, message: string) => {
    setConsoleLogs(prev => [...prev, {
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  }, []);

  const handleEditorChange = (newContent: string) => {
    setContent(newContent);
    addLog('log', `TinyMCE içerik değişti: ${newContent.length} karakter`);
  };

  // Galeri seçme fonksiyonu
  const handleImageSelect = useCallback((media: GlobalMediaFile) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      // URL'deki ../../ ön ekini temizle
      let cleanUrl = media.url;
      if (cleanUrl.startsWith('../../')) {
        cleanUrl = cleanUrl.replace(/^\.\.\//g, '/');
      }
      // Eğer / ile başlamıyorsa ekle
      if (!cleanUrl.startsWith('/') && !cleanUrl.startsWith('http')) {
        cleanUrl = '/' + cleanUrl;
      }
      
      const imgHtml = `<img src="${cleanUrl}" alt="${media.alt || media.originalName}" width="${media.width || 'auto'}" height="${media.height || 'auto'}" style="visibility: visible !important; opacity: 1 !important; display: block !important;" />`;
      editor.insertContent(imgHtml);
      addLog('log', `Resim eklendi: ${media.originalName}, Clean URL: ${cleanUrl}`);
    }
    setIsGalleryOpen(false);
  }, [addLog]);

  // Setup fonksiyonu
  const setupEditor = useCallback((editor: any) => {
    addLog('log', 'TinyMCE setup fonksiyonu çağrıldı');
    editorRef.current = editor;
    
    // Özel galeri butonu ekleme
    editor.ui.registry.addButton('customgallery', {
      text: 'Galeri',
      icon: 'image',
      tooltip: 'Galeriden resim seç',
      onAction: () => {
        addLog('log', 'Galeri butonu tıklandı');
        setIsGalleryOpen(true);
      }
    });
    addLog('log', 'Galeri butonu eklendi');
  }, [addLog, setIsGalleryOpen]);

  // onInit fonksiyonu
  const onEditorInit = useCallback((evt: any, editor: any) => {
    addLog('log', 'TinyMCE onInit çağrıldı');
    editorRef.current = editor;
    
    // Özel galeri butonu ekleme
    editor.ui.registry.addButton('customgallery', {
      text: 'Galeri',
      icon: 'image',
      tooltip: 'Galeriden resim seç',
      onAction: () => {
        addLog('log', 'Galeri butonu tıklandı');
        setIsGalleryOpen(true);
      }
    });
    addLog('log', 'Galeri butonu eklendi (onInit)');
  }, [addLog, setIsGalleryOpen]);

  const clearLogs = () => {
    setConsoleLogs([]);
  };

  // Debug bilgileri
  const hasStyleAttribute = content.includes('style=');
  const hasFontSize = content.includes('font-size');
  const hasFontFamily = content.includes('font-family');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          TinyMCE Test Sayfası
        </h1>

        {/* Yeni Advanced TinyMCE Editör */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Yeni Advanced TinyMCE Editör
          </h2>
          <UnifiedTinyMCEEditor
            value={content}
            onEditorChange={(newContent) => setContent(newContent)}
            ref={editorRef}
          />
        </div>

        {/* Eski TinyMCE Editör */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Eski TinyMCE Editör
          </h2>
          <Editor
            apiKey="l8h0hosopzbynrjtf9m0awv22wmymlxsxjusfnkd1bgtfpqg"
            value={content}
            onEditorChange={handleEditorChange}
            onInit={onEditorInit}
            init={{
              height: 400,
              menubar: true,
              language: 'tr',
              language_url: 'https://cdn.tiny.cloud/1/l8h0hosopzbynrjtf9m0awv22wmymlxsxjusfnkd1bgtfpqg/tinymce/6/langs/tr.js',
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
              ],
              setup: setupEditor,
              init_instance_callback: setupEditor,
              toolbar_mode: 'sliding',
              toolbar: 'undo redo | fontfamily fontsize | ' +
                  'bold italic | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'customgallery image | removeformat | help',
              font_formats: 'Arial=arial,helvetica,sans-serif; ' +
                'Courier New=courier new,courier,monospace; ' +
                'AkrutiKndPadmini=Akpdmi-n; ' +
                'Times New Roman=times new roman,times,serif; ' +
                'Verdana=verdana,geneva,sans-serif; ' +
                'Georgia=georgia,serif; ' +
                'Helvetica=helvetica,arial,sans-serif; ' +
                'Impact=impact,sans-serif; ' +
                'Tahoma=tahoma,arial,helvetica,sans-serif; ' +
                'Terminal=terminal,monaco,monospace; ' +
                'Comic Sans MS=comic sans ms,cursive',
              fontsize_formats: '8px 9px 10px 11px 12px 14px 16px 18px 20px 22px 24px 26px 28px 36px 48px 72px',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px } img { margin: 10px; }' 
            }}
          />
        </div>

        {/* HTML Çıktısı */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            HTML Çıktısı
          </h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{content}</code>
          </pre>
        </div>

        {/* Render Edilmiş İçerik */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Render Edilmiş İçerik
          </h2>
          <div 
            className="prose max-w-none p-4 border rounded-lg"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {/* Debug Bilgileri */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Debug Bilgileri
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">İçerik Uzunluğu</div>
              <div className="text-lg font-bold text-blue-900">{content.length}</div>
            </div>
            <div className={`p-3 rounded-lg ${
              hasStyleAttribute ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className={`text-sm font-medium ${
                hasStyleAttribute ? 'text-green-600' : 'text-red-600'
              }`}>Style Attribute</div>
              <div className={`text-lg font-bold ${
                hasStyleAttribute ? 'text-green-900' : 'text-red-900'
              }`}>{hasStyleAttribute ? 'VAR' : 'YOK'}</div>
            </div>
            <div className={`p-3 rounded-lg ${
              hasFontSize ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className={`text-sm font-medium ${
                hasFontSize ? 'text-green-600' : 'text-red-600'
              }`}>Font Size</div>
              <div className={`text-lg font-bold ${
                hasFontSize ? 'text-green-900' : 'text-red-900'
              }`}>{hasFontSize ? 'VAR' : 'YOK'}</div>
            </div>
            <div className={`p-3 rounded-lg ${
              hasFontFamily ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className={`text-sm font-medium ${
                hasFontFamily ? 'text-green-600' : 'text-red-600'
              }`}>Font Family</div>
              <div className={`text-lg font-bold ${
                hasFontFamily ? 'text-green-900' : 'text-red-900'
              }`}>{hasFontFamily ? 'VAR' : 'YOK'}</div>
            </div>
          </div>
        </div>

        {/* Console Logları */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Console Logları ({consoleLogs.length})
            </h2>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logları Temizle
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {consoleLogs.length === 0 ? (
              <p className="text-gray-500 italic">Henüz log yok...</p>
            ) : (
              <div className="space-y-2">
                {consoleLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-sm ${
                      log.type === 'error'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : log.type === 'warn'
                        ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                        : 'bg-gray-50 text-gray-800 border border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono">{log.message}</span>
                      <span className="text-xs opacity-60 ml-2">
                        {log.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Galeri Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Galeriden Resim Seç</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsGalleryOpen(false)}
              >
                ✕
              </Button>
            </div>
            <div className="h-96 overflow-auto">
              <GlobalMediaSelector
                onSelect={handleImageSelect}
                defaultCategory="content-images"
                acceptedTypes={['image/*']}
                buttonText="Resim Seç"
                title="Resim Seç"
                description="TinyMCE editörü için resim seçin"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}