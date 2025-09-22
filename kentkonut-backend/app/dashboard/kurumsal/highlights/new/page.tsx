"use client";

import Link from "next/link"
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { GlobalMediaSelector, type GlobalMediaFile } from "@/components/media/GlobalMediaSelector";
import { HighlightsAPI, handleApiError, type HighlightSourceType } from "@/utils/highlightsApi";
import { CorporateAPI } from "@/utils/corporateApi";
import { ArrowLeft, Save, Image as ImageIcon, X as XIcon } from "lucide-react";

interface ExecutiveOption { id: string; name: string; type?: string; }
interface DepartmentOption { id: string; name: string; }

type FormState = {
  order: number;
  isActive: boolean;
  sourceType: HighlightSourceType;
  sourceRefId?: string | null;
  titleOverride?: string | null;
  subtitleOverride?: string | null;
  imageUrl?: string | null;
  routeOverride?: string | null;
};

const SOURCE_TYPES: { value: HighlightSourceType; label: string }[] = [
  { value: "PRESIDENT", label: "Başkan" },
  { value: "GENERAL_MANAGER", label: "Genel Müdür" },
  { value: "DEPARTMENTS", label: "Birimler" },
  { value: "MISSION", label: "Misyon" },
  { value: "VISION", label: "Vizyon" },
  { value: "CUSTOM", label: "Özel (Custom)" },
];

const getPreviewUrl = (url: string | null | undefined): string => {
  if (!url) return "";

  // Aggressively find the "media/" part and use everything after it for a root-relative path.
  const mediaIndex = url.lastIndexOf('media/');
  if (mediaIndex === -1) {
    // If media/ is not found, we cannot construct a valid preview URL.
    return ""; 
  }

  const path = url.substring(mediaIndex);
  return `/${path}`;
};

export default function NewHighlightPage() {
  const router = useRouter();

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<GlobalMediaFile | null>(null);

  const [executives, setExecutives] = useState<ExecutiveOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loadingRefList, setLoadingRefList] = useState(false);

  const [form, setForm] = useState<FormState>({
    order: 0, // Default order, will be updated
    isActive: true,
    sourceType: "CUSTOM",
    sourceRefId: null,
    titleOverride: "",
    subtitleOverride: "",
    imageUrl: "",
    routeOverride: "",
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { items } = await HighlightsAPI.getAll();
        const maxOrder = items.reduce((max, item) => Math.max(max, item.order), -1);
        setForm(prev => ({ ...prev, order: maxOrder + 1 }));
      } catch (error) {
        toast.error("Mevcut sıralama bilgisi alınamadı, varsayılan 0 olarak ayarlandı.");
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchInitialData();
  }, []);

  const requiresRef = useMemo(() => {
    return form.sourceType === "PRESIDENT" || form.sourceType === "GENERAL_MANAGER" || form.sourceType === "DEPARTMENTS";
  }, [form.sourceType]);

  const defaultMediaCategory = useMemo(() => {
    switch (form.sourceType) {
      case "DEPARTMENTS":
        return "department-images" as const;
      case "PRESIDENT":
      case "GENERAL_MANAGER":
      case "MISSION":
      case "VISION":
        return "corporate-images" as const;
      case "CUSTOM":
      default:
        return "general" as const;
    }
  }, [form.sourceType]);

  useEffect(() => {
    const loadRefList = async () => {
      setLoadingRefList(true);
      try {
        if (form.sourceType === "PRESIDENT" || form.sourceType === "GENERAL_MANAGER") {
          const res = await CorporateAPI.executives.getAll({ type: form.sourceType });
          const list = Array.isArray(res) ? res : (res?.data ?? []);
          setExecutives(list.map((e: any) => ({ id: String(e.id), name: e.name, type: e.type })));
        } else if (form.sourceType === "DEPARTMENTS") {
          const res = await CorporateAPI.departments.getAll();
          const list = Array.isArray(res) ? res : (res?.data ?? []);
          setDepartments(list.map((d: any) => ({ id: String(d.id), name: d.name })));
        } else {
          setExecutives([]);
          setDepartments([]);
        }
      } catch (error) {
        const { message } = (error as any)?.message ? (error as any) : handleApiError(error);
        console.error("Ref list load error:", error);
        toast.error(message || "Referans listesi yüklenemedi");
      } finally {
        setLoadingRefList(false);
      }
    };
    loadRefList();
  }, [form.sourceType]);

  const handleMediaSelect = (media: GlobalMediaFile) => {
    setSelectedMedia(media);
    setForm((prev) => ({ ...prev, imageUrl: media.url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.sourceType) {
      toast.error("Tür seçimi zorunludur");
      return;
    }

    if (requiresRef && !form.sourceRefId) {
      toast.error("Seçilen tür için bir referans seçmelisiniz");
      return;
    }

    // Clean the URL before validation and saving
    const cleanedImageUrl = form.imageUrl
      ? (() => {
          const mediaIndex = form.imageUrl.lastIndexOf('media/');
          if (mediaIndex === -1) return null;
          return form.imageUrl.substring(mediaIndex);
        })()
      : null;

    if (!cleanedImageUrl) {
      toast.error("Lütfen geçerli bir görsel seçiniz");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        order: Number(form.order) || 0,
        isActive: !!form.isActive,
        sourceType: form.sourceType,
        sourceRefId: requiresRef ? form.sourceRefId || null : null,
        titleOverride: form.titleOverride?.trim() || null,
        subtitleOverride: form.subtitleOverride?.trim() || null,
        imageMode: "CUSTOM",
        imageUrl: cleanedImageUrl, // Save the cleaned URL
        routeOverride: form.routeOverride?.trim() || null,
      };

      await HighlightsAPI.create(payload as any);

      toast.success("Kayıt oluşturuldu");
      router.push("/dashboard/kurumsal/highlights");
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message || "Kayıt oluşturulamadı");
    } finally {
      setSaving(false);
    }
  };

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
            <BreadcrumbLink asChild>
              <Link href="/dashboard/kurumsal/highlights">Öne Çıkanlar</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Yeni</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between mt-6 mb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Geri
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Yeni Öne Çıkan</h1>
            <p className="text-sm text-muted-foreground">Anasayfada görünecek bir öne çıkan kaydı ekleyin.</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={saving || loadingInitial}>
          <Save className="mr-2 h-4 w-4" /> Kaydet
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kaynak ve Metinler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tür</Label>
                  <Select
                    value={form.sourceType}
                    onValueChange={(v) => setForm((p) => ({ ...p, sourceType: v as HighlightSourceType, sourceRefId: null }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tür seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {requiresRef && (
                  <div>
                    <Label>Referans</Label>
                    {form.sourceType === "DEPARTMENTS" ? (
                      <Select
                        disabled={loadingRefList}
                        value={form.sourceRefId || undefined}
                        onValueChange={(v) => setForm((p) => ({ ...p, sourceRefId: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={loadingRefList ? "Yükleniyor..." : "Birim seçin"} />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select
                        disabled={loadingRefList}
                        value={form.sourceRefId || undefined}
                        onValueChange={(v) => setForm((p) => ({ ...p, sourceRefId: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={loadingRefList ? "Yükleniyor..." : "Yönetici seçin"} />
                        </SelectTrigger>
                        <SelectContent>
                          {executives.map((e) => (
                            <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Başlık (opsiyonel)</Label>
                  <Input
                    value={form.titleOverride ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, titleOverride: e.target.value }))}
                    placeholder="Özel başlık yazın"
                  />
                </div>
                <div>
                  <Label>Alt Başlık (opsiyonel)</Label>
                  <Input
                    value={form.subtitleOverride ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, subtitleOverride: e.target.value }))}
                    placeholder="Özel alt başlık yazın"
                  />
                </div>
              </div>

              <div>
                <Label>Yönlendirme (opsiyonel)</Label>
                <Input
                  value={form.routeOverride ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, routeOverride: e.target.value }))}
                  placeholder="Örn: /hakkimizda veya https://..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Görsel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Özel Görsel</Label>
                <div className="relative w-full h-48 rounded-md border border-dashed flex items-center justify-center">
                  {form.imageUrl ? (
                    <>
                      <img src={getPreviewUrl(form.imageUrl)} alt="Seçili görsel" className="h-full w-full object-contain rounded-md" />
                      <div className="absolute top-2 right-2">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            setSelectedMedia(null);
                            setForm((p) => ({ ...p, imageUrl: "" }));
                          }}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="mx-auto h-8 w-8" />
                      <p>Görsel seçilmedi</p>
                    </div>
                  )}
                </div>
                <GlobalMediaSelector
                  onSelect={handleMediaSelect}
                  acceptedTypes={["image/*"]}
                  defaultCategory={defaultMediaCategory}
                  selectedMedia={selectedMedia}
                  trigger={
                    <Button type="button" variant="outline" className="w-full">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {form.imageUrl ? "Görseli Değiştir" : "Görsel Seç"}
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Yayınlama</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Aktif</Label>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
                />
              </div>
              <div>
                <Label>Sıra</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
                  disabled={loadingInitial}
                />
              </div>
              <Button className="w-full" onClick={handleSubmit} disabled={saving || loadingInitial}>
                <Save className="mr-2 h-4 w-4" /> Kaydet
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}