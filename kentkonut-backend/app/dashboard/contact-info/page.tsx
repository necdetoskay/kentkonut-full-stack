'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ContactInfo {
  id: string;
  title?: string | null;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  mapUrl?: string | null;
  phonePrimary?: string | null;
  phoneSecondary?: string | null;
  email?: string | null;
  workingHours?: string | null;
  socialLinks?: Record<string, string> | null;
  isActive: boolean;
  updatedAt: string;
}

interface ListResponse {
  success: boolean;
  data: ContactInfo[];
  count: number;
}

export default function ContactInfoDashboardPage() {
  const [items, setItems] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    title: '', address: '', latitude: '', longitude: '', mapUrl: '',
    phonePrimary: '', phoneSecondary: '', email: '', workingHours: '',
    socialLinks: '', isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/admin/contact-info', { credentials: 'include' });
      const text = await r.text();
      let json: any = null;
      try { json = JSON.parse(text); } catch {}
      if (r.ok && json?.success) setItems(json.data as ContactInfo[]);
      else setError(json?.error || `Veriler alınamadı (${r.status})`);
    } catch (e: any) {
      setError(e?.message || 'Sunucu hatası');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onEdit = (ci: ContactInfo) => {
    setEditingId(ci.id);
    setForm({
      title: ci.title || '',
      address: ci.address || '',
      latitude: ci.latitude ?? '',
      longitude: ci.longitude ?? '',
      mapUrl: ci.mapUrl || '',
      phonePrimary: ci.phonePrimary || '',
      phoneSecondary: ci.phoneSecondary || '',
      email: ci.email || '',
      workingHours: ci.workingHours || '',
      socialLinks: ci.socialLinks ? JSON.stringify(ci.socialLinks, null, 2) : '',
      isActive: ci.isActive,
    });
    setOpen(true);
  };
  const onNew = () => { setEditingId(null); setForm({ title: '', address: '', latitude: '', longitude: '', mapUrl: '', phonePrimary: '', phoneSecondary: '', email: '', workingHours: '', socialLinks: '', isActive: true }); setOpen(true); };
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: any = {
        title: form.title || undefined,
        address: form.address,
        latitude: form.latitude !== '' ? Number(form.latitude) : undefined,
        longitude: form.longitude !== '' ? Number(form.longitude) : undefined,
        mapUrl: form.mapUrl || undefined,
        phonePrimary: form.phonePrimary || undefined,
        phoneSecondary: form.phoneSecondary || undefined,
        email: form.email || undefined,
        workingHours: form.workingHours || undefined,
        isActive: !!form.isActive,
      };
      if (form.socialLinks) { try { payload.socialLinks = JSON.parse(form.socialLinks); } catch {} }
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/admin/contact-info/${editingId}` : '/api/admin/contact-info';
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await r.json();
      if (!r.ok || !json.success) throw new Error(json?.error || 'İşlem başarısız');
      await load();
      onNew();
    } catch (e: any) {
      setError(e?.message || 'İşlem başarısız oldu');
    } finally { setSubmitting(false); }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    try {
      const r = await fetch(`/api/admin/contact-info/${id}`, { method: 'DELETE' });
      const json = await r.json();
      if (!r.ok || !json.success) throw new Error(json?.error || 'Silme başarısız');
      await load();
    } catch (e: any) { alert(e?.message || 'Silme başarısız'); }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">İletişim Bilgileri</h1>
        <p className="text-sm text-gray-600">Bize Ulaşın sayfasında gösterilen içerik.</p>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 text-red-700 px-4 py-3">{error}</div>}

      <div className="flex items-center justify-between mb-3">
        <div />
        <Button onClick={onNew}>Yeni Kayıt</Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="overflow-auto border rounded bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Başlık</th>
                <th className="text-left p-2">Adres</th>
                <th className="text-left p-2">Tel</th>
                <th className="text-left p-2">E-Posta</th>
                <th className="text-left p-2">Aktif</th>
                <th className="text-left p-2">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-3" colSpan={6}>Yükleniyor...</td></tr>
              ) : items.length === 0 ? (
                <tr><td className="p-3" colSpan={6}>Kayıt yok</td></tr>
              ) : (
                items.map((ci) => (
                  <tr key={ci.id} className="border-t">
                    <td className="p-2">{ci.title || '-'}</td>
                    <td className="p-2">{ci.address.slice(0, 60)}{ci.address.length > 60 ? '…' : ''}</td>
                    <td className="p-2">{ci.phonePrimary || '-'}</td>
                    <td className="p-2">{ci.email || '-'}</td>
                    <td className="p-2">{ci.isActive ? 'Evet' : 'Hayır'}</td>
                    <td className="p-2 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(ci)}>Düzenle</Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(ci.id)}>Sil</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Kayıt Düzenle' : 'Yeni Kayıt'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Başlık</label>
              <input name="title" value={form.title} onChange={onChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Adres</label>
              <textarea name="address" value={form.address} onChange={onChange} className="w-full border rounded px-2 py-1" rows={3} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium">Latitude</label>
                <input name="latitude" value={form.latitude} onChange={onChange} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Longitude</label>
                <input name="longitude" value={form.longitude} onChange={onChange} className="w-full border rounded px-2 py-1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Harita URL</label>
              <input name="mapUrl" value={form.mapUrl} onChange={onChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium">Telefon 1</label>
                <input name="phonePrimary" value={form.phonePrimary} onChange={onChange} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Telefon 2</label>
                <input name="phoneSecondary" value={form.phoneSecondary} onChange={onChange} className="w-full border rounded px-2 py-1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">E-Posta</label>
              <input name="email" type="email" value={form.email} onChange={onChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Çalışma Saatleri</label>
              <input name="workingHours" value={form.workingHours} onChange={onChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Sosyal Linkler (JSON)</label>
              <textarea name="socialLinks" value={form.socialLinks} onChange={onChange} className="w-full border rounded px-2 py-1" rows={3} placeholder='{"facebook":"https://..."}' />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" name="isActive" checked={!!form.isActive} onChange={onChange} />
              <label htmlFor="isActive" className="text-sm">Aktif</label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>İptal</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Kaydediliyor...' : (editingId ? 'Güncelle' : 'Oluştur')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
