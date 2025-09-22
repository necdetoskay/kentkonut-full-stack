import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import { getHafriyatSahalarWithParams } from '../services/hafriyatService';

type HafriyatSaha = {
  id: string;
  ad: string;
  durum: 'DEVAM_EDIYOR' | 'TAMAMLANDI';
  ilerlemeyuzdesi: number;
  tonBasiUcret: number | string; // Prisma Decimal may serialize as string
  kdvOrani: number;
  bolge?: { id: string; ad: string };
};

const formatPriceTl = (value: number | string) => {
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return String(value);
  return `${new Intl.NumberFormat('tr-TR').format(num)} TL`;
};

const durumLabel = (d: HafriyatSaha['durum']) => {
  switch (d) {
    case 'TAMAMLANDI':
      return 'Tamamlandı';
    case 'DEVAM_EDIYOR':
    default:
      return 'Devam Ediyor';
  }
};

export default function UcretTarifeleri() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['hafriyat-sahalar', 'tarifeler'],
    queryFn: async () => {
      // Yalnızca devam eden sahaları listele
      const res = await getHafriyatSahalarWithParams('durum=DEVAM_EDIYOR&limit=100');
      // apiClient wraps json in { success, data }
      // backend returns { success, data: { sahalar, sayfalama } }
      return (res?.data?.data?.sahalar ?? res?.data?.sahalar ?? []) as HafriyatSaha[];
    },
  });

  const rows = useMemo(() => (data ?? []).filter(s => s), [data]);

  return (
    <div>
      <Helmet>
        <title>Ücret Tarifeleri - Hafriyat Sahaları | Kent Konut</title>
        <meta name="description" content="Hafriyat sahaları güncel ton başı ücret tarifeleri ve doluluk oranları." />
      </Helmet>

      {/* Hafriyat sayfasındaki gibi üstte görsel arkaplan */}
      <Navbar backgroundImage="/images/antet_hafriyat.jpg" />

      <div className="container mx-auto px-4 py-10 mt-24">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#0b244c] mb-6">Ücret Tarifeleri</h1>

      {isLoading && (
        <div className="text-gray-500">Yükleniyor...</div>
      )}

      {isError && (
        <div className="text-red-600">Veri alınamadı: {(error as Error)?.message || 'Bilinmeyen hata'}</div>
      )}

      {!isLoading && !isError && (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">SAHALAR</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Şu Anki Durumu</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Doluluk Oranı</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Alınan Ücret (TL/TON)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {rows.map((saha) => (
                <tr key={saha.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{saha.ad}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{durumLabel(saha.durum)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">%{saha.ilerlemeyuzdesi}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatPriceTl(saha.tonBasiUcret)} + KDV
                    {typeof saha.kdvOrani === 'number' ? ` (KDV %${saha.kdvOrani})` : ''}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-sm text-gray-500" colSpan={4}>Kayıt bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
}


