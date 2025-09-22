"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Target, Edit, Save, X, Plus, Image as ImageIcon } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { UnifiedTinyMCEEditor } from "@/components/tinymce"
import { toast } from "sonner"
import { CorporateAPI } from "@/utils/corporateApi"
import dynamic from "next/dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CorporateContent {
  id: string
  type: 'VISION' | 'MISSION' | 'STRATEGY' | 'GOALS' | 'VALUES' | 'HISTORY'
  title: string
  content: string
  imageUrl?: string
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
  const [visionEditContent, setVisionEditContent] = useState("")
  const [missionEditContent, setMissionEditContent] = useState("")
  // Main image drafts (outside editor)
  const [visionImageUrlDraft, setVisionImageUrlDraft] = useState<string>("")
  const [missionImageUrlDraft, setMissionImageUrlDraft] = useState<string>("")

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      setLoading(true);
      const [visionData, missionData] = await Promise.all([
        CorporateAPI.content.getByType('VISION'),
        CorporateAPI.content.getByType('MISSION')
      ])

      setVisionContent(Array.isArray(visionData) && visionData.length > 0 ? visionData[0] : null)
      setMissionContent(Array.isArray(missionData) && missionData.length > 0 ? missionData[0] : null)
      // Initialize image drafts from server data
      const v = Array.isArray(visionData) && visionData.length > 0 ? visionData[0] : null
      const m = Array.isArray(missionData) && missionData.length > 0 ? missionData[0] : null
      setVisionImageUrlDraft(v?.imageUrl || "")
      setMissionImageUrlDraft(m?.imageUrl || "")
    } catch (err) {
      console.error("API Error:", err);
      toast.error("İçerik yüklenirken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (content: CorporateContent) => {
    setEditingId(content.id)
    if (content.type === 'VISION') {
      setVisionEditContent(content.content)
      setVisionImageUrlDraft(content.imageUrl || "")
    } else if (content.type === 'MISSION') {
      setMissionEditContent(content.content)
      setMissionImageUrlDraft(content.imageUrl || "")
    }
  }

  const handleSave = async (id: string, type: 'VISION' | 'MISSION') => {
    try {
      const contentToSave = type === 'VISION' ? visionEditContent : missionEditContent;
      const imageUrlToSave = type === 'VISION' ? visionImageUrlDraft : missionImageUrlDraft;

      await CorporateAPI.content.update(id, {
        content: contentToSave,
        imageUrl: imageUrlToSave,
      })

      // Update local state
      if (type === 'VISION' && visionContent) {
        setVisionContent({ ...visionContent, content: contentToSave, imageUrl: imageUrlToSave })
      } else if (type === 'MISSION' && missionContent) {
        setMissionContent({ ...missionContent, content: contentToSave, imageUrl: imageUrlToSave })
      }

      setEditingId(null)
      if (type === 'VISION') {
        setVisionEditContent("")
      } else {
        setMissionEditContent("")
      }

      toast.success(`${type === 'VISION' ? 'Vizyon' : 'Misyon'} başarıyla güncellendi`)
    } catch (err) {
      toast.error("Güncelleme sırasında bir hata oluştu")
    }
  }

  const handleCancel = (type?: 'VISION' | 'MISSION') => {
    setEditingId(null)
    if (type === 'VISION') {
      setVisionEditContent("")
      setVisionImageUrlDraft(visionContent?.imageUrl || "")
    } else if (type === 'MISSION') {
      setMissionEditContent("")
      setMissionImageUrlDraft(missionContent?.imageUrl || "")
    } else {
      // If no type specified, clear both (fallback)
      setVisionEditContent("")
      setMissionEditContent("")
      setVisionImageUrlDraft(visionContent?.imageUrl || "")
      setMissionImageUrlDraft(missionContent?.imageUrl || "")
    }
  }

  const createContent = async (type: 'VISION' | 'MISSION', title: string) => {
    try {
      const newContent = await CorporateAPI.content.create({
        type,
        title,
        content: `<p>${title} içeriği buraya yazılacak...</p>`,
        isActive: true,
        order: 1,
      })

      if (type === 'VISION') {
        setVisionContent(newContent)
        setVisionImageUrlDraft(newContent?.imageUrl || "")
      } else {
        setMissionContent(newContent)
        setMissionImageUrlDraft(newContent?.imageUrl || "")
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

      {/* Tabs Yapısı */}
      <Tabs defaultValue="vision">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="vision">Vizyon</TabsTrigger>
          <TabsTrigger value="mission">Misyon</TabsTrigger>
        </TabsList>

        <TabsContent value="vision" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
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
                    <div className="p-3 bg-blue-50 border border-blue-200 text-sm rounded-lg">
                      ✅ <strong>TinyMCE Editör Aktif</strong> - Galeri ve gelişmiş araç çubuğu ile
                    </div>

                    {/* Main Image Section (outside editor) */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        <h3 className="text-sm font-medium">Ana Görsel</h3>
                      </div>
                      {visionImageUrlDraft ? (
                        <div className="space-y-2">
                          <div className="aspect-video w-full max-w-[400px] border rounded-lg overflow-hidden bg-white">
                            <img src={visionImageUrlDraft} alt="Vizyon Ana Görsel" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setVisionImageUrlDraft("")}
                            >
                              Fotoğrafı Kaldır
                            </Button>
                            <GlobalMediaSelector
                              onSelect={(media) => setVisionImageUrlDraft(media.url)}
                              acceptedTypes={["image/*"]}
                              defaultCategory="corporate-images"
                              restrictToCategory={true}
                              customFolder="corporate-images"
                              buttonText="Fotoğrafı Değiştir"
                              title="Vizyon Ana Görseli Seçin"
                              description="Kurumsal klasöründen ana görsel seçin veya yeni bir görsel yükleyin"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <GlobalMediaSelector
                            onSelect={(media) => setVisionImageUrlDraft(media.url)}
                            acceptedTypes={["image/*"]}
                            defaultCategory="corporate-images"
                            restrictToCategory={true}
                            customFolder="corporate-images"
                            buttonText="Ana Görsel Seç"
                            title="Vizyon Ana Görseli Seçin"
                            description="Kurumsal klasöründen ana görsel seçin veya yeni bir görsel yükleyin"
                          />
                        </div>
                      )}
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <UnifiedTinyMCEEditor
                        value={visionEditContent}
                        onChange={setVisionEditContent}
                        height={400}
                        enableGallery
                        mediaCategory="corporate-images"
                        customFolder="corporate-images"
                        showPreviewPane={false}
                        showHtmlPane={false}
                        showDebugPane={false}
                        showConsolePane={false}
                      />
                    </div>

                    {/* Preview Section */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2 text-gray-700">Önizleme</h4>
                      {/* Show selected main image in preview as well */}
                      {visionImageUrlDraft && (
                        <div className="mb-3">
                          <div className="aspect-video w-full max-w-[400px] border rounded-lg overflow-hidden">
                            <img src={visionImageUrlDraft} alt="Vizyon Ana Görsel Önizleme" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}
                      <div className="border rounded-lg p-3 bg-gray-50 max-h-32 overflow-y-auto">
                        <div
                          className="content-display text-sm"
                          style={{
                            overflow: 'visible',
                            contain: 'none',
                            lineHeight: '1.5'
                          }}
                          dangerouslySetInnerHTML={{ __html: visionEditContent }}
                        />
                      </div>
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
                        onClick={() => handleCancel('VISION')}
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
          </div>
        </TabsContent>

        <TabsContent value="mission" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
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
                    <div className="p-3 bg-blue-50 border border-blue-200 text-sm rounded-lg">
                      ✅ <strong>TinyMCE Editör Aktif</strong> - Galeri ve gelişmiş araç çubuğu ile
                    </div>

                    {/* Main Image Section (outside editor) */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        <h3 className="text-sm font-medium">Ana Görsel</h3>
                      </div>
                      {missionImageUrlDraft ? (
                        <div className="space-y-2">
                          <div className="aspect-video w-full max-w-[400px] border rounded-lg overflow-hidden bg-white">
                            <img src={missionImageUrlDraft} alt="Misyon Ana Görsel" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setMissionImageUrlDraft("")}
                            >
                              Fotoğrafı Kaldır
                            </Button>
                            <GlobalMediaSelector
                              onSelect={(media) => setMissionImageUrlDraft(media.url)}
                              acceptedTypes={["image/*"]}
                              defaultCategory="corporate-images"
                              restrictToCategory={true}
                              customFolder="corporate-images"
                              buttonText="Fotoğrafı Değiştir"
                              title="Misyon Ana Görseli Seçin"
                              description="Kurumsal klasöründen ana görsel seçin veya yeni bir görsel yükleyin"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <GlobalMediaSelector
                            onSelect={(media) => setMissionImageUrlDraft(media.url)}
                            acceptedTypes={["image/*"]}
                            defaultCategory="corporate-images"
                            restrictToCategory={true}
                            customFolder="corporate-images"
                            buttonText="Ana Görsel Seç"
                            title="Misyon Ana Görseli Seçin"
                            description="Kurumsal klasöründen ana görsel seçin veya yeni bir görsel yükleyin"
                          />
                        </div>
                      )}
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <UnifiedTinyMCEEditor
                        value={missionEditContent}
                        onChange={setMissionEditContent}
                        height={400}
                        enableGallery
                        mediaCategory="corporate-images"
                        customFolder="corporate-images"
                        showPreviewPane={false}
                        showHtmlPane={false}
                        showDebugPane={false}
                        showConsolePane={false}
                      />
                    </div>

                    {/* Preview Section */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2 text-gray-700">Önizleme</h4>
                      {/* Show selected main image in preview as well */}
                      {missionImageUrlDraft && (
                        <div className="mb-3">
                          <div className="aspect-video w-full max-w-[400px] border rounded-lg overflow-hidden">
                            <img src={missionImageUrlDraft} alt="Misyon Ana Görsel Önizleme" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}
                      <div className="border rounded-lg p-3 bg-gray-50 max-h-32 overflow-y-auto">
                        <div
                          className="content-display text-sm"
                          style={{
                            overflow: 'visible',
                            contain: 'none',
                            lineHeight: '1.5'
                          }}
                          dangerouslySetInnerHTML={{ __html: missionEditContent }}
                        />
                      </div>
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
                        onClick={() => handleCancel('MISSION')}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

const GlobalMediaSelector = dynamic(() => import("@/components/media/GlobalMediaSelector").then(m => m.GlobalMediaSelector), {
  ssr: false,
})
