"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FooterSectionsAPI } from "@/utils/footerApi";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
  // Normalize URL for storage (always relative, leading '/', forward slashes)
  const normalizeForStorage = (u?: string | null) => {
    if (!u) return '';
    let s = u.trim().replace(/\\/g, '/');
    // strip origin if present
    try {
      const urlObj = new URL(s);
      s = urlObj.pathname + urlObj.search + urlObj.hash;
    } catch { /* not absolute, keep as is */ }
    if (!s.startsWith('/')) s = '/' + s;
    // collapse duplicate slashes (but keep protocol // not present here)
    s = s.replace(/\/+/g, '/');
    return s;
  };

  // Resolve a media URL to a browser-usable src (absolute with origin)
  const resolveMediaSrc = (u?: string | null) => {
    if (!u) return '';
    let s = u.trim().replace(/\\/g, '/');
    if (/^https?:\/\//i.test(s)) return s;
    if (/^(data:|blob:)/i.test(s)) return s;
    if (!s.startsWith('/')) s = '/' + s;
    s = s.replace(/\/+/g, '/');
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return origin ? `${origin}${s}` : s;
  };
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2 } from "lucide-react";
import { GlobalMediaSelector, MediaFile } from "@/components/media/GlobalMediaSelector";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface FooterItem {
  id: string;
  sectionId: string;
  order: number;
  type: "LINK" | "EMAIL" | "PHONE" | "ADDRESS" | "IMAGE" | "TEXT";
  label?: string | null;
  url?: string | null;
  target?: "_self" | "_blank";
  isExternal?: boolean;
  icon?: string | null;
  imageUrl?: string | null;
  text?: string | null;
}

interface FooterSection {
  id: string;
  key: string;
  title?: string | null;
  type: "LINKS" | "IMAGE" | "CONTACT" | "TEXT" | "LEGAL";
  orientation: "VERTICAL" | "HORIZONTAL";
  order: number;
  isActive: boolean;
  items: FooterItem[];
}

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  } as React.CSSProperties;
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

// Yeni/Düzenle Öğe Diyaloğu
// Not: Bu bileşeni sayfanın sonunda render etmek yerine ana JSX içine eklemeyi tercih ederim,
// ancak mevcut dosya yapısında basit tutmak için export altına ekledik.

export default function FooterSectionDetailPage() {
  const params = useParams<{ sectionId: string }>();
  const router = useRouter();
  const [section, setSection] = useState<FooterSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [dirtyOrder, setDirtyOrder] = useState(false);
  const [localItems, setLocalItems] = useState<FooterItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editItemTarget, setEditItemTarget] = useState<FooterItem | null>(null);
  const [fType, setFType] = useState<FooterItem['type']>('LINK');
  const [fLabel, setFLabel] = useState('');
  const [fUrl, setFUrl] = useState('');
  const [fText, setFText] = useState('');
  const [fIcon, setFIcon] = useState('');
  const [fTarget, setFTarget] = useState<'_self' | '_blank'>('_self');
  const [fExternal, setFExternal] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ label?: string; url?: string; text?: string }>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  async function load() {
    if (!params?.sectionId) return;
    setLoading(true);
    try {
      const data = await FooterSectionsAPI.get(params.sectionId);
      setSection(data);
      setLocalItems(data.items || []);
    } catch (e) {
      toast.error("Bölüm yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
      setDirtyOrder(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.sectionId]);

  const sortedItems = useMemo(
    () => [...localItems].sort((a, b) => a.order - b.order),
    [localItems]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const current = sortedItems;
    const oldIndex = current.findIndex((i) => i.id === active.id);
    const newIndex = current.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const moved = arrayMove(current, oldIndex, newIndex).map((it, idx) => ({
      ...it,
      order: idx,
    }));
    setLocalItems(moved);
    setDirtyOrder(true);
  };

  const openCreateDialog = () => {
    setDialogMode('create');
    setEditItemTarget(null);
    // Default type based on section type
    if (section?.type === 'CONTACT') setFType('PHONE');
    else if (section?.type === 'TEXT') setFType('TEXT');
    else if (section?.type === 'IMAGE') setFType('IMAGE');
    else setFType('LINK');
    setFLabel('');
    setFUrl('');
    setFText('');
    setFIcon('');
    setFTarget('_self');
    setFExternal(false);
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (it: FooterItem) => {
    setDialogMode('edit');
    setEditItemTarget(it);
    setFType(it.type);
    setFLabel(it.label || '');
    setFUrl(it.url || '');
    setFText(it.text || '');
    setFIcon(it.icon || '');
    setFTarget(it.target || '_self');
    setFExternal(!!it.isExternal);
    setErrors({});
    setDialogOpen(true);
  };

  const isValidUrl = (value: string) => {
    if (!value) return false;
    // allow absolute http(s) and relative starting with /
    return /^https?:\/\//i.test(value) || value.startsWith('/') || value.startsWith('mailto:') || value.startsWith('tel:');
  };

  const validate = (): boolean => {
    const next: { label?: string; url?: string; text?: string } = {};
    if (fType === 'LINK') {
      if (!fLabel.trim()) next.label = 'Başlık zorunludur';
      if (!fUrl.trim()) next.url = 'URL zorunludur';
      else if (!isValidUrl(fUrl.trim())) next.url = 'Geçerli bir URL girin (http(s):// veya / ile başlayabilir)';
    } else if (fType === 'PHONE' || fType === 'EMAIL' || fType === 'ADDRESS') {
      if (!fLabel.trim()) next.label = 'Bu alan zorunludur';
      if (fUrl.trim() && !isValidUrl(fUrl.trim())) next.url = 'Geçerli bir URL girin (mailto:, tel:, http(s):// veya /)';
    } else if (fType === 'TEXT') {
      if (!fText.trim()) next.text = 'Metin zorunludur';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submitDialog = async () => {
    if (!section) return;
    if (!validate()) return;
    try {
      if (dialogMode === 'create') {
        await FooterSectionsAPI.createItem({
          sectionId: section.id,
          type: fType,
          label: fLabel || undefined,
          url: fUrl || undefined,
          text: fText || undefined,
          icon: fIcon || undefined,
          target: fTarget,
          isExternal: fExternal,
          order: localItems.length,
        });
        toast.success('Öğe eklendi');
      } else if (editItemTarget) {
        await FooterSectionsAPI.updateItem({
          id: editItemTarget.id,
          sectionId: section.id,
          type: fType,
          label: fLabel || undefined,
          url: fUrl || undefined,
          text: fText || undefined,
          icon: fIcon || undefined,
          target: fTarget,
          isExternal: fExternal,
          order: editItemTarget.order,
        });
        toast.success('Öğe güncellendi');
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      toast.error('İşlem sırasında bir hata oluştu');
    }
  };

  const persistOrder = async () => {
    if (!section) return;
    try {
      await FooterSectionsAPI.reorderItems(
        section.id,
        localItems
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((i, idx) => ({ id: i.id, order: idx }))
      );
      toast.success("Sıralama kaydedildi");
      setDirtyOrder(false);
      await load();
    } catch (e) {
      toast.error("Sıralama kaydedilirken bir hata oluştu");
      await load();
    }
  };

  if (loading) return <div className="p-6">Yükleniyor...</div>;
  if (!section) return <div className="p-6">Bölüm bulunamadı</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{section.title || section.key}</h1>
          <p className="text-xs text-muted-foreground">
            {section.type} • {section.orientation}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard/footer")}>Geri</Button>
        </div>
      </div>

      {/* LEGAL önizleme (ayraç: |) */}
      {section.type === 'LEGAL' && (
        <Card className="p-4">
          <div className="text-sm flex flex-wrap items-center gap-2">
            {sortedItems.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="whitespace-nowrap">{item.label || item.text}</span>
                {idx < sortedItems.length - 1 && (
                  <span className="text-muted-foreground">|</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Items DnD list */}
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b font-medium flex items-center justify-between">
          <span>Öğeler</span>
          <Button size="sm" onClick={openCreateDialog}>Yeni Öğe</Button>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="divide-y">
              {sortedItems.map((item) => (
                <SortableRow key={item.id} id={item.id}>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {item.label || item.text || item.type}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.url}
                      </div>
                      {item.imageUrl && (
                        <div className="mt-2 p-1 border rounded bg-white inline-block">
                          <img
                            src={resolveMediaSrc(item.imageUrl)}
                            alt={item.label || "logo"}
                            className="h-16 w-auto block"
                          />
                        </div>
                      )}
                    </div>

                    {/* IMAGE item için görsel seçici */}
                    {item.type === "IMAGE" && (
                      <div className="flex-shrink-0 w-48">
                        <GlobalMediaSelector
                          buttonText={item.imageUrl ? "Görseli Değiştir" : "Görsel Seç"}
                          defaultCategory="corporate-images"
                          onSelect={async (media: MediaFile) => {
                            try {
                              const storageUrl = normalizeForStorage(media.url || '');
                              await FooterSectionsAPI.updateItem({
                                id: item.id,
                                sectionId: item.sectionId,
                                type: "IMAGE",
                                imageUrl: storageUrl,
                                order: item.order,
                              });
                              toast.success("Görsel güncellendi");
                              // Optimistic UI update
                              setLocalItems((prev) => prev.map((it) => it.id === item.id ? { ...it, imageUrl: storageUrl } : it));
                              await load();
                            } catch (e) {
                              toast.error("Görsel güncellenirken hata oluştu");
                            }
                          }}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                        <Pencil className="w-4 h-4 mr-1" /> Düzenle
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-1" /> Sil</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Öğeyi sil</AlertDialogTitle>
                            <AlertDialogDescription>Bu işlem geri alınamaz.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                try {
                                  await FooterSectionsAPI.removeItem(item.id);
                                  toast.success('Öğe silindi');
                                  await load();
                                } catch (e) {
                                  toast.error('Öğe silinirken hata oluştu');
                                }
                              }}
                            >Sil</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </Card>

      {dirtyOrder && (
        <div className="sticky bottom-4 z-10">
          <div className="mx-auto max-w-5xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-md shadow p-3 flex items-center justify-between">
            <div className="text-sm">Sıralama değiştirildi. Kaydetmek ister misiniz?</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => load()}>İptal</Button>
              <Button onClick={persistOrder}>Kaydet</Button>
            </div>
          </div>
        </div>
      )}

      {/* Yeni/Düzenle Öğe Modalı */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogMode === 'create' ? 'Yeni Öğe' : 'Öğeyi Düzenle'}</AlertDialogTitle>
            <AlertDialogDescription>Öğe bilgilerini doldurun.</AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 py-2">
            {/* Tip seçici */}
            <div>
              <Label>Öğe Tipi</Label>
              <Select value={fType} onValueChange={(v) => setFType(v as any)}>
                <SelectTrigger><SelectValue placeholder="Seçin" /></SelectTrigger>
                <SelectContent>
                  {/* Tip seçeneklerini bölüm tipine göre sınırla */}
                  {section?.type === 'CONTACT' ? (
                    <>
                      <SelectItem value="PHONE">Telefon</SelectItem>
                      <SelectItem value="EMAIL">E-posta</SelectItem>
                      <SelectItem value="ADDRESS">Adres</SelectItem>
                    </>
                  ) : section?.type === 'TEXT' ? (
                    <SelectItem value="TEXT">Metin</SelectItem>
                  ) : section?.type === 'IMAGE' ? (
                    <SelectItem value="IMAGE">Görsel</SelectItem>
                  ) : section?.type === 'LEGAL' || section?.type === 'LINKS' ? (
                    <SelectItem value="LINK">Link</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="LINK">Link</SelectItem>
                      <SelectItem value="TEXT">Metin</SelectItem>
                      <SelectItem value="IMAGE">Görsel</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {fType === 'LINK' && (
              <>
                <div>
                  <Label htmlFor="f-label">Başlık</Label>
                  <Input id="f-label" value={fLabel} onChange={(e) => setFLabel(e.target.value)} placeholder="Örn: Site Kullanımı" className={errors.label ? 'border-destructive' : ''} />
                  {errors.label && <p className="text-xs text-destructive mt-1">{errors.label}</p>}
                </div>
                <div>
                  <Label htmlFor="f-url">URL</Label>
                  <Input id="f-url" value={fUrl} onChange={(e) => setFUrl(e.target.value)} placeholder="/site-kullanimi" className={errors.url ? 'border-destructive' : ''} />
                  {errors.url && <p className="text-xs text-destructive mt-1">{errors.url}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Hedef</Label>
                    <Select value={fTarget} onValueChange={(v) => setFTarget(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_self">Aynı sekme</SelectItem>
                        <SelectItem value="_blank">Yeni sekme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Checkbox id="f-external" checked={fExternal} onCheckedChange={(v) => setFExternal(!!v)} />
                    <Label htmlFor="f-external">Dış bağlantı</Label>
                  </div>
                </div>
              </>
            )}

            {/* CONTACT alanları */}
            {(fType === 'PHONE' || fType === 'EMAIL' || fType === 'ADDRESS') && (
              <>
                <div>
                  <Label htmlFor="f-label">Başlık/İçerik</Label>
                  <Input id="f-label" value={fLabel} onChange={(e) => setFLabel(e.target.value)} placeholder="Örn: 0 262 331 0703" className={errors.label ? 'border-destructive' : ''} />
                  {errors.label && <p className="text-xs text-destructive mt-1">{errors.label}</p>}
                </div>
                <div>
                  <Label htmlFor="f-url">URL (opsiyonel)</Label>
                  <Input id="f-url" value={fUrl} onChange={(e) => setFUrl(e.target.value)} placeholder="tel:+902623310703" className={errors.url ? 'border-destructive' : ''} />
                  {errors.url && <p className="text-xs text-destructive mt-1">{errors.url}</p>}
                </div>
                <div>
                  <Label htmlFor="f-icon">İkon</Label>
                  <Input id="f-icon" value={fIcon} onChange={(e) => setFIcon(e.target.value)} placeholder="Örn: phone, mail, map-pin" />
                </div>
              </>
            )}

            {/* TEXT alanı */}
            {fType === 'TEXT' && (
              <div>
                <Label htmlFor="f-text">Metin</Label>
                <Input id="f-text" value={fText} onChange={(e) => setFText(e.target.value)} placeholder="Düz metin girin" className={errors.text ? 'border-destructive' : ''} />
                {errors.text && <p className="text-xs text-destructive mt-1">{errors.text}</p>}
              </div>
            )}

            {/* IMAGE not: görsel seçimi satırda MediaSelector ile yapılıyor; burada opsiyonel URL alanı bırakılabilir */}
            {fType === 'IMAGE' && (
              <div>
                <Label htmlFor="f-url">Tıklama URL (opsiyonel)</Label>
                <Input id="f-url" value={fUrl} onChange={(e) => setFUrl(e.target.value)} placeholder="https://..." />
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <Button onClick={submitDialog}>Kaydet</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
