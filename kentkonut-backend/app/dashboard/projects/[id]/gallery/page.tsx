"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { NewProjectGalleryManager } from "@/components/projects/NewProjectGalleryManager";

export default function ProjectGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      // Proje bilgilerini yükle
      fetch(`/api/projects/${projectId}`)
        .then(res => res.json())
        .then(data => {
          setProject(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading project:', err);
          setLoading(false);
        });

    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
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
      <div className="container mx-auto p-6">
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
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/projects/${projectId}`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri Dön
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {project.title} - Galeri Yönetimi
            </h1>
            <p className="text-gray-600">
              Proje galerisi ve medya yönetimi
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          <ImageIcon className="h-3 w-3 mr-1" />
          Hiyerarşik Galeri
        </Badge>
      </div>

      {/* Gallery Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Proje Galerisi Yönetimi
            <Badge variant="outline" className="ml-2">
              Hiyerarşik Galeri
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Proje için hiyerarşik galeri yapısı oluşturun ve medyaları organize edin
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <NewProjectGalleryManager 
            projectId={projectId}
            onGalleryChange={(galleries) => {
              console.log('Gallery updated:', galleries);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
