import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import HighlightCard from '../components/HighlightCard';
import { highlightsService, Highlight } from '../services/highlightsService';
import { pageService, Page } from '../services/pageService';

// Define the structure of the content JSON
interface ContentBlock {
  id: string;
  type: string;
  content?: string;
  order: number;
  isActive: boolean;
}

interface ContentData {
  blocks: ContentBlock[];
  version: string;
  updatedAt: string;
}

const KurumsalPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [renderedHtml, setRenderedHtml] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (slug) {
          const response = await pageService.getPageBySlug(slug);
          if (response.success && response.data) {
            setPage(response.data);
            // Parse the content JSON and extract HTML
            if (response.data.content) {
              try {
                const contentData: ContentData = JSON.parse(response.data.content);
                const textBlock = contentData.blocks.find(block => block.type === 'text' && block.isActive);
                if (textBlock && textBlock.content) {
                  // Wrap centered images with the utility class
                  const finalHtml = textBlock.content.replace(
                    /(<p style="[^"]*text-align: center;[^"]*">\s*<img[^>]+>\s*<\/p>)/g,
                    (match) => `<div class="center-image-container">${match}</div>`
                  );
                  setRenderedHtml(finalHtml);
                } else {
                  setRenderedHtml('<p>İçerik bulunamadı.</p>');
                }
              } catch (parseError) {
                console.error('Failed to parse page content JSON:', parseError);
                setRenderedHtml(`<p>İçerik yüklenirken bir hata oluştu: ${parseError}</p>`);
              }
            } else {
              setRenderedHtml('<p>Sayfa içeriği boş.</p>');
            }
          } else {
            setError(response.error || 'Sayfa yüklenemedi.');
          }
        } else {
          const response = await highlightsService.getActiveHighlights();
          if (response.success) {
            setHighlights(response.data);
          } else {
            setError(response.error || 'Öne çıkanlar yüklenemedi.');
          }
        }
      } catch (err) {
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="text-center text-gray-500">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 bg-red-100 p-4 rounded-md">
        <p>Hata: {error}</p>
      </div>
    );
  }

  if (slug && page) {
    return (
      <div className="bg-gray-50 py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight">
              {page.title}
            </h1>
          </div>
          <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 tracking-tight">
            Kurumsal Değerlerimiz ve Hizmetlerimiz
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-600">
            Kent Konut olarak, modern yaşam alanları ve sürdürülebilir projelerle geleceği inşa ediyoruz.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {highlights.map((highlight) => (
            <div key={highlight.id} className="w-full max-w-sm">
              <HighlightCard highlight={highlight} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KurumsalPage;