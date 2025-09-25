import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { API_BASE_URL } from '../config/environment';

interface ProjectData {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  status: string;
  published: boolean;
  publishedAt?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  yil?: string;
  blokDaireSayisi?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  province?: string;
  district?: string;
  address?: string;
  media?: {
    id: string;
    url: string;
    filename: string;
    type: string;
  };
  bannerUrl?: string;
  tags: Array<{
    tag: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
}

interface GalleryItem {
  id: number;
  title: string;
  description?: string;
  order: number;
  isActive: boolean;
  media?: {
    id: string;
    url: string;
    filename: string;
    type: string;
  };
}

const ProjectDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeGalleryTab, setActiveGalleryTab] = useState('dis-mekan');
  const [activeChildTab, setActiveChildTab] = useState('dis-mekan-fotograflari');

  useEffect(() => {
    if (slug) {
      fetchProjectData();
      fetchGalleries();
    }
  }, [slug]);

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects?slug=${slug}&limit=1`);
      if (!response.ok) throw new Error('Proje bulunamadı');
      const data = await response.json();
      if (data.projects && data.projects.length > 0) {
        setProject(data.projects[0]);
      } else {
        throw new Error('Proje bulunamadı');
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const fetchGalleries = async () => {
    try {
      // Mock gallery data for now - replace with actual API call
      setGalleries([
        { id: 1, title: 'Genel Görünüm', order: 1, isActive: true },
        { id: 2, title: 'Bina Cepheleri', order: 2, isActive: true },
        { id: 3, title: 'Bahçe Alanları', order: 3, isActive: true },
        { id: 4, title: 'Otopark', order: 4, isActive: true },
      ]);
    } catch (error) {
      console.error('Error fetching galleries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChildGalleryContent = () => {
    switch (activeChildTab) {
      case 'dis-mekan-fotograflari':
        return [
          { title: 'Genel Görünüm' },
          { title: 'Bina Cepheleri' },
          { title: 'Bahçe Alanları' },
          { title: 'Otopark' },
        ];
      case 'detay-fotograflari':
        return [
          { title: 'Giriş' },
          { title: 'Asansör' },
          { title: 'Koridor' },
          { title: 'Balkon' },
          { title: 'Merdiven' },
          { title: 'Kapı' },
        ];
      case 'mimari-detaylar':
        return [
          { title: 'Çatı Detayı' },
          { title: 'Pencere Detayı' },
          { title: 'Kapı Detayı' },
          { title: 'Balkon Detayı' },
        ];
      case 'cevre-duzenlemesi':
        return [
          { title: 'Bahçe Düzenlemesi' },
          { title: 'Yürüyüş Yolları' },
          { title: 'Oyun Alanları' },
          { title: 'Dinlenme Alanları' },
        ];
      case 'ic-mekan-fotograflari':
        return [
          { title: 'Salon' },
          { title: 'Yatak Odası' },
          { title: 'Mutfak' },
          { title: 'Banyo' },
        ];
      case 'mobilya-detaylari':
        return [
          { title: 'Dolap' },
          { title: 'Masa' },
          { title: 'Koltuk' },
          { title: 'Yatak' },
          { title: 'TV Ünitesi' },
          { title: 'Kitaplık' },
        ];
      case 'elektrik-tesisati':
        return [
          { title: 'Elektrik Panosu' },
          { title: 'Prize Detayı' },
          { title: 'Anahtar Detayı' },
          { title: 'LED Aydınlatma' },
        ];
      case 'su-tesisati':
        return [
          { title: 'Su Sayacı' },
          { title: 'Musluk Detayı' },
          { title: 'Duş Detayı' },
          { title: 'Klozet Detayı' },
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Proje yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Proje Bulunamadı</h1>
          <p className="text-gray-600 mb-6">{error || 'Aradığınız proje bulunamadı.'}</p>
          <Button onClick={() => navigate('/projeler')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Projeler Sayfasına Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner Section */}
      <div className="relative h-80 bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden">
        {/* Background Image */}
        {project?.bannerUrl && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${project.bannerUrl})` }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        )}
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anasayfa
              </Button>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              {project.title}
            </h1>
            <p className="text-xl opacity-90 mb-6">
              {project.summary || 'Modern Yaşamın Yeni Adresi'}
            </p>
            {project.status && (
              <div className="flex justify-center">
                <Badge variant="secondary" className="px-4 py-2">
                  {project.status === 'ONGOING' ? 'İnşaat Devam Ediyor' : 'Tamamlandı'}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Statistics Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="text-center flex-1 min-w-[150px]">
              <div className="text-sm text-gray-600 mb-1">Projenin Yeri</div>
              <div className="font-bold text-blue-600">
                {project.province && project.district 
                  ? `${project.province} / ${project.district}`
                  : project.locationName || 'Konum belirtilmemiş'
                }
              </div>
            </div>
            <div className="text-center flex-1 min-w-[150px]">
              <div className="text-sm text-gray-600 mb-1">Proje Tipi</div>
              <div className="font-bold text-blue-600">
                {project.tags?.length ? project.tags[0].tag.name : 'Konut'}
              </div>
            </div>
            <div className="text-center flex-1 min-w-[150px]">
              <div className="text-sm text-gray-600 mb-1">Konut Sayısı</div>
              <div className="font-bold text-blue-600">
                {project.blokDaireSayisi || 'Belirtilmemiş'}
              </div>
            </div>
            <div className="text-center flex-1 min-w-[150px]">
              <div className="text-sm text-gray-600 mb-1">Ticari Ünite</div>
              <div className="font-bold text-blue-600">
                {project.yil || 'Belirtilmemiş'}
              </div>
            </div>
            <div className="text-center flex-1 min-w-[150px]">
              <div className="text-sm text-gray-600 mb-1">Toplam Bölüm</div>
              <div className="font-bold text-blue-600">
                {project.viewCount?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Project Description */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Proje Açıklaması</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div 
                    className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ 
                      __html: project.content.replace(/\n/g, '<br>') 
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Certificate Button */}
            <Card className="bg-blue-50 border-l-4 border-blue-400">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold"
                    onClick={() => {
                      // Certificate website redirect
                      window.open('https://example.com/certificate', '_blank');
                    }}
                  >
                    🏆 Gayrimenkul Sertifikası Web Sitesi için tıklayınız
                  </Button>
                  <div className="flex items-center gap-2 text-blue-800 font-semibold">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                      S
                    </div>
                    GAYRİMENKUL SERTİFİKASI
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Project Main Image */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Proje Ana Resmi</CardTitle>
              </CardHeader>
              <CardContent>
                {project?.media ? (
                  <div className="relative">
                    <img
                      src={project.media.url.startsWith('http') ? project.media.url : `${API_BASE_URL}${project.media.url}`}
                      alt={project.media.filename || project.title}
                      className="w-full h-64 object-cover rounded-lg shadow-lg"
                    />
                    <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                      {project.media.filename}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>Proje ana resmi bulunamadı</p>
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-3 italic text-center">
                  Proje ana görseli
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Photo Gallery Section */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8">Fotoğraflar</h2>
          
          {/* Gallery Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <Button 
              variant={activeGalleryTab === 'dis-mekan' ? 'default' : 'outline'}
              className="px-8 py-3 text-lg"
              onClick={() => {
                setActiveGalleryTab('dis-mekan');
                setActiveChildTab('dis-mekan-fotograflari');
              }}
            >
              Dış Mekan
            </Button>
            <Button 
              variant={activeGalleryTab === 'ic-mekan' ? 'default' : 'outline'}
              className="px-8 py-3 text-lg"
              onClick={() => {
                setActiveGalleryTab('ic-mekan');
                setActiveChildTab('ic-mekan-fotograflari');
              }}
            >
              İç Mekan
            </Button>
          </div>
          
          {/* Gallery Content */}
          <div className="bg-white rounded-lg p-6">
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                {activeGalleryTab === 'dis-mekan' ? '🏢' : '🏠'}
              </div>
              <h3 className="text-xl font-bold text-blue-600">
                {activeGalleryTab === 'dis-mekan' ? 'Dış Mekan Fotoğrafları' : 'İç Mekan Fotoğrafları'}
              </h3>
            </div>
            
            {/* Child Gallery Tabs */}
            <div className="flex gap-2 mb-6 pl-8 border-l-2 border-gray-200 flex-wrap">
              {activeGalleryTab === 'dis-mekan' ? (
                <>
                  <Button 
                    variant={activeChildTab === 'dis-mekan-fotograflari' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveChildTab('dis-mekan-fotograflari')}
                  >
                    Dış Mekan Fotoğrafları
                  </Button>
                  <Button 
                    variant={activeChildTab === 'detay-fotograflari' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveChildTab('detay-fotograflari')}
                  >
                    Detay Fotoğrafları
                  </Button>
                  <Button 
                    variant={activeChildTab === 'mimari-detaylar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveChildTab('mimari-detaylar')}
                  >
                    Mimari Detaylar
                  </Button>
                  <Button 
                    variant={activeChildTab === 'cevre-duzenlemesi' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveChildTab('cevre-duzenlemesi')}
                  >
                    Çevre Düzenlemesi
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant={activeChildTab === 'ic-mekan-fotograflari' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveChildTab('ic-mekan-fotograflari')}
                  >
                    İç Mekan Fotoğrafları
                  </Button>
                  <Button 
                    variant={activeChildTab === 'mobilya-detaylari' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveChildTab('mobilya-detaylari')}
                  >
                    Mobilya Detayları
                  </Button>
                  <Button 
                    variant={activeChildTab === 'elektrik-tesisati' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveChildTab('elektrik-tesisati')}
                  >
                    Elektrik Tesisatı
                  </Button>
                  <Button 
                    variant={activeChildTab === 'su-tesisati' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveChildTab('su-tesisati')}
                  >
                    Su Tesisatı
                  </Button>
                </>
              )}
            </div>
            
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pl-8">
              {getChildGalleryContent().map((item, index) => (
                <div 
                  key={index}
                  className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => {
                    // Open gallery in lightbox
                    console.log('Gallery clicked:', item.title);
                  }}
                >
                  <span className="text-gray-500 text-sm text-center">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button variant="outline" size="sm">
                ← Önceki
              </Button>
              <span className="text-sm text-gray-600">1 / 4</span>
              <Button variant="outline" size="sm">
                Sonraki →
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-100 py-4">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-600">
            🎯 <strong>Proje Detay Sayfası</strong> • Son güncelleme: {new Date().toLocaleDateString('tr-TR')} 
            • Toplam {project?.viewCount || 0} görüntüleme
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;