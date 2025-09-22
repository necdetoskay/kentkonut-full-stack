import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { departmentService, type Department } from '@/services/departmentService';
import { ChevronRight, Users } from 'lucide-react';
import { API_BASE_URL } from '@/config/environment';


const BirimlerPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const res = await departmentService.getDepartments({ isActive: true });
      if (res.success && res.data) {
        setDepartments(res.data);
      } else {
        setError(res.error || 'Birimler yüklenemedi');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const formatImage = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
    return `${API_BASE_URL}/${url}`;
  };

  return (
    <>
      <Helmet>
        <title>Birimlerimiz - Kent Konut</title>
        <meta name="description" content="Kent Konut birimleri ve müdürlükleri" />
      </Helmet>

      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#0b244c] mb-6">Birimlerimiz</h1>

            {loading && (
              <div className="text-center py-10 text-gray-500">Yükleniyor...</div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
                {error}
              </div>
            )}

            {!loading && !error && departments.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg p-4">
                Kayıtlı birim bulunamadı.
              </div>
            )}

            {!loading && !error && departments.length > 0 && (
              <div className="space-y-4">
                {departments.map((dep) => (
                  <a
                    key={dep.id}
                    href={`/kurumsal/birimler/${dep.slug}`}
                    className="group flex items-center justify-between bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-all p-4 md:p-5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-base md:text-lg font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                          {dep.name}
                        </div>
                        {dep.director?.name && (
                          <div className="text-sm text-gray-500">Müdür: {dep.director?.name}</div>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
    </>
  );
};

export default BirimlerPage;