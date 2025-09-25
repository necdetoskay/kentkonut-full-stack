import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { API_BASE_URL } from '../config/environment';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
  parentId?: number | null;
  projectId: number;
  media?: {
    id: string;
    url: string;
    filename: string;
    type: string;
  };
  children?: GalleryItem[];
  _count?: {
    children: number;
    media: number;
  };
}

const ProjectDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeGalleryTab, setActiveGalleryTab] = useState('');
  const [activeChildTab, setActiveChildTab] = useState('');

  useEffect(() => {
    if (slug) {
      fetchProjectData();
    }
  }, [slug]);

  // Fetch galleries after project data is loaded
  useEffect(() => {
    if (project?.id) {
      fetchGalleries();
    }
  }, [project?.id]);

  // Set initial active tabs when galleries are loaded
  useEffect(() => {
    if (Array.isArray(galleries) && galleries.length > 0 && !activeGalleryTab) {
      const firstGallery = galleries[0];
      setActiveGalleryTab(firstGallery.id.toString());
      
      if (firstGallery.children && firstGallery.children.length > 0) {
        setActiveChildTab(firstGallery.children[0].id.toString());
      }
    }
  }, [galleries, activeGalleryTab]);

  const fetchProjectData = async () => {
    try {
      setError(null); // Clear any previous errors
      const response = await fetch(`${API_BASE_URL}/api/projects?slug=${slug}&limit=1`);
      if (!response.ok) throw new Error('Proje bulunamadı');
      const data = await response.json();
      if (data.projects && data.projects.length > 0) {
        console.log("🔍 [FRONTEND] Project data:", data.projects[0]);
        console.log("🔍 [FRONTEND] Project bannerUrl:", data.projects[0].bannerUrl);
        setProject(data.projects[0]);
      } else {
        throw new Error('Proje bulunamadı');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleries = async () => {
    try {
      // Get project ID from the project data
      if (!project?.id) {
        console.log("No project ID available for fetching galleries");
        return;
      }

      console.log("🔍 [FRONTEND] Fetching galleries for project ID:", project.id);
      const response = await fetch(`${API_BASE_URL}/api/projects/${project.id}/galleries/all`);
      
      if (!response.ok) {
        throw new Error('Galeriler yüklenirken hata oluştu');
      }
      
      const data = await response.json();
      console.log("🔍 [FRONTEND] Gallery data received:", data);
      console.log("🔍 [FRONTEND] data.data type:", typeof data.data);
      console.log("🔍 [FRONTEND] data.data:", data.data);
      
      if (data.success && data.data) {
        // Check if data.data is an array or has a galleries property
        if (Array.isArray(data.data)) {
          setGalleries(data.data);
        } else if (data.data.galleries && Array.isArray(data.data.galleries)) {
          setGalleries(data.data.galleries);
        } else {
          console.warn("Gallery data is not in expected format:", data.data);
          setGalleries([]);
        }
      } else {
        console.warn("No gallery data received");
        setGalleries([]);
      }
    } catch (error) {
      console.error('Error fetching galleries:', error);
      // Fallback to empty array instead of mock data
      setGalleries([]);
    }
  };

  const getChildGalleryContent = () => {
    // Ensure galleries is an array
    if (!Array.isArray(galleries)) {
      return [];
    }

    // Get the current active gallery based on activeGalleryTab (now using ID)
    const currentGallery = galleries.find(gallery => gallery.id.toString() === activeGalleryTab);

    if (!currentGallery || !currentGallery.children) {
      return [];
    }

    // Return the children of the current gallery
    return currentGallery.children.map(child => ({
      title: child.title,
      id: child.id,
      media: child.media,
      _count: child._count
    }));
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
      {/* Hero Banner Section - Half Screen Height */}
      <div className="relative h-[50vh] text-white overflow-hidden">
        {/* Background Image - Always show bannerUrl or fallback */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: project?.bannerUrl 
              ? `url(${project.bannerUrl.startsWith('http') ? project.bannerUrl : `${API_BASE_URL}${project.bannerUrl}`})` 
              : 'linear-gradient(to right, #2563eb, #7c3aed)'
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        {/* Navbar Overlay */}
        <Navbar />
        
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-4 left-4 bg-black/70 text-white p-2 rounded text-xs z-20">
            Banner URL: {project?.bannerUrl ? 
              (project.bannerUrl.startsWith('http') ? project.bannerUrl : `${API_BASE_URL}${project.bannerUrl}`) 
              : 'YOK'}
          </div>
        )}
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 pt-24">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold mb-6 text-white drop-shadow-2xl">
              {project.title}
            </h1>
            {project.status && (
              <div className="flex justify-center">
                <Badge variant="secondary" className="px-6 py-3 text-lg">
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
            {Array.isArray(galleries) && galleries.map((gallery) => (
              <Button 
                key={gallery.id}
                variant={activeGalleryTab === gallery.id.toString() ? 'default' : 'outline'}
                className="px-8 py-3 text-lg"
                onClick={() => {
                  setActiveGalleryTab(gallery.id.toString());
                  // Set first child as active if available
                  if (gallery.children && gallery.children.length > 0) {
                    setActiveChildTab(gallery.children[0].id.toString());
                  }
                }}
              >
                {gallery.title}
              </Button>
            ))}
          </div>
          
          {/* Gallery Content */}
          <div className="bg-white rounded-lg p-6">
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                📷
              </div>
              <h3 className="text-xl font-bold text-blue-600">
                {Array.isArray(galleries) ? galleries.find(g => g.id.toString() === activeGalleryTab)?.title || 'Galeri' : 'Galeri'}
              </h3>
            </div>
            
            {/* Child Gallery Tabs */}
            <div className="flex gap-2 mb-6 pl-8 border-l-2 border-gray-200 flex-wrap">
              {getChildGalleryContent().map((child) => (
                <Button 
                  key={child.id}
                  variant={activeChildTab === child.id.toString() ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveChildTab(child.id.toString())}
                >
                  {child.title}
                </Button>
              ))}
            </div>
            
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pl-8">
              {getChildGalleryContent().map((item) => (
                <div 
                  key={item.id}
                  className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => {
                    // Open gallery in lightbox
                    console.log('Gallery clicked:', item.title);
                  }}
                >
                  <div className="text-center">
                    <span className="text-gray-500 text-sm">
                      {item.title}
                    </span>
                    {item._count && (
                      <div className="text-xs text-gray-400 mt-1">
                        {item._count.media} fotoğraf
                      </div>
                    )}
                  </div>
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
      <Footer />
    </div>
  );
};

export default ProjectDetailPage;
