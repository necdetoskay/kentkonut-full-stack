
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';

import { apiClient, ApiResponse } from '../services/apiClient';
import { API_BASE_URL } from '../config/environment';

// Executive arayüzü
interface Executive {
  id: string;
  name: string;
  title: string;
  content: string;
  imageUrl: string | null;
  email: string | null;
  phone: string | null;
  linkedIn: string | null;
}

const YoneticiDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [executive, setExecutive] = useState<Executive | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('Geçerli bir yönetici bilgisi bulunamadı.');
      setLoading(false);
      return;
    }

    const fetchExecutive = async () => {
      try {
        setLoading(true);
        // Yeni, basit endpoint: /api/public/executives/:slug
        const response: ApiResponse<Executive> = await apiClient.get(`/api/public/executives/${slug}`);
        
        if (response.success && response.data) {
          setExecutive(response.data);
        } else {
          setError(response.error || 'Yönetici bilgileri yüklenemedi.');
        }
      } catch (err) {
        setError('Yönetici bilgileri alınırken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchExecutive();
  }, [slug]);

  const getImageUrl = (path: string | null) => {
    if (!path) return '/images/placeholder-person.jpg';
    // Tam URL ise doğrudan kullan
    if (/^https?:\/\//i.test(path)) return path;
    // Config üzerinden backend base URL al
    const backendUrl = API_BASE_URL;
    // Başında / yoksa ekleyerek birleştir
    return `${backendUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  return (
    <>
      <Helmet>
        <title>{executive ? `${executive.name} - Yönetim` : 'Yönetim'} - Kent Konut</title>
        {executive && <meta name="description" content={executive.title} />}
      </Helmet>

      <div className="yonetici-detay-container">
        
        
        <main className="container mx-auto px-4 py-12 mt-24">
          {loading && <div className="text-center">Yükleniyor...</div>}
          {error && <div className="text-center text-red-500">Hata: {error}</div>}
          {!loading && !error && !executive && (
            <div className="text-center">Aranan yönetici bulunamadı.</div>
          )}

          {executive && (
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="flex-shrink-0">
                  <img 
                    src={getImageUrl(executive.imageUrl)}
                    alt={executive.name} 
                    className="w-48 h-48 rounded-full object-cover shadow-lg"
                  />
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-4xl font-bold text-gray-900">{executive.name}</h1>
                  <p className="text-xl text-gray-600 mt-2">{executive.title}</p>
                  {/* İletişim bilgileri istenmediği için kaldırıldı */}
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-semibold mb-4">Hakkında</h2>
                <div 
                  className="max-w-none"
                  dangerouslySetInnerHTML={{ __html: executive.content || '<p>Detaylı bilgi bulunmamaktadır.</p>' }}
                />
              </div>
            </div>
          )}
        </main>
      </div>
      
    </>
  );
};

export default YoneticiDetailPage;
