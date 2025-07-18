"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Info, Edit, Save, X, Plus } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import RichTextEditor from "@/components/ui/rich-text-editor-tiptap"
import { toast } from "sonner"

interface CorporateContent {
  id: string
  type: 'ABOUT'
  title: string
  content: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export default function HakkimizdaPage() {
  const [aboutContent, setAboutContent] = useState<CorporateContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/corporate/type/ABOUT')

      if (response.ok) {
        const data = await response.json()
        setAboutContent(Array.isArray(data) && data.length > 0 ? data[0] : null)
      }
    } catch (err) {
      toast.error("İçerik yüklenirken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (content: CorporateContent) => {
    setEditingId(content.id)
    setEditContent(content.content)
  }

  const handleSave = async () => {
    if (!editingId) return

    try {
      const response = await fetch(`/api/corporate/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent,
        }),
      })

      if (response.ok) {
        toast.success("İçerik başarıyla güncellendi")
        setEditingId(null)
        fetchContent()
      } else {
        toast.error("İçerik güncellenirken bir hata oluştu")
      }
    } catch (err) {
      toast.error("İçerik güncellenirken bir hata oluştu")
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditContent("")
  }

  const createContent = async (type: string, title: string) => {
    try {
      const response = await fetch('/api/corporate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          title,
          content: `<p>${title} içeriği buraya yazılacak...</p>`,
          order: 0,
          isActive: true,
        }),
      })

      if (response.ok) {
        toast.success(`${title} başarıyla oluşturuldu`)
        fetchContent()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || `${title} oluşturulurken bir hata oluştu`)
      }
    } catch (err) {
      toast.error(`${title} oluşturulurken bir hata oluştu`)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <Breadcrumb 
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Kurumsal", href: "/dashboard/corporate" },
          { label: "Hakkımızda", href: "/dashboard/kurumsal/hakkimizda" }
        ]} 
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hakkımızda</h1>
          <p className="text-muted-foreground">
            Şirket hakkında genel bilgileri yönetin
          </p>
        </div>
      </div>

      <div className="w-full">
        {/* Hakkımızda İçeriği */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Hakkımızda İçeriği
              </CardTitle>
              {aboutContent && editingId !== aboutContent.id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(aboutContent)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
              )}
              {editingId === aboutContent?.id && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4 mr-2" />
                    İptal
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!aboutContent ? (
              <div className="text-center py-8">
                <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Henüz hakkımızda içeriği tanımlanmamış</p>
                <Button onClick={() => createContent('ABOUT', 'Hakkımızda')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Hakkımızda İçeriği Ekle
                </Button>
              </div>
            ) : editingId === aboutContent.id ? (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 text-sm rounded-lg">
                  ✅ <strong>RichTextEditor Aktif</strong> - Gelişmiş floating image desteği ile
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <RichTextEditor
                    content={editContent}
                    onChange={setEditContent}
                    minHeight="400px"
                    placeholder="Hakkımızda içeriğinizi yazın ve floating resimler ekleyin..."
                  />
                </div>

                {/* Preview Section */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Önizleme (Frontend Görünümü)</h3>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div
                      className="content-display preview-content"
                      style={{
                        overflow: 'visible !important',
                        contain: 'none !important',
                        display: 'block !important',
                        isolation: 'auto' as any,
                        transform: 'none !important',
                        filter: 'none !important',
                        lineHeight: '1.6',
                        fontSize: '16px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        color: '#374151'
                      }}
                      dangerouslySetInnerHTML={{ __html: editContent }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="prose max-w-none">
                <div
                  className="content-display about-content"
                  style={{
                    overflow: 'visible !important',
                    contain: 'none !important',
                    display: 'block !important',
                    isolation: 'auto' as any,
                    transform: 'none !important',
                    filter: 'none !important',
                    lineHeight: '1.6',
                    fontSize: '16px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: '#374151'
                  }}
                  dangerouslySetInnerHTML={{ __html: aboutContent.content }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* FloatImage CSS for preview and about content */}
        <style jsx>{`
          .preview-content :global(img[data-float="left"]),
          .about-content :global(img[data-float="left"]) {
            float: left !important;
            margin: 0 20px 10px 0 !important;
            display: block !important;
            border-radius: 4px;
          }

          .preview-content :global(img[data-float="right"]),
          .about-content :global(img[data-float="right"]) {
            float: right !important;
            margin: 0 0 10px 20px !important;
            display: block !important;
            border-radius: 4px;
          }

          .preview-content :global(img[data-float="none"]),
          .about-content :global(img[data-float="none"]) {
            display: block !important;
            margin: 16px auto !important;
            border-radius: 4px;
          }

          .preview-content :global(p),
          .about-content :global(p) {
            margin: 0 0 16px 0;
            text-align: justify;
            min-height: 1.6em;
          }

          .preview-content :global(p:empty),
          .about-content :global(p:empty) {
            min-height: 1.6em;
            margin: 0 0 16px 0;
          }

          .preview-content :global(h1),
          .about-content :global(h1) {
            margin: 24px 0 16px 0;
            font-size: 1.875em;
            font-weight: 700;
          }

          .preview-content :global(h2),
          .about-content :global(h2) {
            margin: 24px 0 16px 0;
            font-size: 1.5em;
            font-weight: 600;
          }

          .preview-content :global(ul),
          .preview-content :global(ol),
          .about-content :global(ul),
          .about-content :global(ol) {
            margin: 0 0 16px 0;
            padding-left: 24px;
          }

          .preview-content :global(li),
          .about-content :global(li) {
            margin: 4px 0;
          }
        `}</style>
      </div>
    </div>
  )
}
