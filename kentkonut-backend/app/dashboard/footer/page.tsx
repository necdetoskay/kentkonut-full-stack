"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from 'lucide-react';
import { FooterSectionsAPI, handleApiError } from '@/utils/footerApi';
// import { GlobalMediaSelector, MediaFile } from '@/components/media/GlobalMediaSelector';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FooterSection {
  id: string;
  key: string;
  title?: string | null;
  type: 'LINKS' | 'IMAGE' | 'CONTACT' | 'TEXT' | 'LEGAL';
  orientation: 'VERTICAL' | 'HORIZONTAL';
  order: number;
  isActive: boolean;
  items: any[];
}

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab'
  } as React.CSSProperties;
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default function FooterManagementPage() {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<'newSection' | 'editSection' | null>(null);
  const [search, setSearch] = useState('');
  const [dirtyOrder, setDirtyOrder] = useState(false);
  const [filterType, setFilterType] = useState<FooterSection['type'] | 'ALL'>('ALL');
  const [filterActive, setFilterActive] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // New/Edit Section dialog state
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editTarget, setEditTarget] = useState<FooterSection | null>(null);
  const [fKey, setFKey] = useState('');
  const [fTitle, setFTitle] = useState('');
  const [fType, setFType] = useState<FooterSection['type']>('LINKS');
  const [fOrientation, setFOrientation] = useState<FooterSection['orientation']>('VERTICAL');
  const [fActive, setFActive] = useState<boolean>(true);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // DnD handlers
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const current = sections.slice().sort((a,b) => a.order - b.order);
    const oldIndex = current.findIndex(s => s.id === active.id);
    const newIndex = current.findIndex(s => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(current, oldIndex, newIndex).map((s, idx) => ({ ...s, order: idx }));
    setSections(reordered);
    setDirtyOrder(true);
  };

  // Items DnD/sorting will be on detail page

  // Fetch initial data
  async function fetchFooterData() {
    setLoading(true);
    try {
      const data = await FooterSectionsAPI.list();
      setSections(data);
    } catch (error) {
      toast.error('Footer bölümleri yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFooterData();
  }, []);

  // Handlers
  const handleSave = async () => {
    // This would be a more complex function to save all changes, 
    // including order, new items, etc.
    // For now, we'll handle saves individually.
    toast.info("Sıralama kaydetme henüz implemente edilmedi.");
  };

  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Footer Yönetimi</h1>
          <p className="text-muted-foreground">Footer bölümlerini (Genel/Hizmetler/Orta Görsel/İletişim/Düz Metin/Alt Bağlantılar) yönetin.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Bölüm ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Tip" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tümü</SelectItem>
              <SelectItem value="LINKS">LINKS</SelectItem>
              <SelectItem value="IMAGE">IMAGE</SelectItem>
              <SelectItem value="CONTACT">CONTACT</SelectItem>
              <SelectItem value="TEXT">TEXT</SelectItem>
              <SelectItem value="LEGAL">LEGAL</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterActive} onValueChange={(v) => setFilterActive(v as any)}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Durum" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tümü</SelectItem>
              <SelectItem value="ACTIVE">Aktif</SelectItem>
              <SelectItem value="INACTIVE">Pasif</SelectItem>
            </SelectContent>
          </Select>
          <Button
            disabled={sections.length >= 6}
            onClick={() => {
              setFormMode('create');
              setEditTarget(null);
              setFKey('');
              setFTitle('');
              setFType('LINKS');
              setFOrientation('VERTICAL');
              setFActive(true);
              setDialogContent('newSection');
              setDialogOpen(true);
            }}
          >Yeni Bölüm</Button>
        </div>
      </div>

      {loading ? <p>Yükleniyor...</p> : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={sections.sort((a,b) => a.order - b.order).map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y rounded-md border">
              {sections
                .sort((a,b) => a.order - b.order)
                .filter(s => (s.title || s.key).toLowerCase().includes(search.toLowerCase()))
                .filter(s => filterType === 'ALL' ? true : s.type === filterType)
                .filter(s => filterActive === 'ALL' ? true : (filterActive === 'ACTIVE' ? s.isActive : !s.isActive))
                .map(section => (
                  <SortableRow key={section.id} id={section.id}>
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{section.title || section.key}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${section.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                            {section.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">{section.type} • {section.orientation}</div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Checkbox
                            id={`active-${section.id}`}
                            checked={section.isActive}
                            onCheckedChange={async (v) => {
                              try {
                                await FooterSectionsAPI.update({
                                  id: section.id,
                                  key: section.key,
                                  title: section.title || undefined,
                                  type: section.type,
                                  orientation: section.orientation,
                                  order: section.order,
                                  isActive: !!v,
                                });
                                toast.success('Durum güncellendi');
                                fetchFooterData();
                              } catch (e) {
                                const { message } = handleApiError(e);
                                toast.error(message || 'Durum güncellenemedi');
                              }
                            }}
                          />
                          <label htmlFor={`active-${section.id}`}>Aktif</label>
                        </div>
                        <Link href={`/dashboard/footer/sections/${section.id}`} className="inline-flex">
                          <Button variant="secondary" size="sm">Detaya Git</Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormMode('edit');
                            setEditTarget(section);
                            setFKey(section.key);
                            setFTitle(section.title || '');
                            setFType(section.type);
                            setFOrientation(section.orientation);
                            setFActive(section.isActive);
                            setDialogContent('editSection');
                            setDialogOpen(true);
                          }}
                        >Düzenle</Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">Sil</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Bölümü sil</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu işlem geri alınamaz. Bölüm ve içindeki tüm öğeler silinecek.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  try {
                                    await FooterSectionsAPI.remove(section.id);
                                    toast.success('Bölüm silindi');
                                    fetchFooterData();
                                  } catch (e) {
                                    toast.error('Bölüm silinirken bir hata oluştu');
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
      )}

      {dirtyOrder && (
        <div className="sticky bottom-4 z-10">
          <div className="mx-auto max-w-5xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-md shadow p-3 flex items-center justify-between">
            <div className="text-sm">Bölüm sırası değiştirildi. Kaydetmek ister misiniz?</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => { fetchFooterData(); setDirtyOrder(false); }}>İptal</Button>
              <Button onClick={async () => {
                try {
                  const payload = sections.slice().sort((a,b) => a.order - b.order).map(s => ({ id: s.id, order: s.order }));
                  await FooterSectionsAPI.reorder(payload);
                  toast.success('Bölüm sırası kaydedildi');
                  setDirtyOrder(false);
                  fetchFooterData();
                } catch {
                  toast.error('Sıralama kaydedilirken hata oluştu');
                }
              }}>Kaydet</Button>
            </div>
          </div>
        </div>
      )}

      {/* Bölüm detayları artık /dashboard/footer/sections/[id] sayfasında yönetiliyor. */}

      {/* Yeni/Düzenle Bölüm Diyaloğu */}
      <AlertDialog open={dialogOpen && (dialogContent === 'newSection' || dialogContent === 'editSection')} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{formMode === 'create' ? 'Yeni Bölüm' : 'Bölümü Düzenle'}</AlertDialogTitle>
            <AlertDialogDescription>Bölüm bilgilerini doldurun.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="f-key">Key</Label>
              <Input id="f-key" value={fKey} onChange={(e) => setFKey(e.target.value)} placeholder="ör: general_links_1" disabled={formMode==='edit'} />
            </div>
            <div>
              <Label htmlFor="f-title">Başlık</Label>
              <Input id="f-title" value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="ör: Genel" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Tip</Label>
                <Select value={fType} onValueChange={(v) => setFType(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LINKS">LINKS</SelectItem>
                    <SelectItem value="IMAGE">IMAGE</SelectItem>
                    <SelectItem value="CONTACT">CONTACT</SelectItem>
                    <SelectItem value="TEXT">TEXT</SelectItem>
                    <SelectItem value="LEGAL">LEGAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Yön</Label>
                <Select value={fOrientation} onValueChange={(v) => setFOrientation(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VERTICAL">VERTICAL</SelectItem>
                    <SelectItem value="HORIZONTAL">HORIZONTAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Durum</Label>
                <Select value={fActive ? '1' : '0'} onValueChange={(v) => setFActive(v==='1')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Aktif</SelectItem>
                    <SelectItem value="0">Pasif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  if (formMode === 'create') {
                    await FooterSectionsAPI.create({
                      key: fKey,
                      title: fTitle || undefined,
                      type: fType,
                      orientation: fOrientation,
                      isActive: fActive,
                      order: sections.length,
                    });
                    toast.success('Bölüm oluşturuldu');
                  } else if (editTarget) {
                    await FooterSectionsAPI.update({
                      id: editTarget.id,
                      key: fKey,
                      title: fTitle || undefined,
                      type: fType,
                      orientation: fOrientation,
                      isActive: fActive,
                      order: editTarget.order,
                    });
                    toast.success('Bölüm güncellendi');
                  }
                  setDialogOpen(false);
                  fetchFooterData();
                } catch (e: any) {
                  const { message } = handleApiError(e);
                  toast.error(message || 'İşlem sırasında hata oluştu');
                }
              }}
            >Kaydet</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
