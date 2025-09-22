import React, { useEffect, useState } from 'react';
import ContactInfoCard from '@/components/contact/ContactInfoCard';
import { ContactInfo, ContactInfoResponse } from '@/types/contact';
import FeedbackForm from '@/components/contact/FeedbackForm';

const BizeUlasin: React.FC = () => {
  const [data, setData] = useState<ContactInfo | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/contact-info', { cache: 'no-store' });
        const json = (await res.json()) as ContactInfoResponse;
        if (!mounted) return;
        if (json.success && json.data.length > 0) {
          // Tek lokasyon: en güncel aktif kaydı al
          setData(json.data[0]);
        }
      } catch (e) {
        setError('İletişim bilgileri alınamadı');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Bize Ulaşın</h1>

      {error && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ContactInfoCard item={loading ? undefined : data} />
        </div>
        <div>
          <FeedbackForm />
        </div>
      </div>
    </div>
  );
};

export default BizeUlasin;
