import React, { useEffect, useState } from 'react';
import type { FeedbackCategory, FeedbackStatus } from '@/types/contact';

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

interface DetailResponse {
  success: boolean;
  data: FeedbackDetail;
}

const AdminFeedbackDetailPage: React.FC = () => {
  const [data, setData] = useState<FeedbackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<FeedbackStatus | ''>('');

  const id = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : undefined;

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    setLoading(true);
    fetch(`/api/admin/feedback/${id}`)
      .then((r) => r.json())
      .then((json: DetailResponse) => {
        if (!mounted) return;
        if (json.success) {
          setData(json.data);
          setStatus(json.data.status);
        } else setError('Kayıt bulunamadı');
      })
      .catch(() => setError('Sunucu hatası'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [id]);

  const onUpdateStatus = async () => {
    if (!id || !status) return;
    try {
      const r = await fetch(`/api/admin/feedback/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await r.json();
      if (!r.ok || !json.success) throw new Error(json?.error || 'Güncelleme başarısız');
      alert('Durum güncellendi');
    } catch (e: any) {
      alert(e?.message || 'Güncelleme başarısız');
    }
  };

  if (loading) return <div className="p-4">Yükleniyor...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!data) return <div className="p-4">Kayıt bulunamadı</div>;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-2xl font-bold">Geri Bildirim Detay</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="p-4 border rounded bg-white">
            <div className="mb-2 text-sm text-gray-500">ID: {data.id}</div>
            <div className="mb-1"><b>Kategori:</b> {data.category}</div>
            <div className="mb-1"><b>Ad Soyad:</b> {data.firstName} {data.lastName}</div>
            <div className="mb-1"><b>E-Posta:</b> {data.email || '-'}</div>
            <div className="mb-1"><b>Telefon:</b> {data.phone || '-'}</div>
            <div className="mb-1"><b>Adres:</b> {data.address || '-'}</div>
            <div className="mb-1"><b>Tarih:</b> {new Date(data.createdAt).toLocaleString()}</div>
            <div className="mb-1"><b>IP:</b> {data.ipAddress || '-'}</div>
            <div className="mb-3"><b>Agent:</b> <span className="break-all">{data.userAgent || '-'}</span></div>
            <div className="mb-1"><b>Mesaj:</b></div>
            <div className="whitespace-pre-wrap p-3 border rounded bg-gray-50">{data.message}</div>
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
                        {' '}<a href={a.media.url} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">Görüntüle</a>
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
            <button className="mt-2 px-4 py-2 rounded bg-primary text-white" onClick={onUpdateStatus}>Kaydet</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackDetailPage;
