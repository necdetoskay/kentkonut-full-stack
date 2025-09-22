
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, FileText, Image as ImageIcon } from 'lucide-react';
import { hafriyatService } from '../services/hafriyatService';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import DOMPurify from 'dompurify';
import { API_BASE_URL } from '../config/environment';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";


interface HafriyatSaha {
  id: string;
  ad: string;
  konumAdi: string;
  enlem: number;
  boylam: number;
  durum: string;
  ilerlemeyuzdesi: number;
  tonBasiUcret: number;
  kdvOrani: number;
  anaResimUrl?: string;
  toplamTon?: number;
  tamamlananTon?: number;
  baslangicTarihi?: string;
  tahminibitisTarihi?: string;
  aciklama?: string;
  bolge: {
    id: string;
    ad: string;
    yetkiliKisi: string;
    yetkiliTelefon: string;
    yetkiliEmail?: string;
  };
  belgeler: Array<{
    id: string;
    baslik: string;
    kategori: {
      ad: string;
      ikon: string;
    };
  }>;
  resimler: Array<{
    id: string;
    baslik: string;
    dosyaYolu: any;
  }>;
  _count: {
    belgeler: number;
    resimler: number;
  };
  aktif: boolean;
  olusturulmaTarihi: string;
  guncellemeTarihi: string;
}

const IlerlemePieChart = ({ ilerleme }: { ilerleme: number }) => {
  const data = [
    { name: 'Tamamlandı', value: ilerleme },
    { name: 'Kalan', value: 100 - ilerleme },
  ];
  const COLORS = ['#3b82f6', '#e5e7eb']; // blue-500, gray-200

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">İlerleme Durumu</h3>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value}%`} />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-gray-900">
              {`${ilerleme}%`}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const HafriyatDetay: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [saha, setSaha] = useState<HafriyatSaha | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const apiBaseUrl = API_BASE_URL;

  const getFullImageUrl = (path: any) => {
    if (!path) return '';
    const url = typeof path === 'object' && path !== null ? path.url : path;
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('//')) return url;
    return `${apiBaseUrl}${url}`;
  };

  useEffect(() => {
    const fetchSahaDetay = async () => {
      if (!slug) {
        setError('Saha slug bulunamadı');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await hafriyatService.getSahaDetay(slug);
        
        if (response && response.success && response.data && response.data.success) {
          setSaha(response.data.data);
        } else {
          setError(response?.error || 'Saha bulunamadı veya erişilemedi.');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Saha detayları yüklenirken bir hata oluştu.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSahaDetay();
  }, [slug]);

  const handleMapClick = () => {
    if (saha?.enlem && saha?.boylam) {
      const googleMapsUrl = `https://www.google.com/maps?q=${saha.enlem},${saha.boylam}`;
      window.open(googleMapsUrl, '_blank');
    } else {
      alert('Bu saha için konum bilgisi bulunmamaktadır.');
    }
  };

  const getDurumBadgeClass = (durum: string) => {
    switch (durum) {
      case 'DEVAM_EDIYOR':
        return 'bg-blue-100 text-blue-800';
      case 'TAMAMLANDI':
        return 'bg-green-100 text-green-800';
      case 'PLANLANIYOR':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDurumText = (durum: string) => {
    switch (durum) {
      case 'DEVAM_EDIYOR':
        return 'Devam Ediyor';
      case 'TAMAMLANDI':
        return 'Tamamlandı';
      case 'PLANLANIYOR':
        return 'Planlanıyor';
      default:
        return durum;
    }
  };

  const tonUcretiKdvli = saha ? saha.tonBasiUcret * (1 + saha.kdvOrani / 100) : 0;
  
  const mainImageSrc = saha?.anaResimUrl ? getFullImageUrl(saha.anaResimUrl) : '';
  const galleryImages = saha?.resimler || [];
  
  const allImagesForLightbox = [];
  if (saha && mainImageSrc) {
    allImagesForLightbox.push({ src: mainImageSrc, title: saha.ad || 'Ana Resim' });
  }
  if (saha && galleryImages) {
    galleryImages.forEach(r => {
      allImagesForLightbox.push({ src: getFullImageUrl(r.dosyaYolu), title: r.baslik });
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Saha detayları yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hata Oluştu</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/hafriyat')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Hafriyat Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  if (!saha) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-yellow-500 text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Saha Bulunamadı</h2>
          <p className="text-gray-600 mb-4">Aradığınız hafriyat sahası bulunamadı.</p>
          <button
            onClick={() => navigate('/hafriyat')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Hafriyat Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                        onClick={() => navigate('/hafriyat')}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Geri Dön
                        </button>
                        <div>
                        <h1 className="text-3xl font-bold text-gray-900">{saha?.ad || 'Yükleniyor...'}</h1>
                        <p className="text-gray-600">{saha?.konumAdi || ''}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        {saha && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDurumBadgeClass(saha.durum)}`}>
                            {getDurumText(saha.durum)}
                        </span>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ana İçerik */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Image */}
              {saha && mainImageSrc && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <img
                    src={mainImageSrc}
                    alt={saha.ad}
                    className="w-full h-96 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
                  />
                </div>
              )}

              {/* Açıklama */}
              {saha && saha.aciklama && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Açıklama</h2>
                  <div className="text-gray-700 leading-relaxed prose" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(saha.aciklama) }} />
                </div>
              )}

              {/* Other Images */}
              {saha && galleryImages.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Diğer Resimler
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {galleryImages.map((resim, index) => (
                      <div key={resim.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setLightboxIndex(mainImageSrc ? index + 1 : index); setLightboxOpen(true); }}>
                        <img
                          src={getFullImageUrl(resim.dosyaYolu)}
                          alt={resim.baslik}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-3">
                          <h3 className="font-medium text-gray-900 text-sm">{resim.baslik}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Belgeler */}
              {saha && saha.belgeler && saha.belgeler.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Belgeler ({saha?._count?.belgeler || 0})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {saha.belgeler.map((belge) => (
                      <div key={belge.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{belge.kategori.ikon}</div>
                          <div>
                            <h3 className="font-medium text-gray-900">{belge.baslik}</h3>
                            <p className="text-sm text-gray-600">{belge.kategori.ad}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* İlerleme Durumu */}
              {saha && <IlerlemePieChart ilerleme={saha.ilerlemeyuzdesi} />}

              {/* Konum Bilgileri */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Konum Bilgileri</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Konum</p>
                      <p className="text-sm text-gray-600">{saha?.konumAdi}</p>
                    </div>
                  </div>
                  {saha.enlem && saha.boylam && (
                    <button
                      onClick={handleMapClick}
                      className="w-full mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>Haritada Göster</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Bölge Bilgileri */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bölge Bilgileri</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Bölge</p>
                      <p className="text-sm text-gray-600">{saha?.bolge?.ad}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-5 w-5 text-gray-400 mt-0.5 flex items-center justify-center">
                      👤
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Yetkili Kişi</p>
                      <p className="text-sm text-gray-600">{saha?.bolge?.yetkiliKisi}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="h-5 w-5 text-gray-400 mt-0.5 flex items-center justify-center">
                      📞
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Telefon</p>
                      <p className="text-sm text-gray-600">
                        <a href={`tel:${saha?.bolge?.yetkiliTelefon}`} className="hover:text-blue-600 transition-colors">
                          {saha?.bolge?.yetkiliTelefon}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maliyet Bilgileri */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Maliyet Bilgileri</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">KDV Dahil Ton Ücreti</span>
                    <span className="text-xl font-bold text-blue-600">{tonUcretiKdvli.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={allImagesForLightbox}
        index={lightboxIndex}
      />
    </>
  );
};

export default HafriyatDetay;
