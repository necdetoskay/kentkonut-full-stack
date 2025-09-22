"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Eye, Edit, Trash2, RefreshCw, GripVertical, Image as ImageIcon } from "lucide-react"
import { HighlightsAPI, handleApiError, type Highlight } from "@/utils/highlightsApi"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
// DnD Kit imports
import { DndContext, closestCenter, useSensor, useSensors, MouseSensor, TouchSensor, KeyboardSensor, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

const getPreviewUrl = (url: string | null | undefined): string => {
  if (!url) return "";

  // Aggressively find the "media/" part and use everything after it
  // to construct a root-relative path. This handles malformed URLs
  // like "https://media/..." or inconsistent full URLs.
  const mediaIndex = url.lastIndexOf('media/');
  
  if (mediaIndex === -1) {
    // If 'media/' is not found, we can't form a valid URL.
    return ""; 
  }

  const path = url.substring(mediaIndex);
  return `/${path}`;
};

export default function HighlightsPage() {

  const router = useRouter()
  const [items, setItems] = useState<Highlight[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [includeInactive, setIncludeInactive] = useState(true)

  const fetchItems = async () => {
    try {
      setLoading(true)
      const { items } = await HighlightsAPI.getAll({ includeInactive, search })
      setItems(items)
    } catch (error) {
      const { message } = handleApiError(error)
      console.error("Highlights fetch error:", message)
      toast.error(message || "Öne çıkanları yüklerken hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeInactive])

  const canReorder = useMemo(() => search.trim() === "", [search])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return items
    return items.filter((it) =>
      (it.titleOverride || "").toLowerCase().includes(term) ||
      (it.subtitleOverride || "").toLowerCase().includes(term) ||
      it.sourceType.toLowerCase().includes(term)
    )
  }, [items, search])

  const visibleItems = canReorder ? items : filtered

  const handleToggleActive = async (item: Highlight) => {
    try {
      const next = !item.isActive
      await HighlightsAPI.update(item.id, { isActive: next })
      setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, isActive: next } : p)))
      toast.success(`Kayıt ${next ? "aktifleştirildi" : "pasifleştirildi"}`)
    } catch (error) {
      const { message } = handleApiError(error)
      toast.error(message || "Durum güncellenemedi")
    }
  }

  // DnD sensors
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const onDragEnd = async (event: DragEndEvent) => {
    if (!canReorder) return
    const { active, over } = event
    if (!over || active.id === over.id) return

    const ids = items.map((x) => x.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return

    const prevSnapshot = items
    const newOrderIds = arrayMove(ids, oldIndex, newIndex)
    const reordered = newOrderIds.map((id, idx) => ({ ...items.find((x) => x.id === id)!, order: idx }))

    // optimistic update
    setItems(reordered)

    try {
      await HighlightsAPI.reorder({ items: newOrderIds.map((id, idx) => ({ id, order: idx })) })
      toast.success("Sıralama güncellendi")
    } catch (error) {
      const { message } = handleApiError(error)
      // rollback
      setItems(prevSnapshot)
      toast.error(message || "Sıralama güncellenemedi")
    }
  }

  const SortableRow: React.FC<{ item: Highlight; index: number }> = ({ item }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id, disabled: !canReorder })
    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      background: isDragging ? "rgba(0,0,0,0.02)" : undefined,
    }

    return (
      <TableRow ref={setNodeRef} style={style} key={item.id}>
        <TableCell className="w-[90px] font-mono">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`p-1 rounded hover:bg-muted ${!canReorder ? "opacity-50 cursor-not-allowed" : "cursor-grab"}`}
              aria-label="Sürükle-bırak tutamacı"
              title={canReorder ? "Sürükle-bırak ile sırala" : "Arama açıkken sıralama devre dışı"}
              {...(canReorder ? { ...attributes, ...listeners } : {})}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <span>{item.order}</span>
          </div>
        </TableCell>
        <TableCell>
          {item.imageUrl ? (
            <img src={getPreviewUrl(item.imageUrl)} alt={item.titleOverride || 'Görsel'} className="h-10 w-16 object-cover rounded-md bg-muted" />
          ) : (
            <div className="h-10 w-16 flex items-center justify-center bg-muted rounded-md">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </TableCell>
        <TableCell className="max-w-[280px] truncate">{item.titleOverride || '-'}</TableCell>
        <TableCell className="max-w-[320px] truncate text-muted-foreground">
          {item.subtitleOverride || '-'}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs ${
              item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {item.isActive ? 'Aktif' : 'Pasif'}
            </span>
            <Switch checked={item.isActive} onCheckedChange={() => handleToggleActive(item)} />
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const url = item.routeOverride || '/'
                window.open(url, '_blank', 'noopener,noreferrer')
              }}
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">Görüntüle</span>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/dashboard/kurumsal/highlights/${item.id}/edit`}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Düzenle</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/dashboard/kurumsal/highlights/${item.id}/delete`}>
                <Trash2 className="h-4 w-4 text-red-500" />
                <span className="sr-only">Sil</span>
              </Link>
            </Button>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/kurumsal">Kurumsal</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Öne Çıkanlar</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between mt-6 mb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Öne Çıkanlar</h1>
          <p className="text-sm text-muted-foreground">Anasayfada gösterilecek öne çıkan bağlantıları yönetin.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchItems} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Yenile
          </Button>
          <Button asChild>
            <Link href="/dashboard/kurumsal/highlights/new">
              <Plus className="mr-2 h-4 w-4" /> Yeni Ekle
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ögeler</CardTitle>
          <div className="flex items-center gap-3 mt-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Başlık, alt başlık veya tür ara..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Pasifleri dahil et</span>
              <Switch checked={includeInactive} onCheckedChange={setIncludeInactive} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Ögeler yükleniyor...</p>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Kayıt bulunamadı. Yeni bir öge eklemek için sağ üstteki "Yeni Ekle" butonunu kullanın.
            </div>
          ) : (
            <DndContext collisionDetection={closestCenter} sensors={sensors} onDragEnd={onDragEnd}>
              <SortableContext items={visibleItems.map((x) => x.id)} strategy={verticalListSortingStrategy}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sıra</TableHead>
                      <TableHead>Görsel</TableHead>
                      <TableHead>Başlık</TableHead>
                      <TableHead>Alt Başlık</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleItems.map((it, idx) => (
                      <SortableRow key={it.id} item={it} index={idx} />
                    ))}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
