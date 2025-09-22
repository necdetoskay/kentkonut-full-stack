'use client';

import { useState, useEffect } from 'react';
import RichTextEditor from '@/components/ui/rich-text-editor-tiptap';

export default function TestFontSizePage() {
  const [content, setContent] = useState('<p>Bu bir test metnidir. Font boyutunu değiştirmeyi deneyin.</p>');
  const [logs, setLogs] = useState<string[]>([]);

  // Capture console logs
  useEffect(() => {
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      if (message.includes('🎯') || message.includes('📝') || message.includes('📋') || 
          message.includes('🆕') || message.includes('📄') || message.includes('✅') || 
          message.includes('🗑️')) {
        setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
      }
      
      originalLog(...args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  const clearLogs = () => setLogs([]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">TipTap Font Size Test</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Rich Text Editor:</h2>
          <div className="bg-yellow-50 p-3 rounded mb-2 text-sm">
            <strong>Test Adımları:</strong>
            <ol className="list-decimal list-inside mt-1">
              <li>Metni seçin</li>
              <li>Font boyutu dropdown'ından bir boyut seçin</li>
              <li>Aşağıdaki HTML çıktısında style="font-size:..." olup olmadığını kontrol edin</li>
              <li>Console log'larını inceleyin</li>
            </ol>
          </div>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Metni seçin ve font boyutunu değiştirin..."
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">HTML Output:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40">
            {content}
          </pre>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Rendered Content:</h2>
          <div 
            className="border p-4 rounded bg-white min-h-20"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Debug Info:</h2>
          <div className="bg-blue-50 p-4 rounded text-sm">
            <p><strong>Content Length:</strong> {content.length}</p>
            <p><strong>Has style attribute:</strong> {content.includes('style=') ? 'Yes' : 'No'}</p>
            <p><strong>Has font-size:</strong> {content.includes('font-size') ? 'Yes' : 'No'}</p>
            <p><strong>Has textStyle class:</strong> {content.includes('text-style') ? 'Yes' : 'No'}</p>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            Console Logs 
            <button 
              onClick={clearLogs}
              className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
            >
              Temizle
            </button>
          </h2>
          <div className="bg-black text-green-400 p-4 rounded text-xs font-mono max-h-60 overflow-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">Henüz log yok. Font boyutu değiştirmeyi deneyin...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}