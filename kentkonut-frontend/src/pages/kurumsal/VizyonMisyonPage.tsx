import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { apiClient } from '@/services/apiClient';

interface CorporateContentItem {
  id: string;
  type: 'VISION' | 'MISSION' | 'STRATEGY' | 'GOALS' | 'ABOUT';
  title: string;
  content: string; // HTML
  imageUrl?: string | null;
  icon?: string | null;
  order?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const VizyonMisyonPage: React.FC = () => {
  const [vision, setVision] = useState<CorporateContentItem | null>(null);
  const [mission, setMission] = useState<CorporateContentItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [visionRes, missionRes] = await Promise.all([
          apiClient.get<CorporateContentItem[]>(`/api/corporate-content/type/VISION`),
          apiClient.get<CorporateContentItem[]>(`/api/corporate-content/type/MISSION`),
        ]);

        if (!mounted) return;

        if (!visionRes.success && !missionRes.success) {
          setError(visionRes.error || missionRes.error || 'İçerik yüklenemedi');
          setVision(null);
          setMission(null);
          return;
        }

        const firstVision = Array.isArray(visionRes.data) ? visionRes.data[0] : null;
        const firstMission = Array.isArray(missionRes.data) ? missionRes.data[0] : null;

        setVision(firstVision || null);
        setMission(firstMission || null);
      } catch (err) {
        console.error('Vizyon & Misyon içerikleri yüklenirken hata:', err);
        if (mounted) {
          setError('Bir hata oluştu, lütfen daha sonra tekrar deneyin.');
          setVision(null);
          setMission(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  const renderSection = (item: CorporateContentItem | null, fallbackTitle: string) => {
    if (!item) return null;

    const safeHtml = DOMPurify.sanitize(item.content || '');

    return (
      <section className="bg-white rounded-lg p-6 md:p-8 shadow-sm">
        <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-4">
          {item.title || fallbackTitle}
        </h2>
        <div
          className="prose max-w-none text-gray-700 leading-relaxed text-justify"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </section>
    );
  };

  return (
    <>
      <Helmet>
        <title>Vizyon & Misyon - Kent Konut</title>
        <meta name="description" content="Kent Konut'un vizyon ve misyon bilgileri" />
        <meta property="og:title" content="Vizyon & Misyon - Kent Konut" />
        <meta property="og:description" content="Kent Konut'un vizyon ve misyon bilgileri" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero Section */}
      <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 mt-16 md:mt-20 bg-[url('/images/antet_kurumsal.jpg')] bg-cover bg-center flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" />
        <h1 className="relative z-10 text-white text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow-lg">
          Vizyon & Misyon
        </h1>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Hata Oluştu</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-6 md:gap-8">
            {/* Vizyon */}
            {renderSection(vision, 'Vizyon')}
            {/* Misyon */}
            {renderSection(mission, 'Misyon')}

            {/* Fallback mesajı */}
            {!vision && !mission && (
              <div className="text-center py-8">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">İçerik Bulunamadı</h3>
                  <p className="text-gray-600">Vizyon ve Misyon içerikleri henüz eklenmemiş olabilir.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default VizyonMisyonPage;