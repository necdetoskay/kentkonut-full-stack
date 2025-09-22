import React, { useState, useEffect, useMemo, useCallback } from 'react';

import { ExternalLink, Calendar, Search } from 'lucide-react';
import { getApiBaseUrl } from '../config/ports';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  slug: string;
  image?: string;
  publishedAt?: string;
  media?: {
    url?: string;
  };
}

const backendBase = getApiBaseUrl();

const Haberler = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const filteredNews = useMemo(() => {
    if (!searchTerm.trim()) return news;
    const lower = searchTerm.toLowerCase();
    return news.filter(item =>
      item.title.toLowerCase().includes(lower) ||
      (item.summary && item.summary.toLowerCase().includes(lower))
    );
  }, [searchTerm, news]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${backendBase}/api/news?published=true`)
      .then(res => {
        if (!res.ok) throw new Error('Haberler alınamadı');
        return res.json();
      })
      .then(data => {
        setNews(data.news || []);
      })
      .catch(err => {
        setError(err.message || 'Bilinmeyen hata');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      {/* KALDIRILDI: Bizden Haberler başlığı ve açıklama */}
      <section className="py-16 flex-1">
        <div className="kent-container">
          {/* Header Spacer */}
          <div className="h-20 md:h-24" />
          {/* Modern Arama Kutusu */}
          <div className="flex justify-center mb-10">
            <div className="relative w-full max-w-xl">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-kentblue focus:ring-2 focus:ring-kentblue/30 transition placeholder-gray-400 text-gray-900 shadow-sm bg-white hover:border-kentblue/60 focus:outline-none"
                placeholder="Haberlerde ara..."
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
              />
            </div>
          </div>
          {loading ? (
            <div className="text-center py-10"><p>Haberler yükleniyor...</p></div>
          ) : error ? (
            <div className="text-center py-10"><p className="text-red-500">{error}</p></div>
          ) : filteredNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNews.map((item) => {
                // Ana resim alanı: önce image, yoksa media.url
                const imageUrl = item.image
                  ? (item.image.startsWith('http') ? item.image : backendBase + item.image)
                  : item.media && item.media.url
                    ? (item.media.url.startsWith('http') ? item.media.url : backendBase + item.media.url)
                  : null;
                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                    <div className="h-48 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400">Görsel yok</div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h2 className="text-xl font-bold mb-2 text-kentblue line-clamp-2">{item.title}</h2>
                      <p className="text-gray-600 mb-4 line-clamp-3">{item.summary}</p>
                      <div className="flex items-center text-sm text-gray-400 mb-4">
                        <Calendar className="h-4 w-4 mr-1" />
                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                      </div>
                      <a
                        href={`/haberler/${item.slug}`}
                        className="mt-auto inline-flex items-center text-kentblue hover:underline font-medium"
                      >
                        Haberin Detayı <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">Henüz haber eklenmemiş.</div>
          )}
        </div>
      </section>
      
    </div>
  );
};

export default Haberler;