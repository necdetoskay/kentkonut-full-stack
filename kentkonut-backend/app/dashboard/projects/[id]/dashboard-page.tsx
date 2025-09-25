"use client";

import { useState, useEffect } from "react";
import Link from "next/link"
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingLink } from "@/components/ui/loading-link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  User,
  Eye,
  Clock,
  Tag,
  Image as ImageIcon,
  ExternalLink,
  Building2,
  MessageCircle,
  Download,
  BarChart3,
  Activity,
  Share2,
  Copy,
  Settings
} from "lucide-react";
import { EnhancedHtmlRenderer } from "@/components/content/SafeHtmlRenderer";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
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
  latitude?: number;
  longitude?: number;
  locationName?: string;
  province?: string;
  district?: string;
  address?: string;
  published: boolean;
  publishedAt?: string;
  readingTime: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  yil?: string;
  blokDaireSayisi?: string;
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
  relatedProjects?: Array<{
    relatedProject: {
      id: number;
      title: string;
      slug: string;
      summary?: string;
      status: ProjectStatus;
      media?: GlobalMediaFile;
      author: {
        id: string;
        name: string;
        email: string;
      };
    };
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
  viewStats: Array<{
    date: string;
    views: number;
  }>;
  seoMetrics: {
    readingTime: number;
    avgEngagementTime: number;
    bounceRate: number;
    shares: number;
  };
  projectDetails: {
    title: string;
    status: ProjectStatus;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    locationName?: string;
    province?: string;
    district?: string;
    yil?: string;
    blokDaireSayisi?: string;
    tags: Array<{
      tag: {
        name: string;
        slug: string;
      };
    }>;
  };
  galleryPreview: Array<{
    id: number;
    media: {
      id: string;
      url: string;
      filename: string;
      type: string;
    };
  }>;
}

const getMediaUrl = (url?: string) => {
  if (!url) return '';
  let normalizedUrl = url;
  if (normalizedUrl.startsWith('http')) return normalizedUrl;

  // Remove common prefixes
  normalizedUrl = normalizedUrl.replace(/^\/public\//, '/');
  normalizedUrl = normalizedUrl.replace(/^\/uploads\//, '/');

  // Ensure it starts with /
  if (!normalizedUrl.startsWith('/')) {
    normalizedUrl = '/' + normalizedUrl;
  }

  return normalizedUrl;
};

export default function ProjectDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
      fetchProjectStats();
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
      } else {
        console.error('Failed to fetch project stats:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching project stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;

    try {
      await ProjectsAPI.delete(project.id);
      toast.success('Proje başarıyla silindi');
      router.push('/dashboard/projects');
    } catch (error) {
      handleApiError(error, 'Proje silinirken hata oluştu');
    } finally {
      setDeleteDialogOpen(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (project: ProjectData) => {
    const parts = [];
    if (project.province && project.district) {
      parts.push(`${project.district}, ${project.province}`);
    }
    if (project.address) {
      parts.push(project.address);
    }
    if (parts.length === 0 && project.locationName) {
      parts.push(project.locationName);
    }
    return parts.join(' - ');
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
            <p className="text-gray-600">Proje yükleniyor...</p>
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
    <div className="space-y-6">
      <Breadcrumb
        className="mb-2"
        homeHref="/dashboard"
        segments={[
          { name: "Projeler", href: "/dashboard/projects" },
          { name: project.title, href: `/dashboard/projects/${project.id}` },
        ]}
      />
      
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/projects')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Projeler
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
                {getStatusBadge(project.status)}
                {!project.published && (
                  <Badge variant="outline">Taslak</Badge>
                )}
              </div>
              {project.summary && (
                <p className="text-muted-foreground text-lg">{project.summary}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LoadingLink href={`/dashboard/projects/${project.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </Button>
            </LoadingLink>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sil
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Toplam Görüntüleme</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Yorumlar</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalComments}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Galeri Öğeleri</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalGalleryItems}</p>
                </div>
                <ImageIcon className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">İndirmeler</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalDownloads}</p>
                </div>
                <Download className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Görüntüleme İstatistikleri (Son 30 Gün)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Grafik Alanı</p>
                <p className="text-sm">Zaman serisi grafiği - günlük görüntüleme sayıları</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Son Aktiviteler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats?.recentActivities.length ? (
              stats.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Henüz aktivite yok</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Proje Detayları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Durum:</span>
              <span className="font-medium">{getStatusBadge(project.status)}</span>
            </div>
            {project.publishedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Yayın Tarihi:</span>
                <span className="font-medium">{formatDate(project.publishedAt)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Oluşturulma:</span>
              <span className="font-medium">{formatDate(project.createdAt)}</span>
            </div>
            {(project.province || project.district) && (
              <div className="flex justify-between">
                <span className="text-gray-600">Konum:</span>
                <span className="font-medium">{formatAddress(project)}</span>
              </div>
            )}
            {project.yil && (
              <div className="flex justify-between">
                <span className="text-gray-600">Yıl:</span>
                <span className="font-medium">{project.yil}</span>
              </div>
            )}
            {project.blokDaireSayisi && (
              <div className="flex justify-between">
                <span className="text-gray-600">Blok/Daire:</span>
                <span className="font-medium">{project.blokDaireSayisi}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags and Gallery Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Etiketler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tagRelation, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tagRelation.tag.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Henüz etiket eklenmemiş</p>
            )}
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Galeri Önizleme</h4>
              {stats?.galleryPreview.length ? (
                <div className="grid grid-cols-3 gap-2">
                  {stats.galleryPreview.slice(0, 9).map((item, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded border flex items-center justify-center">
                      {item.media.type.startsWith('image/') ? (
                        <img 
                          src={getMediaUrl(item.media.url)} 
                          alt={item.media.filename}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Henüz galeri öğesi yok</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SEO & Performance */}
        <Card>
          <CardHeader>
            <CardTitle>SEO & Performans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Okuma Süresi:</span>
                  <span className="font-medium">{stats.seoMetrics.readingTime} dakika</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ortalama Süre:</span>
                  <span className="font-medium">{Math.floor(stats.seoMetrics.avgEngagementTime / 60)}m {stats.seoMetrics.avgEngagementTime % 60}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Geri Dönüş:</span>
                  <span className="font-medium">%{stats.seoMetrics.bounceRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paylaşım:</span>
                  <span className="font-medium">{stats.seoMetrics.shares}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Görüntüleme:</span>
              <span className="font-medium">{project.viewCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Yorum:</span>
              <span className="font-medium">{project.comments.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <LoadingLink href={`/dashboard/projects/${project.id}/edit`}>
              <Button variant="outline" className="w-full flex flex-col h-20 gap-2">
                <Edit className="h-5 w-5" />
                <span className="text-xs">İçerik Düzenle</span>
              </Button>
            </LoadingLink>
            
            <LoadingLink href={`/dashboard/projects/${project.id}/gallery`}>
              <Button variant="outline" className="w-full flex flex-col h-20 gap-2">
                <ImageIcon className="h-5 w-5" />
                <span className="text-xs">Galeri Yönet</span>
              </Button>
            </LoadingLink>
            
            <Button variant="outline" className="w-full flex flex-col h-20 gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="text-xs">Yorumları Gör</span>
            </Button>
            
            <Button variant="outline" className="w-full flex flex-col h-20 gap-2">
              <BarChart3 className="h-5 w-5" />
              <span className="text-xs">Detaylı Rapor</span>
            </Button>
            
            <Button variant="outline" className="w-full flex flex-col h-20 gap-2">
              <ExternalLink className="h-5 w-5" />
              <span className="text-xs">Hızlı Erişim</span>
            </Button>
            
            <Button variant="outline" className="w-full flex flex-col h-20 gap-2">
              <Share2 className="h-5 w-5" />
              <span className="text-xs">Paylaş</span>
            </Button>
            
            <Button variant="outline" className="w-full flex flex-col h-20 gap-2">
              <Copy className="h-5 w-5" />
              <span className="text-xs">Kopyala</span>
            </Button>
            
            <Button variant="outline" className="w-full flex flex-col h-20 gap-2" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-5 w-5 text-red-500" />
              <span className="text-xs text-red-500">Sil</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Projeyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Proje kalıcı olarak silinecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-red-600 hover:bg-red-700">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
