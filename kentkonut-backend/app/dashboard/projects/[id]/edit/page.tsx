"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { ProjectStatus } from "@/types";
import { TabbedProjectForm } from "@/components/projects/TabbedProjectForm";
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
  media?: GlobalMediaFile;
  tags: Array<{
    tag: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  galleryItems: Array<{
    media: GlobalMediaFile;
  }>;
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [initialFormData, setInitialFormData] = useState<any>(null);
  const [selectedMedia, setSelectedMedia] = useState<GlobalMediaFile | null>(null);
  const [selectedGalleryItems, setSelectedGalleryItems] = useState<GlobalMediaFile[]>([]);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      try {
        console.log("🔍 [FRONTEND] Fetching project data for ID:", projectId);
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const projectData = await response.json();
          console.log("🔍 [FRONTEND] Received project data:", JSON.stringify(projectData, null, 2));
          console.log("🔍 [FRONTEND] hasQuickAccess in received data:", projectData.hasQuickAccess);
          console.log("🔍 [FRONTEND] Type of hasQuickAccess in received data:", typeof projectData.hasQuickAccess);
          setProject(projectData);

          // Populate form data
          const formData = {
            title: projectData.title,
            slug: projectData.slug,
            summary: projectData.summary || "",
            content: projectData.content,
            status: projectData.status,
            latitude: projectData.latitude?.toString() || "",
            longitude: projectData.longitude?.toString() || "",
            locationName: projectData.locationName || "",
            province: projectData.province || "",
            district: projectData.district || "",
            address: projectData.address || "",
            published: projectData.published,
            publishedAt: projectData.publishedAt ? new Date(projectData.publishedAt).toISOString().slice(0, 16) : "",
            readingTime: projectData.readingTime,
            hasQuickAccess: projectData.hasQuickAccess || false, // CRITICAL FIX: Include hasQuickAccess
            tags: projectData.tags.map((t: any) => t.tag.name).join(", "),
            yil: projectData.yil || "",
            blokDaireSayisi: projectData.blokDaireSayisi || "",
          };

          console.log("🔍 [FRONTEND] Constructed form data:", JSON.stringify(formData, null, 2));
          console.log("🔍 [FRONTEND] hasQuickAccess in form data:", formData.hasQuickAccess);
          console.log("🔍 [FRONTEND] Type of hasQuickAccess in form data:", typeof formData.hasQuickAccess);

          setInitialFormData(formData);

          // Set selected media
          if (projectData.media) {
            setSelectedMedia(projectData.media);
          }

          // Set gallery items
          if (projectData.galleryItems) {
            setSelectedGalleryItems(projectData.galleryItems.map((item: any) => item.media));
          }
        } else {
          toast.error("Proje bulunamadı");
          router.push("/dashboard/projects");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Proje yüklenirken hata oluştu");
      } finally {
        setFetchLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId, router]);

  const handleSubmit = async (formData: any, selectedMedia: GlobalMediaFile | null, selectedGalleryItems: GlobalMediaFile[]) => {
    setLoading(true);

    try {
      // DEBUGGING: Log the raw form data received
      console.log("🔍 [FRONTEND] Raw form data received:", JSON.stringify(formData, null, 2));
      console.log("🔍 [FRONTEND] hasQuickAccess in raw form data:", formData.hasQuickAccess);
      console.log("🔍 [FRONTEND] Type of hasQuickAccess:", typeof formData.hasQuickAccess);
      // Handle tags - convert from comma-separated string to array
      const tagsArray = formData.tags
        ? formData.tags
            .split(',')
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag.length > 0)
        : [];

      // Extract gallery item IDs from the GlobalMediaFile objects
      const galleryItemIds = (selectedGalleryItems || []).map(item => item.id);
      
      // Log for debugging
      console.log("Selected gallery items:", selectedGalleryItems);
      console.log("Gallery item IDs:", galleryItemIds);

      const projectData = {
        title: formData.title,
        slug: formData.slug,
        summary: formData.summary || null,
        content: formData.content,
        status: formData.status,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        locationName: formData.locationName || null,
        province: formData.province || null,
        district: formData.district || null,
        address: formData.address || null,
        mediaId: selectedMedia?.id,
        published: formData.published,
        publishedAt: formData.publishedAt || undefined,
        readingTime: formData.readingTime,
        hasQuickAccess: formData.hasQuickAccess || false, // Hızlı erişim aktif mi?
        tags: tagsArray,
        galleryItems: galleryItemIds,
        yil: formData.yil || null,
        blokDaireSayisi: formData.blokDaireSayisi || null,
      };

      // DEBUGGING: Log the constructed project data
      console.log("🔍 [FRONTEND] Constructed project data:", JSON.stringify(projectData, null, 2));
      console.log("🔍 [FRONTEND] hasQuickAccess in project data:", projectData.hasQuickAccess);
      console.log("🔍 [FRONTEND] Type of hasQuickAccess in project data:", typeof projectData.hasQuickAccess);
      console.log("🔍 [FRONTEND] About to send PUT request to:", `/api/projects/${projectId}`);
      
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("🔍 [FRONTEND] PUT response received:", JSON.stringify(responseData, null, 2));
        console.log("🔍 [FRONTEND] hasQuickAccess in response:", responseData.hasQuickAccess);

        // If we have media or gallery items, update their category to Projects
        const mediaIdsToUpdate = [];
        if (selectedMedia?.id) {
          mediaIdsToUpdate.push(selectedMedia.id);
        }
        if (galleryItemIds.length > 0) {
          mediaIdsToUpdate.push(...galleryItemIds);
        }
        
        if (mediaIdsToUpdate.length > 0) {
          // Call our new API endpoint to update media categories
          try {
            const categoryResponse = await fetch("/api/media/update-category", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ mediaIds: mediaIdsToUpdate }),
            });
            
            if (!categoryResponse.ok) {
              console.warn("Failed to update media categories to Projects");
            }
          } catch (categoryError) {
            console.error("Error updating media categories:", categoryError);
          }
        }
        
        toast.success("Proje başarıyla güncellendi");
        router.push(`/dashboard/projects/${projectId}`);
      } else {
        // Try to get the detailed error message
        try {
          const errorData = await response.json();
          console.error("Project update failed:", errorData);
          console.error("Project data sent:", projectData);
          
          if (errorData.details) {
            // Format validation errors for display
            const errorMessages = errorData.details.map((err: any) => 
              `${err.path.join('.')}: ${err.message}`
            ).join(', ');
            toast.error(`Validation error: ${errorMessages}`);
          } else if (errorData.error) {
            toast.error(`Error: ${errorData.error}`);
          } else {
            // No specific error details provided
            toast.error(`Proje güncellenirken bir hata oluştu (${response.status})`);
            console.error("Full response:", response);
          }
        } catch (e) {
          // If the response isn't valid JSON
          console.error("Error parsing JSON response:", e);
          toast.error(`Proje güncelleme hatası: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Proje güncellenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Proje bulunamadı</h3>
        <Button onClick={() => router.push("/dashboard/projects")}>
          Projelere Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <h1 className="text-3xl font-bold tracking-tight">Proje Düzenle</h1>
          <p className="text-muted-foreground">
            {project.title} projesini düzenleyin
          </p>
        </div>
      </div>

      {initialFormData && (
        <TabbedProjectForm
          initialData={initialFormData}
          selectedMedia={selectedMedia}
          selectedGalleryItems={selectedGalleryItems}
          onSubmit={handleSubmit}
          submitLabel="Projeyi Güncelle"
          loading={loading}
          projectId={project?.id}
        />
      )}
    </div>
  );
}
