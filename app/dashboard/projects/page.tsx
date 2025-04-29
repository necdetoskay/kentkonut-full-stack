"use client"

import { useState, useEffect, createContext } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Edit, Pencil, PlusCircle, Loader2, Trash } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";

// Dialog context for tracking the open state
export const DialogContext = createContext({
  isDialogOpen: false,
  setIsDialogOpen: (value: boolean) => {}
});

type Project = {
  id: number;
  title: string;
  description: string;
  status: "ONGOING" | "COMPLETED" | "PLANNING";
  isActive: boolean;
  coverImage: string;
  createdAt: string;
  location: string;
  completionDate?: string;
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Track if any dialog is open
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogProjectId, setDeleteDialogProjectId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("ongoing");

  const breadcrumbItems = [
    { title: "Projeler" }
  ]

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        throw new Error("Projeler yüklenirken bir hata oluştu");
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Projeler yüklenirken hata:", error);
      toast.error("Projeler yüklenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProject = () => {
    router.push(`/dashboard/projects/create?status=${activeTab === "completed" ? "completed" : "ongoing"}`);
  };

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filtre ve sıralama
  const ongoingProjects = projects.filter(
    p => p.status === "ONGOING" || p.status === "PLANNING"
  );
  const completedProjects = projects
    .filter(p => p.status === "COMPLETED")
    .sort((a, b) => {
      if (!a.completionDate) return 1;
      if (!b.completionDate) return -1;
      return new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime();
    });

  // Remove project from state after delete
  const handleProjectDeleted = (id: number) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <DialogContext.Provider value={{ isDialogOpen, setIsDialogOpen }}>
      <div className="container mx-auto py-10">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Projeler</h2>
            <p className="text-muted-foreground">
              Web sitesinde görüntülenecek projeleri yönetin
            </p>
          </div>
          <Button onClick={handleAddProject}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Proje
          </Button>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="ongoing">Devam Eden Projeler</TabsTrigger>
            <TabsTrigger value="completed">Tamamlanan Projeler</TabsTrigger>
          </TabsList>
          <TabsContent value="ongoing">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full flex flex-col justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <span className="text-muted-foreground">Projeler yükleniyor...</span>
                </div>
              ) : ongoingProjects.length === 0 ? (
                <div className="col-span-full flex justify-center items-center h-64 border rounded-lg bg-muted/20">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">Henüz devam eden proje yok</p>
                    <Button onClick={handleAddProject}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Yeni Proje Ekle
                    </Button>
                  </div>
                </div>
              ) : (
                ongoingProjects.map((project) => (
                  <Link 
                    href={`/dashboard/projects/${project.id}`} 
                    key={project.id}
                    className="transition-transform hover:scale-[1.02] focus:scale-[1.02]"
                  >
                    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative w-full h-48 overflow-hidden">
                        {project.coverImage ? (
                          <Image 
                            src={project.coverImage}
                            alt={project.title}
                            className="object-cover"
                            fill
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <p className="text-muted-foreground">Görsel Yok</p>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 z-10">
                          <Badge variant={project.isActive ? "default" : "secondary"}>
                            {project.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{project.title}</CardTitle>
                        </div>
                        {project.location && (
                          <CardDescription>{project.location}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={project.status === "COMPLETED" ? "outline" : "secondary"}>
                            {project.status === "COMPLETED" ? "Tamamlandı" : "Devam Ediyor"}
                          </Badge>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {formatDate(project.createdAt)}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="ml-auto" asChild>
                          <div>
                            <Pencil className="mr-2 h-4 w-4" />
                            Düzenle
                          </div>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="ml-2"
                          onClick={e => {
                            e.preventDefault();
                            setDeleteDialogProjectId(project.id);
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Sil
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full flex flex-col justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <span className="text-muted-foreground">Projeler yükleniyor...</span>
                </div>
              ) : completedProjects.length === 0 ? (
                <div className="col-span-full flex justify-center items-center h-64 border rounded-lg bg-muted/20">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">Henüz tamamlanan proje yok</p>
                  </div>
                </div>
              ) : (
                completedProjects.map((project) => (
                  <Link 
                    href={`/dashboard/projects/${project.id}`} 
                    key={project.id}
                    className="transition-transform hover:scale-[1.02] focus:scale-[1.02]"
                  >
                    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative w-full h-48 overflow-hidden">
                        {project.coverImage ? (
                          <Image 
                            src={project.coverImage}
                            alt={project.title}
                            className="object-cover"
                            fill
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <p className="text-muted-foreground">Görsel Yok</p>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 z-10">
                          <Badge variant={project.isActive ? "default" : "secondary"}>
                            {project.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{project.title}</CardTitle>
                        </div>
                        {project.location && (
                          <CardDescription>{project.location}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={project.status === "COMPLETED" ? "outline" : "secondary"}>
                            {project.status === "COMPLETED" ? "Tamamlandı" : "Devam Ediyor"}
                          </Badge>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {formatDate(project.createdAt)}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="ml-auto" asChild>
                          <div>
                            <Pencil className="mr-2 h-4 w-4" />
                            Düzenle
                          </div>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="ml-2"
                          onClick={e => {
                            e.preventDefault();
                            setDeleteDialogProjectId(project.id);
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Sil
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={deleteDialogProjectId !== null} onOpenChange={open => !open && setDeleteDialogProjectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Projeyi Sil</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {deleteDialogProjectId && (
              <span className="text-destructive font-bold">
                {projects.find(p => p.id === deleteDialogProjectId)?.title}
              </span>
            )} projesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogProjectId(null)} disabled={isDeleting}>
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleteDialogProjectId) return;
                setIsDeleting(true);
                try {
                  const response = await fetch(`/api/projects/${deleteDialogProjectId}`, { method: "DELETE" });
                  if (!response.ok) throw new Error();
                  toast.success("Proje başarıyla silindi");
                  handleProjectDeleted(deleteDialogProjectId);
                  setDeleteDialogProjectId(null);
                } catch {
                  toast.error("Proje silinirken bir hata oluştu");
                } finally {
                  setIsDeleting(false);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Siliniyor..." : "Sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
} 