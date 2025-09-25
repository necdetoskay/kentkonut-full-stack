"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  MessageCircle,
  Download,
  BarChart3,
  Activity,
  Share2,
  Copy,
  Image as ImageIcon,
  ExternalLink,
  Building2
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
    createdAt: string;
    user: {
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
  projectGalleries?: Array<{
    id: number;
    title: string;
    description?: string;
    order: number;
    isActive: boolean;
    media?: GlobalMediaFile;
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

const getStatusBadge = (status: ProjectStatus) => {
  const variant = status === ProjectStatus.COMPLETED ? "default" : "secondary";
  return (
    <Badge variant={variant}>
      {PROJECT_STATUS_LABELS[status]}
    </Badge>
  );
};

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
  const projectId = params?.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [galleryCount, setGalleryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadDashboardData();
    }
  }, [projectId]);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        fetchProjectData(),
        fetchProjectStats(),
        fetchGalleryCount()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    
    try {
      await ProjectsAPI.delete(project.id.toString());
      toast.success("Proje başarıyla silindi");
      router.push("/dashboard/projects");
    } catch (error) {
      const { message } = handleApiError(error);
      console.error("Error deleting project:", error);
      toast.error(`Proje silinirken hata oluştu: ${message}`);
    } finally {
      setDeleteDialogOpen(false);
    }
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

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Az önce';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    return `${Math.floor(diffInSeconds / 86400)} gün önce`;
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
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Proje Bulunamadı</h2>
            <p className="text-gray-600 mb-6">Aradığınız proje bulunamadı.</p>
            <Button onClick={() => router.push("/dashboard/projects")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Projeler Listesine Dön
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BREADCRUMB */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/projects">Projeler</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            {getStatusBadge(project.status)}
          </div>
          <p className="text-gray-600">{project.summary || 'Proje açıklaması bulunmuyor.'}</p>
          
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{project.author.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(project.createdAt)}</span>
            </div>
            {formatAddress(project) && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{formatAddress(project)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{project.viewCount.toLocaleString()} görüntüleme</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LoadingLink href={`/dashboard/projects/${projectId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          </LoadingLink>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Sil
          </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Görüntüleme</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalViews?.toLocaleString() || project.viewCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Son 30 gün</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yorumlar</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalComments || project.comments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Toplam yorum</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Galeri</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{galleryCount}</div>
            <p className="text-xs text-muted-foreground">Galeri öğesi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İndirmeler</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDownloads || 0}</div>
            <p className="text-xs text-muted-foreground">Toplam indirme</p>
          </CardContent>
        </Card>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* PROJECT DETAILS */}
          <Card>
            <CardHeader>
              <CardTitle>Proje Detayları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.media && (
                <div className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={getMediaUrl(project.media.url)}
                    alt={project.media.filename || project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="prose prose-sm max-w-none">
                <EnhancedHtmlRenderer content={project.content} />
              </div>

              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {project.tags.map((tagRelation, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {tagRelation.tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* COMMENTS */}
          {project.comments && project.comments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Son Yorumlar ({project.comments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.comments.slice(0, 5).map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.user.name}</span>
                          <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* PROJECT INFO */}
          <Card>
            <CardHeader>
              <CardTitle>Proje Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Durum:</span>
                <div>{getStatusBadge(project.status)}</div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Yayınlandı:</span>
                <span className="text-sm font-medium">
                  {project.published ? 'Evet' : 'Hayır'}
                </span>
              </div>

              {project.publishedAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Yayın Tarihi:</span>
                  <span className="text-sm font-medium">
                    {formatDate(project.publishedAt)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Okuma Süresi:</span>
                <span className="text-sm font-medium">{project.readingTime} dk</span>
              </div>

              {project.yil && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Yıl:</span>
                  <span className="text-sm font-medium">{project.yil}</span>
                </div>
              )}

              {project.blokDaireSayisi && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Blok/Daire:</span>
                  <span className="text-sm font-medium">{project.blokDaireSayisi}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Oluşturulma:</span>
                <span className="text-sm font-medium">{formatDate(project.createdAt)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Güncellenme:</span>
                <span className="text-sm font-medium">{formatDate(project.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* LOCATION */}
          {(project.latitude && project.longitude) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Konum
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${project.longitude - 0.001},${project.latitude - 0.001},${project.longitude + 0.001},${project.latitude + 0.001}&layer=mapnik&marker=${project.latitude},${project.longitude}`}
                    className="w-full h-full rounded-lg"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                  ></iframe>
                </div>
                {formatAddress(project) && (
                  <p className="text-sm text-gray-600 mt-2">{formatAddress(project)}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* RECENT ACTIVITIES */}
          {stats?.recentActivities && stats.recentActivities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Son Aktiviteler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentActivities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-lg">{getActivityIcon(activity.type)}</span>
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {activity.user_name} • {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* QUICK ACTIONS */}
          <Card>
            <CardHeader>
              <CardTitle>Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <LoadingLink href={`/dashboard/projects/${projectId}/gallery`}>
                  <Button variant="outline" className="w-full flex flex-col h-16 gap-1 hover:bg-blue-50 border-blue-200">
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                    <span className="text-xs font-medium">Galeri</span>
                  </Button>
                </LoadingLink>
                
                <Button variant="outline" className="w-full flex flex-col h-16 gap-1 hover:bg-green-50 border-green-200">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <span className="text-xs font-medium">İstatistik</span>
                </Button>
                
                <Button variant="outline" className="w-full flex flex-col h-16 gap-1 hover:bg-purple-50 border-purple-200">
                  <Copy className="h-5 w-5 text-purple-600" />
                  <span className="text-xs font-medium">Kopyala</span>
                </Button>
                
                <Button variant="outline" className="w-full flex flex-col h-16 gap-1 hover:bg-orange-50 border-orange-200">
                  <Share2 className="h-5 w-5 text-orange-600" />
                  <span className="text-xs font-medium">Paylaş</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* RELATED PROJECTS */}
      {project.relatedProjects && project.relatedProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>İlgili Projeler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.relatedProjects.map((relation) => (
                <div key={relation.relatedProject.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm">{relation.relatedProject.title}</h3>
                    {getStatusBadge(relation.relatedProject.status)}
                  </div>
                  {relation.relatedProject.summary && (
                    <p className="text-xs text-gray-600 mb-3">{relation.relatedProject.summary}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User className="h-3 w-3" />
                    <span>{relation.relatedProject.author.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Projeyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Proje kalıcı olarak silinecektir.
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
