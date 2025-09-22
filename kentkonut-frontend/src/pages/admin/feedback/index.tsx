import React, { useEffect, useMemo, useState } from 'react';
import type { FeedbackCategory, FeedbackStatus } from '@/types/contact';

interface FeedbackRow {
  id: string;
  category: FeedbackCategory;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  status: FeedbackStatus;
  createdAt: string;
}

interface ListResponse {
  success: boolean;
  data: FeedbackRow[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

const AdminFeedbackListPage: React.FC = () => {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<FeedbackCategory | ''>('');
  const [status, setStatus] = useState<FeedbackStatus | ''>('');
  const [search, setSearch] = useState('');

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (category) params.set('category', category);
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    return params.toString();
  }, [page, limit, category, status, search]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/feedback?${query}`)
      .then((r) => r.json())
      .then((json: ListResponse) => {
        if (!mounted) return;
        if (json.success) {
          setRows(json.data);
          setTotalPages(json.pagination.pages);
        } else {
          setError('Veriler alınamadı');
        }
      })
      .catch(() => setError('Sunucu hatası'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [query]);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Geri Bildirimler</h1>

      <div className="flex flex-col md:flex-row gap-3 md:items-end mb-4">
        <div>
          <label className="block text-sm font-medium">Kategori</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="border rounded px-2 py-1">
            <option value="">Hepsi</option>
            <option value="REQUEST">İstek</option>
            <option value="SUGGESTION">Öneri</option>
            <option value="COMPLAINT">Şikayet</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Durum</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="border rounded px-2 py-1">
            <option value="">Hepsi</option>
            <option value="NEW">Yeni</option>
            <option value="IN_REVIEW">İncelemede</option>
            <option value="RESOLVED">Çözüldü</option>
            <option value="CLOSED">Kapalı</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium">Ara</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="Ad, soyad, e-posta, telefon, mesaj..." />
        </div>
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="text-left p-2">Tarih</th>
              <th className="text-left p-2">Kategori</th>
              <th className="text-left p-2">Ad Soyad</th>
              <th className="text-left p-2">E-Posta</th>
              <th className="text-left p-2">Telefon</th>
              <th className="text-left p-2">Durum</th>
              <th className="text-left p-2">Detay</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan={7}>Yükleniyor...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="p-3" colSpan={7}>Kayıt bulunamadı</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-2">{r.category}</td>
                  <td className="p-2">{r.firstName} {r.lastName}</td>
                  <td className="p-2">{r.email || '-'}</td>
                  <td className="p-2">{r.phone || '-'}</td>
                  <td className="p-2">{r.status}</td>
                  <td className="p-2">
                    <a href={`/api/admin/feedback/${r.id}`} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">Görüntüle</a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Sayfa {page} / {totalPages}</div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Önceki</button>
          <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Sonraki</button>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackListPage;
