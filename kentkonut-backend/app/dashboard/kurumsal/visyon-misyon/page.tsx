"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Target, Edit, Save, X, Plus } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import RichTextEditor from "@/components/ui/rich-text-editor-tiptap"
import { toast } from "sonner"

interface CorporateContent {
  id: string
  type: 'VISION' | 'MISSION' | 'STRATEGY' | 'GOALS' | 'VALUES' | 'HISTORY'
  title: string
  content: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export default function VizjonMisyonPage() {
  const [visionContent, setVisionContent] = useState<CorporateContent | null>(null)
  const [missionContent, setMissionContent] = useState<CorporateContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true);
      const [visionResponse, missionResponse] = await Promise.all([
        fetch('/api/corporate/type/VISION'),
        fetch('/api/corporate/type/MISSION')
      ])

      if (visionResponse.ok) {
        const visionData = await visionResponse.json()
        setVisionContent(Array.isArray(visionData) && visionData.length > 0 ? visionData[0] : null)
      }

      if (missionResponse.ok) {
        const missionData = await missionResponse.json()
        setMissionContent(Array.isArray(missionData) && missionData.length > 0 ? missionData[0] : null)
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

  const handleSave = async (id: string, type: 'VISION' | 'MISSION') => {
    try {
      const response = await fetch(`/api/corporate/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent,
        }),
      })

      if (!response.ok) {
        throw new Error('Güncelleme başarısız')
      }

      // Update local state
      if (type === 'VISION' && visionContent) {
        setVisionContent({ ...visionContent, content: editContent })
      } else if (type === 'MISSION' && missionContent) {
        setMissionContent({ ...missionContent, content: editContent })
      }

      setEditingId(null)
      setEditContent("")
      
      toast.success(`${type === 'VISION' ? 'Vizyon' : 'Misyon'} başarıyla güncellendi`)
    } catch (err) {
      toast.error("Güncelleme sırasında bir hata oluştu")
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditContent("")
  }

  const createContent = async (type: 'VISION' | 'MISSION', title: string) => {
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
          isActive: true,
          order: 1,
        }),
      })

      if (!response.ok) {
        throw new Error('İçerik oluşturulamadı')
      }

      const newContent = await response.json()
      
      if (type === 'VISION') {
        setVisionContent(newContent)
      } else {
        setMissionContent(newContent)
      }
      
      toast.success(`${title} başarıyla oluşturuldu`)
    } catch (err) {
      toast.error("İçerik oluşturulurken bir hata oluştu")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">İçerik yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Breadcrumb
        segments={[
          { name: "Dashboard", href: "/dashboard" },
          { name: "Kurumsal", href: "/dashboard/kurumsal" },
          { name: "Vizyon & Misyon", href: "/dashboard/kurumsal/visyon-misyon" },
        ]}
        className="mb-4"
      />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Vizyon & Misyon Yönetimi - KentWebEditor v2</h1>
        <p className="text-gray-600 mt-2">Kurumsal vizyon ve misyon beyanlarını KentWebEditor ile düzenleyin</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Vizyon Kartı */}
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <CardTitle>Vizyonumuz</CardTitle>
              </div>
              {visionContent && !editingId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(visionContent)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!visionContent ? (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Henüz vizyon tanımlanmamış</p>
                <Button onClick={() => createContent('VISION', 'Vizyon')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Vizyon Ekle
                </Button>
              </div>
            ) : editingId === visionContent.id ? (
              <div className="space-y-4">
                <div className="p-2 bg-blue-100 text-sm rounded">✅ TipTap Editör aktif - Floating image desteği ile</div>
                <div className="border rounded">
                  <RichTextEditor
                    content={editContent}
                    onChange={setEditContent}
                    placeholder="Vizyon içeriğinizi yazın ve biçimlendirin..."
                    minHeight="400px"
                    mediaFolder="corporate-images"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleSave(visionContent.id, 'VISION')}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    İptal
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div 
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: visionContent.content }}
                />
                <div className="text-xs text-gray-500">
                  Son güncelleme: {new Date(visionContent.updatedAt).toLocaleDateString('tr-TR')}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Misyon Kartı */}
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <CardTitle>Misyonumuz</CardTitle>
              </div>
              {missionContent && !editingId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(missionContent)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!missionContent ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Henüz misyon tanımlanmamış</p>
                <Button onClick={() => createContent('MISSION', 'Misyon')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Misyon Ekle
                </Button>
              </div>
            ) : editingId === missionContent.id ? (
              <div className="space-y-4">
                <div className="p-2 bg-blue-100 text-sm rounded">✅ TipTap Editör aktif - Floating image desteği ile</div>
                <div className="border rounded">
                  <RichTextEditor
                    content={editContent}
                    onChange={setEditContent}
                    placeholder="Misyon içeriğinizi yazın ve biçimlendirin..."
                    minHeight="400px"
                    mediaFolder="corporate-images"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleSave(missionContent.id, 'MISSION')}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    İptal
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div 
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: missionContent.content }}
                />
                <div className="text-xs text-gray-500">
                  Son güncelleme: {new Date(missionContent.updatedAt).toLocaleDateString('tr-TR')}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
