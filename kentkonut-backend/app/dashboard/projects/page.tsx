"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { LoadingSkeleton } from "@/components/ui/loading";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  User,
  Image as ImageIcon,
  FileText
} from "lucide-react";
import { ProjectStatus, PROJECT_STATUS_LABELS } from "@/types";
import { ProjectsAPI, handleApiError } from "@/utils/projectsApi";

interface ProjectItem {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  status: ProjectStatus;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  province?: string;
  district?: string;
  address?: string;
  published: boolean;
  publishedAt?: string;
  viewCount: number;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  media?: {
    id: number;
    url: string;
    alt?: string;
  };
  tags: Array<{
    tag: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  _count: {
    comments: number;
    galleryItems: number;
  };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPublished, setSelectedPublished] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectItem | null>(null);

  // Fetch projects data
  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }
      if (selectedPublished !== "all") {
        params.append("published", selectedPublished);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const data = await ProjectsAPI.getAll({
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        search: searchTerm || undefined,
      });
      setProjects(data.projects || data);
    } catch (error) {
      const { message } = handleApiError(error);
      console.error("Error fetching projects:", error);
      toast.error(`Projeler yüklenirken hata oluştu: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedStatus, selectedPublished, searchTerm]);

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      await ProjectsAPI.delete(projectToDelete.id.toString());
      toast.success("Proje başarıyla silindi");
      fetchProjects();
    } catch (error) {
      const { message } = handleApiError(error);
      console.error("Error deleting project:", error);
      toast.error(`Proje silinirken hata oluştu: ${message}`);
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
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
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading) {
    return <LoadingSkeleton rows={8} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projeler</h1>
          <p className="text-muted-foreground">
            Proje içeriklerini yönetin
          </p>
        </div>
        <LoadingLink href="/dashboard/projects/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Proje
          </Button>
        </LoadingLink>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Proje ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="ONGOING">Devam Ediyor</SelectItem>
                <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPublished} onValueChange={setSelectedPublished}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Yayın Durumu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="true">Yayında</SelectItem>
                <SelectItem value="false">Taslak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Projeler ({projects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz proje yok</h3>
              <p className="text-gray-500 mb-4">İlk projenizi oluşturmak için başlayın.</p>
              <LoadingLink href="/dashboard/projects/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Proje Oluştur
                </Button>
              </LoadingLink>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proje</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Konum</TableHead>
                    <TableHead>Yazar</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>İstatistikler</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div className="flex items-start space-x-3">
                          {project.media ? (
                            <img
                              src={project.media.url}
                              alt={project.media.alt || project.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {project.title}
                            </h3>
                            {project.summary && (
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {project.summary}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {!project.published && (
                                <Badge variant="outline">Taslak</Badge>
                              )}
                              {project.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag.tag.id} variant="secondary" className="text-xs">
                                  {tag.tag.name}
                                </Badge>
                              ))}
                              {project.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{project.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(project.status)}
                      </TableCell>
                      <TableCell>
                        {project.province || project.district || project.address || project.locationName ? (
                          <div className="flex items-start gap-1">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div className="text-sm">
                              {project.province && project.district && (
                                <div className="font-medium">{project.district}, {project.province}</div>
                              )}
                              {project.address && (
                                <div className="text-gray-600 text-xs">{project.address}</div>
                              )}
                              {project.locationName && !project.province && !project.district && (
                                <div>{project.locationName}</div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{project.author.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{formatDate(project.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          <div>{project.viewCount} görüntülenme</div>
                          <div>{project._count.comments} yorum</div>
                          <div>{project._count.galleryItems} medya</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <LoadingLink href={`/dashboard/projects/${project.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </LoadingLink>
                          <LoadingLink href={`/dashboard/projects/${project.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </LoadingLink>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setProjectToDelete(project);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Projeyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              "{projectToDelete?.title}" projesini silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
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
