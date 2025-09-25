"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingLink } from "@/components/ui/loading-link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  MessageCircle,
  Download,
  BarChart3,
  Activity,
  Share2,
  Copy,
  Image as ImageIcon,
  ExternalLink,
  MapPin,
  Calendar,
  User,
  Clock
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ProjectStatus, PROJECT_STATUS_LABELS } from "@/types";
import { ProjectsAPI, handleApiError } from "@/utils/projectsApi";
import { GlobalMediaFile } from "@/components/media/GlobalMediaSelector";

interface ProjectData {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  status: ProjectStatus;
  published: boolean;
  publishedAt?: string;
  readingTime: number;
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
  media?: GlobalMediaFile;
  author: {
    id: string;
    name: string;
    email: string;
  };
  tags: Array<{
    tag: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  comments: Array<{
    id: number;
    content: string;
    approved: boolean;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  projectGalleries?: Array<{
    id: number;
    title: string;
    description?: string;
    order: number;
    isActive: boolean;
    media?: GlobalMediaFile;
  }>;
}

interface ProjectStats {
  totalViews: number;
  totalComments: number;
  totalGalleryItems: number;
  totalDownloads: number;
  recentActivities: Array<{
    type: string;
    description: string;
    timestamp: string;
    user_name: string;
  }>;
  seoMetrics: {
    readingTime: number;
    avgEngagementTime: number;
    bounceRate: number;
    shares: number;
  };
}

export default function ProjectDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [galleryCount, setGalleryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
      fetchProjectStats();
      fetchGalleryCount();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const response = await ProjectsAPI.getById(projectId);
      setProject(response);
    } catch (error) {
      const { message } = handleApiError(error);
      console.error("Error fetching project:", error);
      toast.error(`Proje yüklenirken hata oluştu: ${message}`);
      router.push("/dashboard/projects");
    }
  };

  const fetchProjectStats = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/stats`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching project stats:', error);
    }
  };

  const fetchGalleryCount = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/galleries/all`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGalleryCount(data.data.allGalleries?.length || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching gallery count:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const variant = status === ProjectStatus.COMPLETED ? "default" : "secondary";
    return (
      <Badge variant={variant}>
        {PROJECT_STATUS_LABELS[status]}
      </Badge>
    );
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Az önce';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    return `${Math.floor(diffInSeconds / 86400)} gün önce`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment': return '💬';
      case 'gallery': return '📷';
      case 'view': return '👁️';
      case 'edit': return '✏️';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Dashboard yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Proje Bulunamadı</h1>
          <p className="text-gray-600 mb-6">Aradığınız proje bulunamadı veya erişim yetkiniz yok.</p>
          <Button onClick={() => router.push('/dashboard/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Projeler Sayfasına Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* DASHBOARD HEADER - Bu kısım eski sayfadan farklı */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/dashboard/projects')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Projeler
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">📊 {project.title} Dashboard</h1>
                {getStatusBadge(project.status)}
              </div>
              <p className="text-blue-100 text-lg">
                Proje performans ve istatistik merkezi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LoadingLink href={`/dashboard/projects/${project.id}/edit`}>
              <Button variant="secondary">
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
            </LoadingLink>
          </div>
        </div>
      </div>

      {/* STATISTICS CARDS - Ana dashboard özelliği */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-600">Toplam Görüntüleme</p>
                <p className="text-3xl font-bold text-gray-900">
                  {project?.viewCount?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Toplam görüntüleme</p>
              </div>
              <Eye className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-green-600">Yorumlar</p>
                <p className="text-3xl font-bold text-gray-900">
                  {project?.comments?.length || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {project?.comments?.filter(c => c.approved).length || 0} onaylı
                </p>
              </div>
              <MessageCircle className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-600">Galeri Öğeleri</p>
                <p className="text-3xl font-bold text-gray-900">
                  {galleryCount}
                </p>
                <p className="text-xs text-gray-500 mt-1">Toplam galeri</p>
              </div>
              <ImageIcon className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-red-600">İndirmeler</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalDownloads || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Bu ay</p>
              </div>
              <Download className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PROJECT MAIN IMAGE AND CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Image Card */}
        {project?.media && (
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="h-6 w-6 text-blue-600" />
                📸 Proje Ana Resmi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative">
                <img
                  src={project.media.url}
                  alt={project.media.filename || project.title}
                  className="w-full h-64 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                  {project.media.filename}
                </div>
              </div>
              {project.media.description && (
                <p className="text-sm text-gray-600 mt-3 italic">
                  "{project.media.description}"
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Location Map Card */}
        {(project?.latitude && project?.longitude) && (
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-6 w-6 text-green-600" />
                🗺️ Proje Konumu
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Live Map Embed */}
                <div className="h-48 rounded-lg overflow-hidden border-2 border-gray-200 shadow-lg">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${project.longitude - 0.001},${project.latitude - 0.001},${project.longitude + 0.001},${project.latitude + 0.001}&layer=mapnik&marker=${project.latitude},${project.longitude}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${project.title} - Konum Haritası`}
                  />
                </div>
                
                {/* Map Info */}
                <div className="text-center text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  🗺️ Canlı harita görünümü • Koordinatlar: {project.latitude}, {project.longitude}
                </div>
                
                {/* Location Details */}
                <div className="space-y-2 text-sm">
                  {project.locationName && (
                    <p><span className="font-medium">📍 Konum:</span> {project.locationName}</p>
                  )}
                  {project.province && (
                    <p><span className="font-medium">🏛️ İl:</span> {project.province}</p>
                  )}
                  {project.district && (
                    <p><span className="font-medium">🏘️ İlçe:</span> {project.district}</p>
                  )}
                  {project.address && (
                    <p><span className="font-medium">🏠 Adres:</span> {project.address}</p>
                  )}
                </div>
                
                {/* Map Links */}
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const mapUrl = `https://www.google.com/maps?q=${project.latitude},${project.longitude}`;
                      window.open(mapUrl, '_blank');
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Google Maps
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const mapUrl = `https://www.openstreetmap.org/?mlat=${project.latitude}&mlon=${project.longitude}&zoom=18`;
                      window.open(mapUrl, '_blank');
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    OpenStreetMap
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* PROJECT CONTENT CARD */}
      {project?.content && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg">
              📝 Proje İçeriği
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none">
              <div 
                className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: project.content.replace(/\n/g, '<br>') 
                }}
              />
            </div>
            {project.summary && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <h4 className="font-semibold text-blue-800 mb-2">📋 Özet</h4>
                <p className="text-blue-700 text-sm">{project.summary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* PROJECT DETAILS CARD */}
      <Card>
        <CardHeader className="bg-blue-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-lg">
            📋 Proje Detayları
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700">📝 Temel Bilgiler</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Başlık:</span> {project?.title}</p>
                <p><span className="font-medium">Durum:</span> {getStatusBadge(project?.status || ProjectStatus.ONGOING)}</p>
                <p><span className="font-medium">Yayın Durumu:</span> 
                  <Badge variant={project?.published ? "default" : "secondary"} className="ml-2">
                    {project?.published ? "Yayında" : "Taslak"}
                  </Badge>
                </p>
                <p><span className="font-medium">Okuma Süresi:</span> {project?.readingTime || 0} dakika</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700">👤 Yazar Bilgileri</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Yazar:</span> {project?.author?.name}</p>
                <p><span className="font-medium">Email:</span> {project?.author?.email}</p>
                <p><span className="font-medium">Oluşturulma:</span> {project?.createdAt ? new Date(project.createdAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}</p>
                <p><span className="font-medium">Son Güncelleme:</span> {project?.updatedAt ? new Date(project.updatedAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700">🏷️ Etiketler</h4>
              <div className="flex flex-wrap gap-1">
                {project?.tags?.length ? (
                  project.tags.map((tagRelation, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tagRelation.tag.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Etiket yok</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MAIN DASHBOARD CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <Card className="lg:col-span-2">
          <CardHeader className="bg-gray-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              📈 Performans Grafiği (Son 30 Gün)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 rounded-lg flex items-center justify-center">
              <div className="text-center text-blue-600">
                <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">📊 Dashboard Grafiği</h3>
                <p className="text-sm">Günlük görüntüleme, yorum ve etkileşim istatistikleri</p>
                <p className="text-xs mt-2 text-gray-500">Grafik kütüphanesi entegre edilecek</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader className="bg-green-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-6 w-6 text-green-600" />
              🔔 Son Aktiviteler
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {stats?.recentActivities?.length ? (
              stats.recentActivities.slice(0, 8).map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(activity.timestamp)} • {activity.user_name}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Henüz aktivite yok</p>
                <p className="text-sm">Proje etkileşimleri burada görünecek</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* QUICK ACTIONS - Dashboard özelliği */}
      <Card>
        <CardHeader className="bg-purple-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-lg">
            ⚡ Hızlı İşlemler Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <LoadingLink href={`/dashboard/projects/${project.id}/edit`}>
              <Button variant="outline" className="w-full flex flex-col h-24 gap-2 hover:bg-blue-50 border-blue-200">
                <Edit className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium">İçerik Düzenle</span>
              </Button>
            </LoadingLink>
            
            <LoadingLink href={`/dashboard/projects/${project.id}/gallery`}>
              <Button variant="outline" className="w-full flex flex-col h-24 gap-2 hover:bg-green-50 border-green-200">
                <ImageIcon className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium">Galeri Yönet</span>
              </Button>
            </LoadingLink>
            
            <Button variant="outline" className="w-full flex flex-col h-24 gap-2 hover:bg-yellow-50 border-yellow-200">
              <MessageCircle className="h-6 w-6 text-yellow-600" />
              <span className="text-sm font-medium">Yorumlar</span>
            </Button>
            
            <Button variant="outline" className="w-full flex flex-col h-24 gap-2 hover:bg-purple-50 border-purple-200">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">Detaylı Rapor</span>
            </Button>
            
            <Button variant="outline" className="w-full flex flex-col h-24 gap-2 hover:bg-indigo-50 border-indigo-200">
              <ExternalLink className="h-6 w-6 text-indigo-600" />
              <span className="text-sm font-medium">Hızlı Erişim</span>
            </Button>
            
            <Button variant="outline" className="w-full flex flex-col h-24 gap-2 hover:bg-pink-50 border-pink-200">
              <Share2 className="h-6 w-6 text-pink-600" />
              <span className="text-sm font-medium">Paylaş</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DASHBOARD FOOTER */}
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-sm text-gray-600">
          🎯 <strong>Proje Dashboard</strong> • Son güncelleme: {new Date().toLocaleDateString('tr-TR')} 
          • Toplam {project?.viewCount || 0} görüntüleme • {galleryCount} galeri • {project?.comments?.length || 0} yorum
        </p>
      </div>
    </div>
  );
}