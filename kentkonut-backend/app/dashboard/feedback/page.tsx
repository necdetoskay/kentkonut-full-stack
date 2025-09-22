'use client';

import React, { useEffect, useMemo, useState } from 'react';

type FeedbackCategory = 'REQUEST' | 'SUGGESTION' | 'COMPLAINT';
type FeedbackStatus = 'NEW' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';

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

import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const trCategory: Record<string, string> = {
  REQUEST: 'İstek',
  SUGGESTION: 'Öneri',
  COMPLAINT: 'Şikayet',
};

const trStatus: Record<string, string> = {
  NEW: 'Yeni',
  IN_REVIEW: 'İncelemede',
  RESOLVED: 'Çözüldü',
  CLOSED: 'Kapalı',
};

export default function FeedbackDashboardPage() {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<FeedbackCategory | ''>('');
  const [status, setStatus] = useState<FeedbackStatus | ''>('');
  const [search, setSearch] = useState('');

  // detail modal state
  const [open, setOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detail, setDetail] = useState<{
    id: string;
    category: FeedbackCategory;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    message: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    status: FeedbackStatus;
    createdAt: string;
  } | null>(null);

  // inline status updating map
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

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
    fetch(`/api/admin/feedback?${query}`, { credentials: 'include' })
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

  const openDetail = async (id: string) => {
    setOpen(true);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const r = await fetch(`/api/admin/feedback/${id}`, { credentials: 'include' });
      const json = await r.json();
      if (r.ok && json?.success) setDetail(json.data);
      else setDetailError(json?.error || 'Kayıt yüklenemedi');
    } catch (e: any) {
      setDetailError(e?.message || 'Sunucu hatası');
    } finally {
      setDetailLoading(false);
    }
  };

  const changeRowStatus = async (id: string, newStatus: FeedbackStatus) => {
    // optimistic UI: update local copy, revert on failure
    const prevRows = rows.slice();
    const idx = rows.findIndex((r) => r.id === id);
    if (idx >= 0) {
      const prev = rows[idx].status;
      const nextRows = rows.slice();
      nextRows[idx] = { ...nextRows[idx], status: newStatus };
      setRows(nextRows);
      setUpdating((m) => ({ ...m, [id]: true }));
      try {
        const r = await fetch(`/api/admin/feedback/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: newStatus }),
        });
        const json = await r.json();
        if (!r.ok || !json?.success) throw new Error(json?.error || 'Güncelleme başarısız');
      } catch (e) {
        // revert
        const revert = rows.slice();
        if (idx >= 0) revert[idx] = { ...revert[idx], status: prev } as any;
        setRows(prevRows);
        alert((e as any)?.message || 'Durum güncellenemedi');
      } finally {
        setUpdating((m) => ({ ...m, [id]: false }));
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Geri Bildirimler</h1>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 text-red-700 px-4 py-3">{error}</div>
      )}

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

      <div className="overflow-auto border rounded bg-white">
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
                  <td className="p-2">{trCategory[r.category] || r.category}</td>
                  <td className="p-2">{r.firstName} {r.lastName}</td>
                  <td className="p-2">{r.email || '-'}</td>
                  <td className="p-2">{r.phone || '-'}</td>
                  <td className="p-2">
                    <select
                      value={r.status}
                      onChange={(e) => changeRowStatus(r.id, e.target.value as FeedbackStatus)}
                      disabled={!!updating[r.id]}
                      className="border rounded px-2 py-1 text-sm"
                      title="Durumu değiştir"
                    >
                      <option value="NEW">Yeni</option>
                      <option value="IN_REVIEW">İncelemede</option>
                      <option value="RESOLVED">Çözüldü</option>
                      <option value="CLOSED">Kapalı</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => openDetail(r.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 text-gray-700"
                      title="Detayı görüntüle"
                      aria-label="Detayı görüntüle"
                    >
                      <Search className="w-4 h-4" />
                    </button>
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

      {/* Detail Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Geri Bildirim Detayı</DialogTitle>
          </DialogHeader>
          {detailLoading && <div>Yükleniyor...</div>}
          {detailError && <div className="text-red-600">{detailError}</div>}
          {detail && (
            <div className="space-y-2 text-sm">
              <div><b>Tarih:</b> {new Date(detail.createdAt).toLocaleString()}</div>
              <div><b>Kategori:</b> {trCategory[detail.category] || detail.category}</div>
              <div><b>Durum:</b> {trStatus[detail.status] || detail.status}</div>
              <div><b>Ad Soyad:</b> {detail.firstName} {detail.lastName}</div>
              <div><b>E-Posta:</b> {detail.email || '-'}</div>
              <div><b>Telefon:</b> {detail.phone || '-'}</div>
              <div><b>Adres:</b> {detail.address || '-'}</div>
              <div><b>IP:</b> {detail.ipAddress || '-'}</div>
              <div><b>User-Agent:</b> <span className="break-all">{detail.userAgent || '-'}</span></div>
              <div>
                <b>Mesaj:</b>
                <div className="whitespace-pre-wrap p-2 mt-1 border rounded bg-gray-50">{detail.message}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
