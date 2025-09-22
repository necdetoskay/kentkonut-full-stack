'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Eye, ArrowLeft } from 'lucide-react';

type FeedbackCategory = 'REQUEST' | 'SUGGESTION' | 'COMPLAINT';
type FeedbackStatus = 'NEW' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';

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

interface FeedbackDetail {
  id: string;
  category: FeedbackCategory;
  firstName: string;
  lastName: string;
  nationalId?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  message: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  status: FeedbackStatus;
  createdAt: string;
  attachments?: { id: string; title?: string | null; media?: { id: string; url?: string | null; filename?: string | null } }[];
}

export default function FeedbackDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [data, setData] = useState<FeedbackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<FeedbackStatus>('NEW');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetch(`/api/admin/feedback/${id}`, { credentials: 'include' });
        const json = await r.json();
        if (!mounted) return;
        if (r.ok && json?.success) {
          setData(json.data);
          setStatus(json.data.status);
        } else setError(json?.error || 'Kayıt bulunamadı');
      } catch (e: any) {
        setError(e?.message || 'Sunucu hatası');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const onUpdateStatus = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/admin/feedback/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const json = await r.json();
      if (!r.ok || !json?.success) throw new Error(json?.error || 'Güncelleme başarısız');
    } catch (e: any) {
      alert(e?.message || 'Güncelleme başarısız');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Yükleniyor...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6">Kayıt bulunamadı</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Geri Bildirim Detay</h1>
          <p className="text-sm text-gray-600">ID: {data.id}</p>
        </div>
        <a href="/dashboard/feedback" className="inline-flex items-center text-blue-600 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Listeye dön
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="p-4 border rounded bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div><b>Kategori:</b> {trCategory[data.category] || data.category}</div>
              <div><b>Durum:</b> {trStatus[data.status] || data.status}</div>
              <div><b>Ad Soyad:</b> {data.firstName} {data.lastName}</div>
              <div><b>Tarih:</b> {new Date(data.createdAt).toLocaleString()}</div>
              <div><b>E-Posta:</b> {data.email || '-'}</div>
              <div><b>Telefon:</b> {data.phone || '-'}</div>
              <div className="md:col-span-2"><b>Adres:</b> {data.address || '-'}</div>
              <div><b>IP:</b> {data.ipAddress || '-'}</div>
              <div className="md:col-span-2"><b>User-Agent:</b> <span className="break-all">{data.userAgent || '-'}</span></div>
            </div>
            <div className="mt-3">
              <div className="mb-1"><b>Mesaj:</b></div>
              <div className="whitespace-pre-wrap p-3 border rounded bg-gray-50">{data.message}</div>
            </div>
          </div>

          {!!data.attachments?.length && (
            <div className="p-4 border rounded bg-white">
              <h2 className="text-lg font-semibold mb-2">Ekler</h2>
              <ul className="list-disc pl-5 space-y-1">
                {data.attachments!.map((a) => (
                  <li key={a.id}>
                    {a.title || 'Ek'} – {a.media?.filename || a.media?.id}
                    {a.media?.url && (
                      <>
                        {' '}<a href={a.media.url} className="text-blue-600 hover:underline inline-flex items-center" target="_blank" rel="noreferrer">
                          <Eye className="w-4 h-4 mr-1" /> Görüntüle
                        </a>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="p-4 border rounded bg-white">
            <h2 className="text-lg font-semibold mb-2">Durum Güncelle</h2>
            <select value={status} onChange={(e) => setStatus(e.target.value as FeedbackStatus)} className="border rounded px-2 py-1 w-full">
              <option value="NEW">Yeni</option>
              <option value="IN_REVIEW">İncelemede</option>
              <option value="RESOLVED">Çözüldü</option>
              <option value="CLOSED">Kapalı</option>
            </select>
            <button className="mt-2 px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50" disabled={saving} onClick={onUpdateStatus}>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
