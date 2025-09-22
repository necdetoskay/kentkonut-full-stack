
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/environment';

const NewsSection = () => {
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/news?limit=3`)
      .then(res => {
        if (!res.ok) throw new Error('Haberler alınamadı');
        return res.json();
      })
      .then(data => {
        // Mapping: API'den gelen haberleri NewsCard formatına dönüştür
        const mapped = (data.news || []).map((item: any) => {
          let image = item.media?.url
            ? (item.media.url.startsWith('http')
                ? item.media.url
                : API_BASE_URL + item.media.url)
            : 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80';
          return {
            id: item.id,
            title: item.title,
            date: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
            excerpt: item.summary || item.content?.slice(0, 100) || '',
            image,
            url: `/haberler/${item.slug}`,
          };
        });
        setNewsItems(mapped);
      })
      .catch(err => {
        setError(err.message || 'Haberler alınamadı');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="kent-container">
        <div className="text-center mb-12">
          <h2 className="section-title">Bizden Haberler</h2>
          <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
            Kent Konut'tan en güncel gelişmeler, projeler ve sektör haberleri.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10">Haberler yükleniyor...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : newsItems.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Henüz haber eklenmemiş.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {newsItems.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        )}

        <div className="text-center mt-8 sm:mt-12">
          <Button 
            variant="outline" 
            className="border-kentblue text-kentblue hover:bg-kentblue hover:text-white"
            asChild
          >
            <a href="/haberler" className="flex items-center">
              Tüm Haberlerimiz <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

interface NewsCardProps {
  news: {
    id: number;
    title: string;
    date: string;
    excerpt: string;
    image: string;
    url: string;
  };
}

const NewsCard = ({ news }: NewsCardProps) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md motion-safe:hover:shadow-2xl motion-safe:hover:-translate-y-1 motion-safe:transition-all motion-safe:duration-300 motion-safe:ease p-4 sm:p-6">
      <a href={news.url} className="block">
        <div className="relative w-full h-44 sm:h-56 overflow-hidden">
          <img 
            src={news.image} 
            alt={news.title} 
            className="w-full h-full object-cover motion-safe:hover:scale-105 motion-safe:transition-transform motion-safe:duration-500"
            loading="lazy"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{news.date}</span>
          </div>
          <h3 className="text-lg md:text-xl font-bold mb-3 text-kentblue hover:text-kentgold transition-colors truncate">
            {news.title}
          </h3>
          <p className="text-gray-600 text-sm md:text-base line-clamp-3">
            {news.excerpt}
          </p>
          <div className="mt-4 text-sm font-medium text-kentblue hover:text-kentgold transition-colors">
            Devamını oku
          </div>
        </div>
      </a>
    </div>
  );
};

export default NewsSection;
