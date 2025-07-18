'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { convertTipTapToQuill, convertQuillToDisplay } from '@/lib/content-migration';

// Dynamic import to avoid SSR issues
const QuillEditor = dynamic(() => import('@/components/editors/QuillEditor'), { ssr: false });

const TestQuillPage = () => {
  const [isClient, setIsClient] = useState(false);
  const [content, setContent] = useState(`
    <h2>Quill Editor Test - Kent Konut</h2>
    <p>Bu test sayfası Quill editörünün floating image özelliklerini test etmek için oluşturulmuştur.</p>
    <p>Aşağıdaki özellikler test edilecek:</p>
    <ul>
      <li>Sol tarafa float edilmiş resimler</li>
      <li>Sağ tarafa float edilmiş resimler</li>
      <li>Ortalanmış resimler</li>
      <li>Metin sarma (text wrapping) davranışı</li>
      <li>WYSIWYG tutarlılığı</li>
    </ul>
  `);

  const [displayContent, setDisplayContent] = useState('');
  const [migrationTest, setMigrationTest] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sample TipTap content for migration testing
  const sampleTipTapContent = `
    <h2>TipTap İçerik Örneği</h2>
    <p>Bu içerik TipTap formatında yazılmıştır.</p>
    <div class="image-wrapper float-left" data-type="image-wrapper" style="width: 300px;">
      <img src="/api/media/sample-image.jpg" alt="Test Resmi" style="width: 100%; height: auto;" />
    </div>
    <p>Bu paragraf resmin yanında görünmelidir. Metin resmin etrafında doğal olarak sarılmalıdır. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    <p>Bu ikinci paragraf da resmin yanında devam etmelidir. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    <h3>Alt Başlık</h3>
    <p>Bu başlık float'ı temizlemelidir.</p>
  `;

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    // Update display content for comparison
    setDisplayContent(convertQuillToDisplay(newContent));
  };

  const testMigration = () => {
    const converted = convertTipTapToQuill(sampleTipTapContent);
    setMigrationTest(converted);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Quill Editor Test Sayfası</h1>
      
      {/* Editor Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Editör</h2>
        <div className="border rounded-lg">
          {isClient ? (
            <QuillEditor
              value={content}
              onChange={handleContentChange}
              height={400}
              placeholder="Test içeriği yazın ve resim ekleyin..."
              imageTargetWidth={600}
              imageTargetHeight={400}
            />
          ) : (
            <div className="p-4 bg-gray-50">
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Display Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Frontend Görünümü (WYSIWYG Test)</h2>
        <div className="border rounded-lg p-4 bg-gray-50">
          <div 
            className="content-display"
            dangerouslySetInnerHTML={{ __html: displayContent || content }}
          />
        </div>
      </div>

      {/* Migration Test Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">TipTap → Quill Migration Test</h2>
        <button
          onClick={testMigration}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Migration
        </button>
        
        {migrationTest && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Original TipTap HTML</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-60">
                {sampleTipTapContent}
              </pre>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Converted Quill HTML</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-60">
                {migrationTest}
              </pre>
            </div>
          </div>
        )}
        
        {migrationTest && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Migrated Content Preview</h3>
            <div className="border rounded-lg p-4 bg-white">
              <div 
                className="content-display"
                dangerouslySetInnerHTML={{ __html: migrationTest }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Test Talimatları</h2>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Floating Image Test:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Editörde resim butonuna tıklayın</li>
            <li>Galeri'den bir resim seçin</li>
            <li>Konum olarak "Sol (Metin sağda)" seçin</li>
            <li>Resmi ekleyin</li>
            <li>Resmin yanına metin yazın</li>
            <li>Metnin resmin etrafında doğal olarak sarıldığını kontrol edin</li>
            <li>Editör görünümü ile frontend görünümünü karşılaştırın</li>
          </ol>
          
          <h3 className="font-medium mb-2 mt-4">WYSIWYG Consistency Test:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Editördeki görünüm ile "Frontend Görünümü" bölümü aynı olmalı</li>
            <li>Floating resimler her iki bölümde de aynı konumda olmalı</li>
            <li>Metin sarma davranışı tutarlı olmalı</li>
            <li>Resim boyutları ve spacing aynı olmalı</li>
          </ul>
        </div>
      </div>

      {/* Raw Content Debug */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Debug - Raw HTML</h2>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
          {content}
        </pre>
      </div>
    </div>
  );
};

export default TestQuillPage;
