"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProjectForm } from "../project-form"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Switch } from "@/components/ui/switch"

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFormDirty, setIsFormDirty] = useState(false)
  const [isActive, setIsActive] = useState<boolean>(true)
  
  const breadcrumbItems = [
    { title: "Projeler", href: "/dashboard/projects" },
    { title: project?.title || "Proje Detayı" }
  ]
  
  useEffect(() => {
    fetchProject()
  }, [])
  
  useEffect(() => {
    if (project) setIsActive(project.isActive)
  }, [project])
  
  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Proje bulunamadı")
          router.push("/dashboard/projects")
          return
        }
        throw new Error("Proje verisi alınırken bir hata oluştu")
      }
      
      const data = await response.json()
      setProject(data)
    } catch (error) {
      console.error("Proje verisi alınırken hata:", error)
      toast.error("Proje verisi alınırken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }
  
  const handleSuccess = () => {
    fetchProject()
    setIsFormDirty(false)
  }
  
  // Handle form change (for dirty state tracking)
  const handleFormChange = (isDirty: boolean) => {
    setIsFormDirty(isDirty)
  }
  
  // Handle back navigation with unsaved changes warning
  const handleBack = () => {
    if (isFormDirty) {
      if (confirm("Kaydedilmemiş değişiklikler var. Çıkmak istediğinize emin misiniz?")) {
        router.push("/dashboard/projects")
      }
    } else {
      router.push("/dashboard/projects")
    }
  }
  
  // If not loaded yet, show loading indicator
  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Proje bilgileri yükleniyor...</p>
        </div>
      </div>
    )
  }
  
  // If we couldn't load the project, show error
  if (!project && !loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-bold mb-4">Proje bulunamadı</h2>
          <Button onClick={() => router.push("/dashboard/projects")}>
            Projelere Dön
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-10">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="icon" 
            className="mr-4"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Geri</span>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {project.title}
            </h2>
            <p className="text-muted-foreground">
              Proje bilgilerini güncelleyin
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Yayında</span>
          <Switch checked={isActive} onCheckedChange={val => setIsActive(!!val)} />
        </div>
      </div>
      
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <ProjectForm 
          initialData={{...project, isActive}}
          onFormChange={handleFormChange}
          onIsActiveChange={val => setIsActive(!!val)}
        />
      </div>
    </div>
  )
} 