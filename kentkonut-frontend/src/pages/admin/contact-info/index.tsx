import React, { useEffect, useMemo, useState } from 'react';
import type { ContactInfo } from '@/types/contact';

interface ListResponse {
  success: boolean;
  data: ContactInfo[];
  count: number;
}

const emptyForm: Partial<ContactInfo> = {
  title: '',
  address: '',
  latitude: undefined,
  longitude: undefined,
  mapUrl: '',
  phonePrimary: '',
  phoneSecondary: '',
  email: '',
  workingHours: '',
  socialLinks: undefined,
  isActive: true,
};

const AdminContactInfoPage: React.FC = () => {
  const [items, setItems] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/admin/contact-info');
      const json: ListResponse = await r.json();
      if (json.success) setItems(json.data);
      else setError('Veriler alınamadı');
    } catch (e) {
      setError('Sunucu hatası');
    } finally {
      setLoading(false);
    }
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
  };

  const onNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
  };

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
      if (form.socialLinks) {
        try { payload.socialLinks = JSON.parse(form.socialLinks); } catch {}
      }

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/admin/contact-info/${editingId}` : '/api/admin/contact-info';
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await r.json();
      if (!r.ok || !json.success) throw new Error(json?.error || 'İşlem başarısız');
      await load();
      onNew();
    } catch (e: any) {
      setError(e?.message || 'İşlem başarısız oldu');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    try {
      const r = await fetch(`/api/admin/contact-info/${id}`, { method: 'DELETE' });
      const json = await r.json();
      if (!r.ok || !json.success) throw new Error(json?.error || 'Silme başarısız');
      await load();
    } catch (e: any) {
      alert(e?.message || 'Silme başarısız');
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Bize Ulaşın – İletişim Bilgileri</h1>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 px-4 py-3">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
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
                      <button className="px-2 py-1 border rounded" onClick={() => onEdit(ci)}>Düzenle</button>
                      <button className="px-2 py-1 border rounded" onClick={() => onDelete(ci.id)}>Sil</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border rounded p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{editingId ? 'Düzenle' : 'Yeni Kayıt'}</h2>
            <button className="text-sm text-blue-600" onClick={onNew}>Yeni</button>
          </div>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Başlık</label>
              <input name="title" value={form.title || ''} onChange={onChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Adres</label>
              <textarea name="address" value={form.address || ''} onChange={onChange} className="w-full border rounded px-2 py-1" rows={3} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium">Latitude</label>
                <input name="latitude" value={form.latitude ?? ''} onChange={onChange} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Longitude</label>
                <input name="longitude" value={form.longitude ?? ''} onChange={onChange} className="w-full border rounded px-2 py-1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Harita URL</label>
              <input name="mapUrl" value={form.mapUrl || ''} onChange={onChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium">Telefon 1</label>
                <input name="phonePrimary" value={form.phonePrimary || ''} onChange={onChange} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Telefon 2</label>
                <input name="phoneSecondary" value={form.phoneSecondary || ''} onChange={onChange} className="w-full border rounded px-2 py-1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">E-Posta</label>
              <input name="email" type="email" value={form.email || ''} onChange={onChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Çalışma Saatleri</label>
              <input name="workingHours" value={form.workingHours || ''} onChange={onChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Sosyal Linkler (JSON)</label>
              <textarea name="socialLinks" value={form.socialLinks || ''} onChange={onChange} className="w-full border rounded px-2 py-1" rows={3} placeholder='{"facebook":"https://..."}' />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" name="isActive" checked={!!form.isActive} onChange={onChange} />
              <label htmlFor="isActive" className="text-sm">Aktif</label>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50">
                {submitting ? 'Kaydediliyor...' : (editingId ? 'Güncelle' : 'Oluştur')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminContactInfoPage;
