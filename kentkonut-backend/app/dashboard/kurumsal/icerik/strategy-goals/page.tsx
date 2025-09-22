"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, Flag, Edit, Save, X, Plus } from "lucide-react"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import RichTextEditor from "@/components/ui/rich-text-editor-tiptap"
import { toast } from "sonner"
import { CorporateAPI } from '@/utils/corporateApi'

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

export default function StrategyGoalsPage() {
  const [strategyContents, setStrategyContents] = useState<CorporateContent[]>([])
  const [goalsContents, setGoalsContents] = useState<CorporateContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [strategyEditContent, setStrategyEditContent] = useState("")
  const [goalsEditContent, setGoalsEditContent] = useState("")

  useEffect(() => {
    fetchContent()  }, [])
  const fetchContent = async () => {
    try {
      setLoading(true);
      const [strategyData, goalsData] = await Promise.all([
        CorporateAPI.content.getByType('STRATEGY'),
        CorporateAPI.content.getByType('GOALS')
      ])

      setStrategyContents(Array.isArray(strategyData) ? strategyData : [])
      setGoalsContents(Array.isArray(goalsData) ? goalsData : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İçerik yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (content: CorporateContent) => {
    setEditingId(content.id)
    if (content.type === 'STRATEGY') {
      setStrategyEditContent(content.content)
    } else if (content.type === 'GOALS') {
      setGoalsEditContent(content.content)
    }
  }

  const handleSave = async (id: string, type: 'STRATEGY' | 'GOALS') => {
    try {
      const contentToSave = type === 'STRATEGY' ? strategyEditContent : goalsEditContent;

      await CorporateAPI.content.update(id, {
        content: contentToSave,
      })

      // Update local state
      if (type === 'STRATEGY') {
        setStrategyContents(prev =>
          prev.map(item =>
            item.id === id ? { ...item, content: contentToSave } : item
          )
        )
      } else {
        setGoalsContents(prev =>
          prev.map(item =>
            item.id === id ? { ...item, content: contentToSave } : item
          )
        )
      }

      setEditingId(null)
      if (type === 'STRATEGY') {
        setStrategyEditContent("")
      } else {
        setGoalsEditContent("")
      }

      toast.success(`${type === 'STRATEGY' ? 'Strateji' : 'Hedef'} başarıyla güncellendi`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Güncelleme başarısız')
      toast.error("Güncelleme sırasında bir hata oluştu")
    }
  }

  const handleCancel = (type?: 'STRATEGY' | 'GOALS') => {
    setEditingId(null)
    if (type === 'STRATEGY') {
      setStrategyEditContent("")
    } else if (type === 'GOALS') {
      setGoalsEditContent("")
    } else {
      // If no type specified, clear both (fallback)
      setStrategyEditContent("")
      setGoalsEditContent("")
    }
  }

  const createContent = async (type: 'STRATEGY' | 'GOALS', title: string) => {
    try {
      const currentItems = type === 'STRATEGY' ? strategyContents : goalsContents
      const nextOrder = Math.max(...currentItems.map(item => item.order), 0) + 1

      const newContent = await CorporateAPI.content.create({
        type,
        title,
        content: `${title} içeriği buraya yazılacak...`,
        isActive: true,
        order: nextOrder,
      })
      
      if (type === 'STRATEGY') {
        setStrategyContents(prev => [...prev, newContent])      } else {
        setGoalsContents(prev => [...prev, newContent])
      }
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İçerik oluşturulamadı')
    }
  }

  const deleteContent = async (id: string, type: 'STRATEGY' | 'GOALS') => {
    try {
      await CorporateAPI.content.delete(id)

      if (type === 'STRATEGY') {
        setStrategyContents(prev => prev.filter(item => item.id !== id))
      } else {
        setGoalsContents(prev => prev.filter(item => item.id !== id))
      }
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silme işlemi başarısız')
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
          { name: "Kurumsal İçerik", href: "/dashboard/kurumsal/icerik" },
          { name: "Strateji & Hedefler", href: "/dashboard/kurumsal/icerik/strategy-goals" },
        ]}
        className="mb-4"
      />
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Strateji & Hedefler</h1>
        <p className="text-gray-600 mt-2">Kurumsal strateji ve hedeflerimiz</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchContent} className="mt-2" size="sm">
            Tekrar Dene
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strateji Bölümü */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Stratejilerimiz</h2>
            </div>
            <Button
              onClick={() => createContent('STRATEGY', `Strateji ${strategyContents.length + 1}`)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Strateji Ekle
            </Button>
          </div>

          {strategyContents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">Henüz strateji eklenmemiş</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {strategyContents
                .sort((a, b) => a.order - b.order)
                .map((strategy) => (
                  <Card key={strategy.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{strategy.title}</CardTitle>
                          <Badge variant={strategy.isActive ? "default" : "secondary"}>
                            {strategy.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(strategy)}
                            disabled={editingId === strategy.id}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteContent(strategy.id, 'STRATEGY')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {editingId === strategy.id ? (
                        <div className="space-y-4">
                          <div className="p-3 bg-green-50 border border-green-200 text-sm rounded-lg">
                            ✅ <strong>RichTextEditor Aktif</strong> - Gelişmiş floating image desteği ile
                          </div>
                          <div className="border rounded-lg overflow-hidden">
                            <RichTextEditor
                              content={strategyEditContent}
                              onChange={setStrategyEditContent}
                              placeholder="Strateji içeriğinizi yazın ve floating resimler ekleyin..."
                              minHeight="400px"
                              mediaFolder="corporate-images"
                            />
                          </div>

                          {/* Preview Section */}
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2 text-gray-700">Önizleme</h4>
                            <div className="border rounded-lg p-3 bg-gray-50 max-h-32 overflow-y-auto">
                              <div
                                className="content-display text-sm"
                                style={{
                                  overflow: 'visible !important',
                                  contain: 'none !important',
                                  lineHeight: '1.5'
                                }}
                                dangerouslySetInnerHTML={{ __html: strategyEditContent }}
                              />
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleSave(strategy.id, 'STRATEGY')}
                              size="sm"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Kaydet
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleCancel('STRATEGY')}
                              size="sm"
                            >
                              <X className="h-4 w-4 mr-2" />
                              İptal
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div
                            className="prose prose-gray max-w-none mb-2"
                            style={{
                              overflow: 'visible !important',
                              contain: 'none !important',
                              lineHeight: '1.6'
                            }}
                            dangerouslySetInnerHTML={{ __html: strategy.content }}
                          />
                          <div className="text-xs text-gray-500">
                            Son güncelleme: {new Date(strategy.updatedAt).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>

        {/* Hedefler Bölümü */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flag className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">Hedeflerimiz</h2>
            </div>
            <Button
              onClick={() => createContent('GOALS', `Hedef ${goalsContents.length + 1}`)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Hedef Ekle
            </Button>
          </div>

          {goalsContents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Flag className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">Henüz hedef eklenmemiş</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {goalsContents
                .sort((a, b) => a.order - b.order)
                .map((goal) => (
                  <Card key={goal.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          <Badge variant={goal.isActive ? "default" : "secondary"}>
                            {goal.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(goal)}
                            disabled={editingId === goal.id}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteContent(goal.id, 'GOALS')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {editingId === goal.id ? (
                        <div className="space-y-4">
                          <div className="p-3 bg-green-50 border border-green-200 text-sm rounded-lg">
                            ✅ <strong>RichTextEditor Aktif</strong> - Gelişmiş floating image desteği ile
                          </div>
                          <div className="border rounded-lg overflow-hidden">
                            <RichTextEditor
                              content={goalsEditContent}
                              onChange={setGoalsEditContent}
                              placeholder="Hedef içeriğinizi yazın ve floating resimler ekleyin..."
                              minHeight="400px"
                              mediaFolder="corporate-images"
                            />
                          </div>

                          {/* Preview Section */}
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2 text-gray-700">Önizleme</h4>
                            <div className="border rounded-lg p-3 bg-gray-50 max-h-32 overflow-y-auto">
                              <div
                                className="content-display text-sm"
                                style={{
                                  overflow: 'visible !important',
                                  contain: 'none !important',
                                  lineHeight: '1.5'
                                }}
                                dangerouslySetInnerHTML={{ __html: goalsEditContent }}
                              />
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleSave(goal.id, 'GOALS')}
                              size="sm"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Kaydet
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleCancel('GOALS')}
                              size="sm"
                            >
                              <X className="h-4 w-4 mr-2" />
                              İptal
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div
                            className="prose prose-gray max-w-none mb-2"
                            style={{
                              overflow: 'visible !important',
                              contain: 'none !important',
                              lineHeight: '1.6'
                            }}
                            dangerouslySetInnerHTML={{ __html: goal.content }}
                          />
                          <div className="text-xs text-gray-500">
                            Son güncelleme: {new Date(goal.updatedAt).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
