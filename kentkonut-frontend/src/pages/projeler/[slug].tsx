import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import React, { Suspense, lazy } from 'react';
import DOMPurify from 'dompurify';
import { MapPin, Calendar, Users, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  alt?: string;
  type: 'IMAGE' | 'VIDEO' | 'PDF' | 'WORD' | 'EMBED';
  embedUrl?: string;
  mimeType?: string;
}

interface ProjectDetail {
  id: number;
  title: string;
  content: string;
  summary?: string;
  publishedAt?: string;
  media?: { url: string };
  galleryItems?: { media: MediaItem }[];
  slug: string;
  status: string;
  province?: string;
  district?: string;
  area?: string;
  priceRange?: string;
  features?: string[];
  category?: string;
  startDate?: string;
  endDate?: string;
  client?: string;
}

import { getApiBaseUrl } from '@/config/ports';

const backendBase = getApiBaseUrl();

// URL oluşturma yardımcı fonksiyonu
const getMediaUrl = (url?: string) => {
  if (!url) return null;
  let normalizedUrl = url;
  // http ile başlıyorsa dokunma
  if (normalizedUrl.startsWith('http')) return normalizedUrl;
  // public ile başlıyorsa temizle
  normalizedUrl = normalizedUrl.replace(/^\/public\//, '/');
  // uploads ile başlıyorsa temizle
  normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/');
  // Başında / yoksa ekle
  if (!normalizedUrl.startsWith('/')) {
    normalizedUrl = '/' + normalizedUrl;
  }
  return backendBase + normalizedUrl;
};

const Navbar = lazy(() => import('@/components/Navbar'));

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<any[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!slug) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const API_BASE_URL = getApiBaseUrl();
        const response = await fetch(`${API_BASE_URL}/api/projects/slug/${slug}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // API response formatını kontrol et
        const projectData = data.data || data;
        setProject(projectData);
        
        // İlgili projeleri getir
        const relatedResponse = await fetch(`${API_BASE_URL}/api/projects?limit=3&exclude=${projectData.id}`);
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          setRelatedProjects(relatedData.projects || relatedData.data || []);
        }
        
      } catch (err) {
        console.error('Proje detayı yüklenirken hata:', err);
        setError('Proje detayı yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  // Lightbox navigation functions
  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    if (project?.galleryItems) {
      setCurrentImageIndex((prev) => 
        prev === project.galleryItems!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (project?.galleryItems) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? project.galleryItems!.length - 1 : prev - 1
      );
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, project?.galleryItems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Suspense fallback={<div>Navbar yükleniyor...</div>}>
          <Navbar backgroundImage="/images/antet_projeler.jpg" />
        </Suspense>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kentblue mx-auto mb-4"></div>
            <p className="text-gray-600">Proje detayı yükleniyor...</p>
          </div>
        </div>
        
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white">
        <Suspense fallback={<div>Navbar yükleniyor...</div>}>
          <Navbar backgroundImage="/images/antet_projeler.jpg" />
        </Suspense>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Proje Bulunamadı</h1>
            <p className="text-gray-600 mb-6">{error || 'Aradığınız proje bulunamadı.'}</p>
            <Link to="/projeler">
              <Button className="bg-kentblue hover:bg-kentblue/90">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Projeler Sayfasına Dön
              </Button>
            </Link>
          </div>
        </div>
        
      </div>
    );
  }

  const statusMap: Record<string, string> = {
    'ONGOING': 'Devam Ediyor',
    'COMPLETED': 'Tamamlandı',
    'PLANNED': 'Planlanıyor'
  };

  const projectImage = getMediaUrl(project.media?.url) || '/images/projelerimiz.png';
  const location = [project.province, project.district].filter(Boolean).join(', ') || 'Belirtilmemiş';
  const status = statusMap[project.status] || project.status;

  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div>Navbar yükleniyor...</div>}>
        <Navbar backgroundImage="/images/antet_projeler.jpg" />
      </Suspense>
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="kent-container">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-kentblue">Ana Sayfa</Link>
            <span>/</span>
            <Link to="/projeler" className="hover:text-kentblue">Projeler</Link>
            <span>/</span>
            <span className="text-kentblue font-medium">{project.title}</span>
          </nav>
        </div>
      </div>

      {/* Project Title */}
      <div className="pt-20 pb-12 bg-white">
        <div className="kent-container text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">{project.title}</h1>
          {project.summary && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">{project.summary}</p>
          )}
        </div>
      </div>

      {/* Main Project Image */}
      <div className="kent-container mb-12">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-lg shadow-lg">
            <img 
              src={projectImage}
              alt={project.title}
              className="w-full h-96 md:h-[500px] object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/projelerimiz.png';
              }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-16">
        <div className="kent-container max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(project.content || '') 
              }}
            />
          </div>
        </div>

        {/* Gallery Section */}
        {project.galleryItems && project.galleryItems.length > 0 && (
          <div className="kent-container max-w-4xl mx-auto mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Proje Galerisi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.galleryItems.map((item, index) => (
                <div 
                  key={item.media.id} 
                  className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={getMediaUrl(item.media.url)}
                    alt={item.media.alt || `Galeri resmi ${index + 1}`}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/projelerimiz.png';
                    }}
                  />

                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lightbox Modal */}
        {lightboxOpen && project?.galleryItems && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl" style={{maxWidth: '90vw', maxHeight: '90vh'}}>
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 z-10 bg-white rounded-full p-1 shadow-md"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Previous Button */}
              {project.galleryItems.length > 1 && (
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 z-10 bg-white rounded-full p-2 shadow-md"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Next Button */}
              {project.galleryItems.length > 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 z-10 bg-white rounded-full p-2 shadow-md"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Main Image */}
              <div className="relative">
                <img
                  src={getMediaUrl(project.galleryItems[currentImageIndex].media.url)}
                  alt={project.galleryItems[currentImageIndex].media.alt || `Galeri resmi ${currentImageIndex + 1}`}
                  className="block max-w-full max-h-[80vh] object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/projelerimiz.png';
                  }}
                />
              </div>

              {/* Image Info */}
              <div className="bg-gray-50 p-4 border-t">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {currentImageIndex + 1} / {project.galleryItems.length}
                  </div>
                  {project.galleryItems[currentImageIndex].media.alt && (
                    <div className="text-sm text-gray-800 font-medium max-w-md text-right">
                      {project.galleryItems[currentImageIndex].media.alt}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      
    </div>
  );
};

export default ProjectDetail;