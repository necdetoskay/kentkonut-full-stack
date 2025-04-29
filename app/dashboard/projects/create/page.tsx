"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ProjectForm } from "../project-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"

export default function CreateProjectPage() {
  const router = useRouter()
  const [isFormDirty, setIsFormDirty] = useState(false)
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const defaultStatus = statusParam === "completed" ? "COMPLETED" : "ONGOING";
  
  const breadcrumbItems = [
    { title: "Projeler", href: "/dashboard/projects" },
    { title: "Yeni Proje" }
  ]
  
  const handleFormChange = (isDirty: boolean) => {
    setIsFormDirty(isDirty)
  }
  
  const handleSuccess = () => {
    router.push("/dashboard/projects")
  }
  
  const handleBack = () => {
    if (isFormDirty) {
      if (confirm("Kaydedilmemiş değişiklikler var. Çıkmak istediğinize emin misiniz?")) {
        router.push("/dashboard/projects")
      }
    } else {
      router.push("/dashboard/projects")
    }
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
              Yeni Proje
            </h2>
            <p className="text-muted-foreground">
              Yeni bir proje ekleyin
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <ProjectForm 
          onSuccess={handleSuccess}
          onFormChange={handleFormChange}
          defaultStatus={defaultStatus}
        />
      </div>
    </div>
  )
} 