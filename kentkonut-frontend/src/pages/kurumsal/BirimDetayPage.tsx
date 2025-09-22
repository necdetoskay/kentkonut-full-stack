import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { departmentService, type Department } from '@/services/departmentService';
import { API_BASE_URL } from '@/config/environment';

const BirimDetayPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartment = async () => {
      if (!slug) {
        setError('Birim bilgisi bulunamadı.');
        setLoading(false);
        return;
      }
      setLoading(true);
      console.log('Fetching department for slug:', slug); // Eklendi
      const res = await departmentService.getDepartmentBySlug(slug);
      console.log('API response:', res); // Eklendi
      if (res.success && res.data) {
        console.log('Setting department:', res.data.data); // .data eklendi
        setDepartment(res.data.data);
      } else {
        console.error('Failed to fetch department:', res.error); // Eklendi
        setError(res.error || 'Birim detayı yüklenemedi.');
      }
      setLoading(false);
    };
    fetchDepartment();
  }, [slug]);

  const getImageUrl = (url?: string | null) => {
    if (!url) return 'https://via.placeholder.com/192'; // Placeholder
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  if (loading) {
    return <div className="text-center py-20">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">Hata: {error}</div>;
  }

  if (!department) {
    return <div className="text-center py-20">Birim bulunamadı.</div>;
  }

  return (
    <>
      <Helmet>
        <title>{`${department.name} - Kent Konut`}</title>
        <meta name="description" content={`${department.name} birimi ve hizmetleri.`} />
      </Helmet>

      <div className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                {/* Sol Sütun: Yönetici Bilgileri */}
                <div className="md:col-span-1 flex flex-col items-center text-center">
                    {department.director && (
                        <>
                            <div className="relative">
                                <img 
                                    className="w-48 h-48 rounded-full object-cover shadow-lg"
                                    src={getImageUrl(department.director.imageUrl)}
                                    alt={department.director.name}
                                />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mt-4">{department.director.name}</h2>
                            <p className="text-md text-gray-600 mt-1">{department.director.title}</p>
                            {department.director.slug && (
                                <a 
                                    href={`/yonetici/${department.director.slug}`}
                                    className="mt-6 inline-block border border-gray-300 text-gray-700 rounded-md px-6 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
                                >
                                    Özgeçmiş
                                </a>
                            )}
                        </>
                    )}
                </div>

                {/* Sağ Sütun: Birim Açıklaması */}
                <div className="md:col-span-2">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">{department.name}</h1>
                    <div 
                        className="text-gray-700 leading-relaxed text-justify prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: department.content || '' }}
                    />
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default BirimDetayPage;
