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
  galleryItems: Array<{
    media: GlobalMediaFile;
    order: number;
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
  relatedProjects: Array<{
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

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const projectData = await ProjectsAPI.getById(projectId);
        setProject(projectData);
      } catch (error) {
        const { message } = handleApiError(error);
        console.error("Error fetching project:", error);
        toast.error(`Proje yüklenirken hata oluştu: ${message}`);
        router.push("/dashboard/projects");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId, router]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Proje bulunamadı</h3>
        <p className="text-gray-500 mb-4">Aradığınız proje mevcut değil veya silinmiş olabilir.</p>
        <LoadingLink href="/dashboard/projects">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Projelere Dön
          </Button>
        </LoadingLink>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Image */}
          {project.media && (
            <Card>
              <CardContent className="p-0">
                <img
                  src={getMediaUrl(project.media.url)}
                  alt={project.media.alt || project.title}
                  className="w-full max-h-[500px] object-contain rounded-t-lg mx-auto"
                />
              </CardContent>
            </Card>
          )}

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>Proje Detayları</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedHtmlRenderer
                content={project.content}
                className="project-content"
              />
            </CardContent>
          </Card>

          {/* Gallery */}
          {project.galleryItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Proje Galerisi ({project.galleryItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {project.galleryItems
                    .sort((a, b) => a.order - b.order)
                    .map((item, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={getMediaUrl(item.media.url)}
                          alt={item.media.alt || `Gallery ${index + 1}`}
                          className="w-full h-32 object-cover rounded border group-hover:opacity-75 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.open(item.media.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Projects */}
          {project.relatedProjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>İlgili Projeler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.relatedProjects.map((relation) => (
                    <LoadingLink
                      key={relation.relatedProject.id}
                      href={`/dashboard/projects/${relation.relatedProject.id}`}
                      className="block"
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            {relation.relatedProject.media ? (
                              <img
                                src={getMediaUrl(relation.relatedProject.media.url)}
                                alt={relation.relatedProject.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {relation.relatedProject.title}
                              </h4>
                              {relation.relatedProject.summary && (
                                <p className="text-sm text-gray-500 line-clamp-2">
                                  {relation.relatedProject.summary}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                {getStatusBadge(relation.relatedProject.status)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </LoadingLink>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Proje Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                  <span className="text-gray-500">Yazar:</span> {project.author.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                  <span className="text-gray-500">Oluşturulma:</span> {formatDate(project.createdAt)}
                </span>
              </div>

              {project.publishedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    <span className="text-gray-500">Yayınlanma:</span> {formatDate(project.publishedAt)}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                  <span className="text-gray-500">Görüntülenme:</span> {project.viewCount}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                  <span className="text-gray-500">Okuma süresi:</span> {project.readingTime} dakika
                </span>
              </div>

              {project.yil && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    <span className="text-gray-500">Yıl:</span> {project.yil}
                  </span>
                </div>
              )}

              {project.blokDaireSayisi && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    <span className="text-gray-500">Blok/Daire:</span> {project.blokDaireSayisi}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Info */}
          {(project.province || project.district || project.address || project.locationName || project.latitude) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Konum Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {formatAddress(project) && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Adres</p>
                    <p className="text-sm text-gray-600">{formatAddress(project)}</p>
                  </div>
                )}

                {project.latitude && project.longitude && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Koordinatlar</p>
                    <p className="text-sm text-gray-600">
                      {project.latitude.toFixed(6)}, {project.longitude.toFixed(6)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const url = `https://www.google.com/maps?q=${project.latitude},${project.longitude}`;
                        window.open(url, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Haritada Göster
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {project.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Etiketler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag.tag.id} variant="secondary">
                      {tag.tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Projeyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              "{project.title}" projesini silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz ve tüm proje verileri kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject}>
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
