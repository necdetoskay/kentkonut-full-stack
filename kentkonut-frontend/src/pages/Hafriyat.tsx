import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getHafriyatPageContent, getHafriyatSahalar, HafriyatPageContent } from '../services/hafriyatService';
import CircularProgress from '../components/hafriyat/CircularProgress';
import ProgressBar from '../components/hafriyat/ProgressBar';

import { API_BASE_URL } from '../config/environment';
import '../styles/hafriyat.css';

const Hafriyat: React.FC = () => {
  const navigate = useNavigate();
  // hafriyatData state'i kaldırıldı - sadece API verisi kullanılıyor
  const [pageContent, setPageContent] = useState<HafriyatPageContent | null>(null);
  const [sahalarData, setSahalarData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Sayfa içeriğini ve sahalar verilerini ayrı ayrı çek
        let contentData;
        let sahalarResponse;
        
        try {
          contentData = await getHafriyatPageContent();
        } catch (contentError) {
          contentData = null;
        }
        
        try {
          sahalarResponse = await getHafriyatSahalar();
        } catch (sahalarError) {
          sahalarResponse = null;
        }
        
        setPageContent(contentData);
        setSahalarData(sahalarResponse);
        
        setLoading(false);
      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }



  if (!pageContent) {
    return (
      <div className="error">
        <p>Sayfa içeriği bulunamadı.</p>
        <p>Debug: pageContent = {JSON.stringify(pageContent)}</p>
        <p>Loading: {loading.toString()}</p>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      

      <div className="hafriyat-container">
        
      

        
        {/* Dinamik İçerik */}
        {pageContent.content && (
          <div className="bg-white rounded-lg px-8 mb-12">
            <div className="max-w-none text-gray-800 leading-relaxed">
              <div 
                className="hafriyat-content"
                dangerouslySetInnerHTML={{ __html: pageContent.content || '' }}
              />
            </div>
          </div>
        )}
        
        {!pageContent.content && (
          <div className="bg-white rounded-lg px-8 mb-12">
            <div className="text-center py-8 space-y-4">
              <p className="text-gray-600">Hafriyat sayfası içeriği henüz eklenmemiş.</p>
              <a href="/dashboard/pages" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">İçerik eklemek için yönetim paneline gidin</a>
            </div>
          </div>
        )}

      {/* Hafriyat İstatistikleri ve Grafik */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hafriyat Sahaları İstatistikleri
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Aktif sahalarımızın durumu ve ilerleme oranları
            </p>
          </div>
          
          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Toplam Saha</p>
                  <p className="text-3xl font-bold">{sahalarData?.data?.sahalar?.length || 0}</p>
                </div>
                <i className="fas fa-map-marked-alt text-3xl text-blue-200"></i>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Aktif Saha</p>
                  <p className="text-3xl font-bold">{(sahalarData?.data?.sahalar || []).filter((s: any) => s?.aktif === true || s?.durum === 'DEVAM_EDIYOR').length || 0}</p>
                </div>
                <i className="fas fa-play-circle text-3xl text-green-200"></i>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Tamamlanan</p>
                  <p className="text-3xl font-bold">{(sahalarData?.data?.sahalar || []).filter((s: any) => s?.durum === 'TAMAMLANDI').length || 0}</p>
                </div>
                <i className="fas fa-check-circle text-3xl text-purple-200"></i>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Ortalama İlerleme</p>
                  <p className="text-3xl font-bold">{Math.round((sahalarData?.data?.sahalar?.reduce((total: number, saha: any) => total + (saha.ilerlemeyuzdesi || 0), 0) / (sahalarData?.data?.sahalar?.length || 1)) || 0)}%</p>
                </div>
                <i className="fas fa-chart-line text-3xl text-orange-200"></i>
              </div>
            </div>
          </div>
          
          {/* Grafik Gösterimi */}
          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Saha İlerleme Durumu
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* İlerleme Grafikleri */}
              <div className="space-y-6">
                {(sahalarData?.data?.sahalar || []).slice(0, 5).map((saha: any) => {
                  const percentage = saha.ilerlemeyuzdesi || 0;
                  const name = saha.ad;
                  return (
                    <div key={saha.id} className="bg-white p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">{name}</span>
                        <span className="text-sm text-gray-500">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Dairesel Grafik Gösterimi */}
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8"></circle>
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="8"
                      strokeDasharray={`${(Math.round((sahalarData?.data?.sahalar?.filter((saha: any) => saha.durum === 'DEVAM_EDIYOR')?.reduce((total: number, saha: any) => total + (saha.ilerlemeyuzdesi || 0), 0) / (sahalarData?.data?.sahalar?.filter((saha: any) => saha.durum === 'DEVAM_EDIYOR')?.length || 1)) || 0) / 100) * 251.2} 251.2`}
                      className="transition-all duration-1000 ease-out"
                    ></circle>
                  </svg>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{Math.round((sahalarData?.data?.sahalar?.filter((saha: any) => saha.durum === 'DEVAM_EDIYOR')?.reduce((total: number, saha: any) => total + (saha.ilerlemeyuzdesi || 0), 0) / (sahalarData?.data?.sahalar?.filter((saha: any) => saha.durum === 'DEVAM_EDIYOR')?.length || 1)) || 0)}%</div>
                      <div className="text-sm text-gray-500">Ortalama İlerleme</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hafriyat Sahaları Listesi */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Hafriyat Sahaları
          </h2>
          
          {sahalarData?.data?.sahalar && sahalarData.data.sahalar.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(sahalarData?.data?.sahalar || []).filter((saha: any) => saha.durum === 'DEVAM_EDIYOR').map((saha: any) => (
                <div key={saha.id} className="bg-white rounded-lg overflow-hidden hover:bg-gray-50 transition-all duration-300">
                  <div className="h-48 relative overflow-hidden">
                    {saha.anaResimUrl ? (
                      <div className="w-full h-full relative">
                        <img 
                          src={saha.anaResimUrl?.startsWith('http') ? saha.anaResimUrl : `${API_BASE_URL}${saha.anaResimUrl}`}
                          alt={saha.ad}
                          className="w-full h-full object-cover"
                          onLoad={() => {
                            console.log('Resim yüklendi:', saha.anaResimUrl);
                          }}
                          onError={(e) => {
                            console.log('Resim yüklenemedi:', saha.anaResimUrl);
                            const target = e.target as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent) {
                              target.style.display = 'none';
                              parent.style.background = 'linear-gradient(to bottom right, #3b82f6, #2563eb)';
                              parent.classList.add('bg-gradient-to-br', 'from-blue-500', 'to-blue-700');
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700"></div>
                    )}
    
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        saha.durum === 'DEVAM_EDIYOR' ? 'bg-green-100 text-green-800' :
                        saha.durum === 'TAMAMLANDI' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {saha.durum === 'DEVAM_EDIYOR' ? 'Devam Ediyor' :
                         saha.durum === 'TAMAMLANDI' ? 'Tamamlandı' :
                         'Planlanan'}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="text-2xl font-bold">{saha.ilerlemeyuzdesi || 0}%</div>
                      <div className="text-sm opacity-90">Tamamlandı</div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{saha.ad}</h3>
                    <div 
                      className="text-gray-600 mb-4 line-clamp-2" 
                      dangerouslySetInnerHTML={{ __html: saha.aciklama || '' }}
                    />
                    
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <i 
                          className="fas fa-map-marker-alt text-blue-500 hover:text-blue-700 w-4 mr-3 cursor-pointer transition-colors duration-200" 
                          onClick={() => {
                            if (saha.enlem && saha.boylam) {
                              const googleMapsUrl = `https://www.google.com/maps?q=${saha.enlem},${saha.boylam}&z=15`;
                              window.open(googleMapsUrl, '_blank');
                            } else {
                              alert('Bu saha için konum bilgisi mevcut değil.');
                            }
                          }}
                          title="Haritada Göster"
                        ></i>
                        <span className="text-gray-600">{saha.konum}</span>
                      </div>
                    </div>
                    
                    {/* İlerleme Çubuğu */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>İlerleme</span>
                        <span>{saha.ilerlemeyuzdesi || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${saha.ilerlemeyuzdesi || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => navigate(`/hafriyat/${saha.seoLink || saha.id}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 font-medium"
                      >
                        Detayları Görüntüle
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                <i className="fas fa-exclamation-triangle text-3xl mb-4"></i>
                <p>Hafriyat sahası verisi bulunamadı.</p>
                <p className="text-sm mt-2">Lütfen daha sonra tekrar deneyiniz.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      
    </div>
    </>
  );
};

export default Hafriyat;