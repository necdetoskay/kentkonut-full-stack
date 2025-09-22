"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { ProjectStatus } from "@/types";
import { TabbedProjectForm } from "@/components/projects/TabbedProjectForm";
import { GlobalMediaFile } from "@/components/media/GlobalMediaSelector";

export default function CreateProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: any, selectedMedia: GlobalMediaFile | null, selectedGalleryItems: GlobalMediaFile[]) => {
    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);

      const galleryItemIds = selectedGalleryItems.map(item => item.id);

      const projectData = {
        title: formData.title,
        slug: formData.slug,
        summary: formData.summary || undefined,
        content: formData.content,
        status: formData.status,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        locationName: formData.locationName || undefined,
        province: formData.province || undefined,
        district: formData.district || undefined,
        address: formData.address || undefined,
        mediaId: selectedMedia?.id,
        published: formData.published,
        publishedAt: formData.publishedAt || undefined,
        readingTime: formData.readingTime,
        hasQuickAccess: formData.hasQuickAccess || false, // Hızlı erişim aktif mi?
        tags: tagsArray,
        galleryItems: galleryItemIds,
        yil: formData.yil || undefined,
        blokDaireSayisi: formData.blokDaireSayisi || undefined,
      };

      // Log the data we're about to send
      console.log("Creating project data:", JSON.stringify(projectData, null, 2));
      console.log("hasQuickAccess value being sent:", projectData.hasQuickAccess);

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        const project = await response.json();
        
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
        
        toast.success("Proje başarıyla oluşturuldu");
        router.push(`/dashboard/projects/${project.id}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Proje oluşturulurken hata oluştu");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Proje oluşturulurken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Yeni Proje</h1>
          <p className="text-muted-foreground">
            Yeni bir proje oluşturun
          </p>
        </div>
      </div>

      <TabbedProjectForm
        onSubmit={handleSubmit}
        submitLabel="Projeyi Oluştur"
        loading={loading}
      />
    </div>
  );
}
